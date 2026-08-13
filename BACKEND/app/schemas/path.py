from pydantic import BaseModel, ConfigDict

class SkillPathResponse(BaseModel):
    id: int
    title: str
    icon: str
    status: str
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
