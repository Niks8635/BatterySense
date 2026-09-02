import platform
import socket
import wmi
import psutil
import pythoncom
from app.models.system import SystemResponse, OsInfo, ProcessorInfo, LaptopInfo, MemoryInfo


def _init_com():
    try:
        pythoncom.CoInitializeEx(pythoncom.COINIT_MULTITHREADED)
    except Exception:
        try:
            pythoncom.CoInitialize()
        except Exception:
            pass


class SystemService:
    def __init__(self):
        self._cache = None

    def get_system_info(self) -> SystemResponse:
        if self._cache:
            return self._cache

        os_info = OsInfo(
            name=platform.system(),
            version=platform.version(),
            build=platform.release(),
            architecture=platform.machine(),
            hostname=socket.gethostname(),
        )

        proc_name = platform.processor()
        manufacturer = "Unknown"
        model = "Unknown"
        bios_version = "Unknown"

        try:
            _init_com()
            w = wmi.WMI()

            cs = w.Win32_ComputerSystem()
            if cs:
                manufacturer = cs[0].Manufacturer
                model = cs[0].Model

            bios = w.Win32_BIOS()
            if bios:
                bios_version = bios[0].SMBIOSBIOSVersion

            if not proc_name:
                procs = w.Win32_Processor()
                if procs:
                    proc_name = procs[0].Name
        except Exception:
            pass

        physical_cores = 0
        logical_processors = 0
        try:
            physical_cores = psutil.cpu_count(logical=False) or 0
            logical_processors = psutil.cpu_count(logical=True) or 0
        except Exception:
            pass

        freq_current = 0.0
        freq_max = 0.0
        try:
            freq = psutil.cpu_freq()
            if freq:
                freq_current = freq.current
                freq_max = freq.max
        except Exception:
            pass

        proc_info = ProcessorInfo(
            name=proc_name or "Unknown",
            physical_cores=physical_cores,
            logical_processors=logical_processors,
            frequency_current=freq_current,
            frequency_max=freq_max,
        )

        laptop_info = LaptopInfo(
            manufacturer=manufacturer,
            model=model,
            bios_version=bios_version,
        )

        mem_total = 0
        mem_available = 0
        mem_used = 0
        try:
            mem = psutil.virtual_memory()
            mem_total = mem.total
            mem_available = mem.available
            mem_used = mem.used
        except Exception:
            pass

        mem_info = MemoryInfo(
            total=mem_total,
            available=mem_available,
            used=mem_used,
        )

        self._cache = SystemResponse(
            os=os_info,
            processor=proc_info,
            laptop=laptop_info,
            memory=mem_info,
        )
        return self._cache
