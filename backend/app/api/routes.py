import os
import asyncio
import subprocess
from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse, JSONResponse
from app.services.battery_service import BatteryService
from app.services.cpu_service import CpuService
from app.services.memory_service import MemoryService
from app.services.disk_service import DiskService
from app.services.gpu_service import GpuService
from app.services.system_service import SystemService
from app.services.analytics_service import analytics_service
from app.models.performance import PerformanceResponse

router = APIRouter()

battery_service = BatteryService()
cpu_service = CpuService()
memory_service = MemoryService()
disk_service = DiskService()
gpu_service = GpuService()
system_service = SystemService()

@router.get("/health")
async def get_health():
    """Instant health check directly on event loop."""
    return {"status": "ok"}

@router.get("/status")
async def get_status():
    def _collect():
        return {
            "battery": battery_service.get_battery_info(),
            "cpu": cpu_service.get_cpu_info(),
            "memory": memory_service.get_memory_info()
        }
    return await asyncio.to_thread(_collect)

@router.get("/battery")
async def get_battery():
    return await asyncio.to_thread(battery_service.get_battery_info)

@router.get("/performance", response_model=PerformanceResponse)
async def get_performance():
    def _get_perf():
        return PerformanceResponse(
            cpu=cpu_service.get_cpu_info(),
            memory=memory_service.get_memory_info(),
            gpu=gpu_service.get_gpu_info()
        )
    return await asyncio.to_thread(_get_perf)

@router.get("/system")
async def get_system():
    return await asyncio.to_thread(system_service.get_system_info)

@router.get("/storage")
async def get_storage():
    return await asyncio.to_thread(disk_service.get_disk_info)

@router.get("/analytics")
async def get_analytics(period: str = "1h"):
    return await analytics_service.get_telemetry(period)

@router.delete("/analytics")
async def clear_analytics():
    await analytics_service.clear_all_data()
    return {"status": "success", "message": "Telemetry history cleared"}

@router.post("/analytics/retention")
async def set_retention(hours: int = Query(24, ge=1, le=8760)):
    await analytics_service.cleanup_old_data(hours)
    return {"status": "success", "message": f"Cleaned up data older than {hours} hours"}

@router.get("/battery/report")
async def generate_battery_report():
    output_path = os.path.abspath("battery-report.html")
    def _run_report():
        try:
            subprocess.run(
                ["powercfg", "/batteryreport", "/output", output_path],
                check=True,
                capture_output=True,
                text=True
            )
            return {
                "status": "success",
                "message": "Windows Battery Report generated successfully",
                "path": output_path
            }
        except subprocess.CalledProcessError as e:
            return {
                "status": "error",
                "message": f"Failed to generate battery report: {e.stderr or str(e)}"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    return await asyncio.to_thread(_run_report)

@router.get("/battery/report/content", response_class=HTMLResponse)
async def get_battery_report_content():
    output_path = os.path.abspath("battery-report.html")
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8", errors="replace") as f:
                return HTMLResponse(content=f.read())
        except Exception as e:
            return HTMLResponse(content=f"<p>Error reading report: {e}</p>", status_code=500)
    return HTMLResponse(content="<p>Report not generated yet. Click 'Windows PowerCfg' first.</p>", status_code=404)
