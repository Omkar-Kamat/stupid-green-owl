from app.models.domain import SkillProgress, ProgressStatus, Skill
from app.repositories.progress_repository import ProgressRepository
from app.repositories.lesson_repository import LessonRepository

class ProgressService:
    def __init__(self, progress_repo: ProgressRepository, lesson_repo: LessonRepository):
        self.progress_repo = progress_repo
        self.lesson_repo = lesson_repo

    def handle_lesson_completed(self, user_id: int, skill: Skill, xp_reward: int) -> bool:
        progress = self.progress_repo.get_skill_progress(user_id, skill.id)
        if not progress:
            progress = SkillProgress(
                user_id=user_id,
                skill_id=skill.id,
                status=ProgressStatus.available,
                crown_level=0,
                lessons_completed_in_level=0,
                xp_earned=0
            )
            self.progress_repo.create_skill_progress(progress)
            
        progress.xp_earned += xp_reward
        progress.lessons_completed_in_level += 1
        
        crown_earned = False
        if progress.lessons_completed_in_level >= skill.lessons_per_level:
            progress.lessons_completed_in_level = 0
            progress.crown_level += 1
            crown_earned = True
            
            if progress.crown_level == 1:
                progress.status = ProgressStatus.completed
                next_skill = self.lesson_repo.get_next_skill(skill.id)
                if next_skill:
                    next_progress = self.progress_repo.get_skill_progress(user_id, next_skill.id)
                    if not next_progress:
                        next_progress = SkillProgress(
                            user_id=user_id,
                            skill_id=next_skill.id,
                            status=ProgressStatus.available,
                            crown_level=0,
                            lessons_completed_in_level=0,
                            xp_earned=0
                        )
                        self.progress_repo.create_skill_progress(next_progress)
                    elif next_progress.status == ProgressStatus.locked:
                        next_progress.status = ProgressStatus.available
                        
        return crown_earned
