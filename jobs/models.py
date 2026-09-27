from django.db import models
from django.contrib.auth.models import User
from accounts.models import EducationLevel


class SkillCategory(models.TextChoices):
    BACKEND = 'backend', 'Backend Development'
    FRONTEND = 'frontend', 'Frontend Development'
    DATABASE = 'database', 'Database & SQL'
    DEVOPS = 'devops', 'DevOps & Cloud'
    DATA_AI = 'data_ai', 'Data Science & AI'
    GENERAL = 'general', 'General Engineering'


class Skill(models.Model):
    """Canonical catalog of technical and functional skills."""
    name = models.CharField(max_length=60, unique=True, db_index=True)
    category = models.CharField(
        max_length=30,
        choices=SkillCategory.choices,
        default=SkillCategory.BACKEND
    )

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class JobType(models.TextChoices):
    FULL_TIME = 'full_time', 'Full Time'
    PART_TIME = 'part_time', 'Part Time'
    CONTRACT = 'contract', 'Contract'
    REMOTE = 'remote', 'Remote'


class Job(models.Model):
    """Job vacancy posting managed by recruiters."""
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=150)
    company_name = models.CharField(max_length=120)
    location = models.CharField(max_length=100, default='Remote')
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.FULL_TIME
    )
    description = models.TextField()
    min_experience_years = models.PositiveIntegerField(
        default=1,
        help_text="Minimum required years of professional experience"
    )
    min_education_level = models.CharField(
        max_length=30,
        choices=EducationLevel.choices,
        default=EducationLevel.BACHELOR
    )
    salary_range = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    skills = models.ManyToManyField(Skill, through='JobSkill', related_name='jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.title} at {self.company_name}"


class JobSkill(models.Model):
    """
    Through-model defining required vs nice-to-have skills for a specific job.
    Used by the matching engine to compute Skill Overlap and Missing Skills.
    """
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='job_requirements')
    is_required = models.BooleanField(
        default=True,
        help_text="If True, included in required skill gap calculation"
    )
    weight = models.PositiveSmallIntegerField(
        default=1,
        help_text="Relative weight/importance of this skill for the job"
    )

    class Meta:
        unique_together = ('job', 'skill')

    def __str__(self) -> str:
        req_tag = "Required" if self.is_required else "Preferred"
        return f"{self.job.title} - {self.skill.name} ({req_tag})"
