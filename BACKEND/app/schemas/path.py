from pydantic import BaseModel, ConfigDict
import enum

class SkillStatus(str, enum.Enum):
    LOCKED = "locked"
    AVAILABLE = "available"
    COMPLETED = "completed"

class SkillPathResponse(BaseModel):
    id: int
    title: str
    icon: str
    status: SkillStatus
    crown_level: int
    
    model_config = ConfigDict(from_attributes=True)

class UnitResponse(BaseModel):
    id: int
    title: str
    color_theme: str
    skills: list[SkillPathResponse]
    
    model_config = ConfigDict(from_attributes=True)

class PathResponse(BaseModel):
    units: list[UnitResponse]
    
    model_config = ConfigDict(from_attributes=True)
