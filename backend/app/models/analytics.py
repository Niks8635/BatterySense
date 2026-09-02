from pydantic import BaseModel
from typing import List

class TelemetryRecord(BaseModel):
    timestamp: str
    battery_percentage: float
    cpu_usage: float
    ram_usage: float
    disk_usage: float
    power_plugged: int

class AnalyticsResponse(BaseModel):
    records: List[TelemetryRecord]
    period: str
    count: int
