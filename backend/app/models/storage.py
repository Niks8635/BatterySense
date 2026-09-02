from pydantic import BaseModel
from typing import List

class DriveInfo(BaseModel):
    device: str
    mountpoint: str
    fstype: str
    total: int
    used: int
    free: int
    percent: float

class StorageResponse(BaseModel):
    drives: List[DriveInfo]
