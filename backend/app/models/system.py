from pydantic import BaseModel

class OsInfo(BaseModel):
    name: str
    version: str
    build: str
    architecture: str
    hostname: str

class ProcessorInfo(BaseModel):
    name: str
    physical_cores: int
    logical_processors: int
    frequency_current: float
    frequency_max: float

class LaptopInfo(BaseModel):
    manufacturer: str
    model: str
    bios_version: str

class MemoryInfo(BaseModel):
    total: int
    available: int
    used: int

class SystemResponse(BaseModel):
    os: OsInfo
    processor: ProcessorInfo
    laptop: LaptopInfo
    memory: MemoryInfo
