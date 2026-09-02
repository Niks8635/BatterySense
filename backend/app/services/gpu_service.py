import subprocess
import wmi
import pythoncom
from app.models.performance import GpuResponse
from app.models.common import create_metric


def _init_com():
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except Exception:
        try:
            pythoncom.CoInitialize()
        except Exception:
            pass


class GpuService:
    def get_gpu_info(self) -> GpuResponse:
        name = None
        usage_percent = None
        memory_total = None
        memory_used = None
        temperature = None

        try:
            _init_com()
            w = wmi.WMI()
            gpus = w.Win32_VideoController()
            if gpus:
                gpu = gpus[0]
                name = gpu.Name
                try:
                    memory_total = int(gpu.AdapterRAM)
                except (ValueError, TypeError):
                    pass
        except Exception:
            pass

        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=utilization.gpu,temperature.gpu,memory.used,memory.total",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=2,
            )
            if result.returncode == 0:
                parts = result.stdout.strip().split(",")
                if len(parts) == 4:
                    usage_percent = float(parts[0].strip())
                    temperature = float(parts[1].strip())
                    memory_used = int(parts[2].strip()) * 1024 * 1024
                    memory_total_nv = int(parts[3].strip()) * 1024 * 1024
                    if memory_total is None:
                        memory_total = memory_total_nv
        except Exception:
            pass

        return GpuResponse(
            name=create_metric(name, "wmi"),
            usage_percent=create_metric(usage_percent, "nvidia-smi"),
            memory_total=create_metric(memory_total, "wmi/nvidia"),
            memory_used=create_metric(memory_used, "nvidia-smi"),
            temperature=create_metric(temperature, "nvidia-smi"),
        )
