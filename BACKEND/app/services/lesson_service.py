from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.path import PathResponse, UnitResponse, SkillPathResponse
from app.core.config import settings

class LessonService:
    def __init__(self, lesson_repo: LessonRepository, progress_repo: ProgressRepository):
        self.lesson_repo = lesson_repo
        self.progress_repo = progress_repo

    def get_path(self, user_id: int) -> PathResponse:
        units = self.lesson_repo.get_course_tree(course_id=settings.DEFAULT_COURSE_ID)
        user_progress = self.progress_repo.get_user_progress(user_id)
        
        unit_responses = []
        is_first_skill_overall = True

        for unit in units:
            sorted_skills = sorted(unit.skills, key=lambda s: s.order_index)
            skill_responses = []
            
            for skill in sorted_skills:
                progress = user_progress.get(skill.id)
                crown_level = progress.crown_level if progress else 0
                
                # Trust the database state if it exists. 
                # Only derive default initial state if no progress record exists.
                if progress:
                    status = progress.status.value
                    is_first_skill_overall = False
                elif is_first_skill_overall:
                    status = "available"
                    is_first_skill_overall = False
                else:
                    status = "locked"
                
                skill_responses.append(
                    SkillPathResponse(
                        id=skill.id,
                        title=skill.title,
                        icon=skill.icon,
                        status=status,
                        crown_level=crown_level
                    )
                )
                
            unit_responses.append(
                UnitResponse(
                    id=unit.id,
                    title=unit.title,
                    color_theme=unit.color_theme,
                    skills=skill_responses
                )
            )
            
        return PathResponse(units=unit_responses)
