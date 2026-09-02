import psutil
from app.models.storage import StorageResponse, DriveInfo

class DiskService:
    def get_disk_info(self) -> StorageResponse:
        drives = []
        try:
            partitions = psutil.disk_partitions(all=False)
            for part in partitions:
                if 'cdrom' in part.opts or part.fstype == '':
                    continue
                try:
                    usage = psutil.disk_usage(part.mountpoint)
                    drives.append(DriveInfo(
                        device=part.device,
                        mountpoint=part.mountpoint,
                        fstype=part.fstype,
                        total=usage.total,
                        used=usage.used,
                        free=usage.free,
                        percent=usage.percent
                    ))
                except PermissionError:
                    continue
        except Exception:
            pass
            
        return StorageResponse(drives=drives)
