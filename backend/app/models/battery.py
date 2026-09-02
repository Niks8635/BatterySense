from typing import Optional
from pydantic import BaseModel
from app.models.common import MetricValue, HealthStatus

class BatteryResponse(BaseModel):
    percentage: MetricValue[int]
    is_charging: MetricValue[bool]
    power_plugged: MetricValue[bool]
    design_capacity: MetricValue[int]
    full_charge_capacity: MetricValue[int]
    health_percent: MetricValue[float]
    health_status: MetricValue[HealthStatus]
    wear_percent: MetricValue[float]
    cycle_count: MetricValue[int]
    voltage: MetricValue[int]
    temperature: MetricValue[float]
    estimated_runtime_seconds: MetricValue[int]
    charge_rate: MetricValue[int]
