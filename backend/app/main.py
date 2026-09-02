import asyncio
import pythoncom
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import router as api_router
from app.api.websocket import router as ws_router
from app.services.analytics_service import analytics_service
from app.services.battery_service import BatteryService
from app.services.cpu_service import CpuService
from app.services.memory_service import MemoryService
from app.services.disk_service import DiskService

battery_service = BatteryService()
cpu_service = CpuService()
memory_service = MemoryService()
disk_service = DiskService()

def _collect_sample_sync():
    """Collects telemetry in a worker thread so the main asyncio event loop is never blocked."""
    try:
        try:
            pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
        except Exception:
            pass

        batt = battery_service.get_battery_info()
        cpu = cpu_service.get_cpu_info()
        mem = memory_service.get_memory_info()
        disk = disk_service.get_disk_info()

        battery_pct = batt.percentage.value if (batt.percentage.available and batt.percentage.value is not None) else None
        power_plugged = 1 if (batt.power_plugged.available and batt.power_plugged.value) else 0
        cpu_usage = cpu.usage_percent.value if (cpu.usage_percent.available and cpu.usage_percent.value is not None) else None
        ram_usage = mem.percent.value if (mem.percent.available and mem.percent.value is not None) else None

        disk_usage = 0.0
        if disk.drives:
            total = sum(d.total for d in disk.drives)
            used = sum(d.used for d in disk.drives)
            if total > 0:
                disk_usage = round((used / total) * 100, 1)

        return (battery_pct, cpu_usage, ram_usage, disk_usage, power_plugged)
    except Exception:
        return None

async def continuous_telemetry_recorder():
    """Background task running continuously, capturing telemetry every 5 seconds without blocking event loop."""
    while True:
        await asyncio.sleep(5)
        sample = await asyncio.to_thread(_collect_sample_sync)
        if sample:
            battery_pct, cpu_usage, ram_usage, disk_usage, power_plugged = sample
            try:
                await analytics_service.record_telemetry(battery_pct, cpu_usage, ram_usage, disk_usage, power_plugged)
            except Exception:
                pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Global COM initialization for the server process
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except Exception:
        pass

    # Initialize SQLite database
    await analytics_service.init_db()

    # Initial baseline sample
    initial = await asyncio.to_thread(_collect_sample_sync)
    if initial:
        b, c, r, d, p = initial
        await analytics_service.record_telemetry(b, c, r, d, p)

    # Launch background telemetry recorder
    recorder_task = asyncio.create_task(continuous_telemetry_recorder())
    yield
    # Shutdown
    recorder_task.cancel()

app = FastAPI(title="BatterySense Backend", lifespan=lifespan)

# Build allowed CORS origins from settings & Netlify regex
cors_origins_list = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
cors_origins_list.extend([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(cors_origins_list)),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.netlify\.app)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
    )

app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/ws")
