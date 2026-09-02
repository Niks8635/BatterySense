from typing import TypeVar, Generic, Optional
from pydantic import BaseModel
from enum import Enum
from app.utils.helpers import get_timestamp

T = TypeVar('T')

class MetricValue(BaseModel, Generic[T]):
    value: Optional[T] = None
    available: bool = False
    source: Optional[str] = None
    timestamp: str

class HealthStatus(str, Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"

def create_metric(value: Optional[T], source: Optional[str] = None) -> MetricValue[T]:
    if value is None:
        return MetricValue(value=None, available=False, source=None, timestamp=get_timestamp())
    return MetricValue(value=value, available=True, source=source, timestamp=get_timestamp())
