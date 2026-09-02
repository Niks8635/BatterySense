import psutil
import platform
import wmi
import pythoncom
from app.models.performance import CpuResponse
from app.models.common import create_metric


def _init_com():
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except Exception:
        try:
            pythoncom.CoInitialize()
        except Exception:
            pass


class CpuService:
    def get_cpu_info(self) -> CpuResponse:
        try:
            usage_percent = psutil.cpu_percent(interval=0.1, percpu=False)
        except Exception:
            usage_percent = None

        try:
            per_core_usage = psutil.cpu_percent(interval=0.1, percpu=True)
        except Exception:
            per_core_usage = None

        try:
            physical_cores = psutil.cpu_count(logical=False)
        except Exception:
            physical_cores = None

        try:
            logical_processors = psutil.cpu_count(logical=True)
        except Exception:
            logical_processors = None

        freq_current = None
        freq_max = None
        try:
            freq = psutil.cpu_freq()
            if freq:
                freq_current = freq.current
                freq_max = freq.max
        except Exception:
            pass

        name = platform.processor()
        if not name:
            try:
                _init_com()
                w = wmi.WMI()
                procs = w.Win32_Processor()
                if procs:
                    name = procs[0].Name
            except Exception:
                name = None

        temperature = None
        try:
            temps = psutil.sensors_temperatures()
            if temps and 'coretemp' in temps:
                temperature = temps['coretemp'][0].current
        except Exception:
            pass

        return CpuResponse(
            usage_percent=create_metric(usage_percent, "psutil"),
            per_core_usage=create_metric(per_core_usage, "psutil"),
            physical_cores=create_metric(physical_cores, "psutil"),
            logical_processors=create_metric(logical_processors, "psutil"),
            frequency_current=create_metric(freq_current, "psutil"),
            frequency_max=create_metric(freq_max, "psutil"),
            temperature=create_metric(temperature, "psutil"),
            name=create_metric(name, "platform"),
        )
