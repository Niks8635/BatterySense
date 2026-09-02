from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.services.battery_service import BatteryService
from app.services.cpu_service import CpuService
from app.services.memory_service import MemoryService
from app.services.disk_service import DiskService
from app.services.gpu_service import GpuService
from app.services.analytics_service import analytics_service
from app.config import settings
import json

router = APIRouter()

battery_service = BatteryService()
cpu_service = CpuService()
memory_service = MemoryService()
disk_service = DiskService()
gpu_service = GpuService()

async def send_telemetry(websocket: WebSocket, metric_type: str, get_data_func, interval: float):
    try:
        while True:
            try:
                data = get_data_func()
                # Pydantic model dump
                await websocket.send_json({"type": metric_type, "data": data.model_dump()})
            except Exception as e:
                pass
            await asyncio.sleep(interval)
    except asyncio.CancelledError:
        pass

async def record_telemetry_task():
    try:
        while True:
            try:
                batt = battery_service.get_battery_info()
                cpu = cpu_service.get_cpu_info()
                mem = memory_service.get_memory_info()
                disk = disk_service.get_disk_info()
                
                battery_pct = batt.percentage.value if batt.percentage.value is not None else 0
                power_plugged = 1 if batt.power_plugged.value else 0
                cpu_usage = cpu.usage_percent.value if cpu.usage_percent.value is not None else 0.0
                ram_usage = mem.percent.value if mem.percent.value is not None else 0.0
                
                # aggregate disk usage
                disk_usage = 0.0
                if disk.drives:
                    total = sum(d.total for d in disk.drives)
                    used = sum(d.used for d in disk.drives)
                    if total > 0:
                        disk_usage = (used / total) * 100
                
                await analytics_service.record_telemetry(battery_pct, cpu_usage, ram_usage, disk_usage, power_plugged)
                
            except Exception as e:
                pass
            
            await asyncio.sleep(10)
    except asyncio.CancelledError:
        pass

@router.websocket("/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    
    tasks = []
    try:
        tasks.append(asyncio.create_task(send_telemetry(websocket, 'cpu', cpu_service.get_cpu_info, settings.TELEMETRY_INTERVAL_CPU)))
        tasks.append(asyncio.create_task(send_telemetry(websocket, 'memory', memory_service.get_memory_info, settings.TELEMETRY_INTERVAL_RAM)))
        tasks.append(asyncio.create_task(send_telemetry(websocket, 'battery', battery_service.get_battery_info, settings.TELEMETRY_INTERVAL_BATTERY)))
        tasks.append(asyncio.create_task(send_telemetry(websocket, 'disk', disk_service.get_disk_info, settings.TELEMETRY_INTERVAL_DISK)))
        tasks.append(asyncio.create_task(send_telemetry(websocket, 'gpu', gpu_service.get_gpu_info, settings.TELEMETRY_INTERVAL_GPU)))
        
        tasks.append(asyncio.create_task(record_telemetry_task()))
        
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        pass
    finally:
        for task in tasks:
            task.cancel()
