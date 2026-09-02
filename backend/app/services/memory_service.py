import psutil
from app.models.performance import MemoryResponse
from app.models.common import create_metric

class MemoryService:
    def get_memory_info(self) -> MemoryResponse:
        try:
            mem = psutil.virtual_memory()
            total = mem.total
            available = mem.available
            used = mem.used
            percent = mem.percent
        except Exception:
            total = None
            available = None
            used = None
            percent = None
            
        return MemoryResponse(
            total=create_metric(total, "psutil"),
            available=create_metric(available, "psutil"),
            used=create_metric(used, "psutil"),
            percent=create_metric(percent, "psutil")
        )
