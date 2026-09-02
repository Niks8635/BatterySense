from pydantic import BaseModel
from typing import List
from app.models.common import MetricValue

class CpuResponse(BaseModel):
    usage_percent: MetricValue[float]
    per_core_usage: MetricValue[List[float]]
    physical_cores: MetricValue[int]
    logical_processors: MetricValue[int]
    frequency_current: MetricValue[float]
    frequency_max: MetricValue[float]
    temperature: MetricValue[float]
    name: MetricValue[str]

class MemoryResponse(BaseModel):
    total: MetricValue[int]
    available: MetricValue[int]
    used: MetricValue[int]
    percent: MetricValue[float]

class GpuResponse(BaseModel):
    name: MetricValue[str]
    usage_percent: MetricValue[float]
    memory_total: MetricValue[int]
    memory_used: MetricValue[int]
    temperature: MetricValue[float]

class PerformanceResponse(BaseModel):
    cpu: CpuResponse
    memory: MemoryResponse
    gpu: GpuResponse
