from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserRole(models.TextChoices):
    CANDIDATE = 'candidate', 'Job Candidate'
    RECRUITER = 'recruiter', 'Recruiter / Employer'


class EducationLevel(models.TextChoices):
    HIGH_SCHOOL = 'high_school', 'High School'
    ASSOCIATE = 'associate', 'Associate Degree'
    BACHELOR = 'bachelor', "Bachelor's Degree"
    MASTER = 'master', "Master's Degree"
    DOCTORATE = 'doctorate', 'Doctorate / PhD'


class Profile(models.Model):
    """Base profile linked 1-to-1 with Django auth User to define roles."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CANDIDATE,
        db_index=True
    )
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_candidate(self) -> bool:
        return self.role == UserRole.CANDIDATE

    @property
    def is_recruiter(self) -> bool:
        return self.role == UserRole.RECRUITER

    def __str__(self) -> str:
        return f"{self.user.username} ({self.get_role_display()})"


class CandidateProfile(models.Model):
    """Detailed profile data for job seekers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    headline = models.CharField(max_length=150, blank=True, help_text="e.g. Senior Backend Engineer | Django & Cloud")
    bio = models.TextField(blank=True)
    years_of_experience = models.PositiveIntegerField(default=0, help_text="Total years of professional experience")
    education_level = models.CharField(
        max_length=30,
        choices=EducationLevel.choices,
        default=EducationLevel.BACHELOR
    )
    skills = models.ManyToManyField('jobs.Skill', through='CandidateSkill', related_name='candidates')
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Candidate: {self.user.get_full_name() or self.user.username}"


class RecruiterProfile(models.Model):
    """Profile data for recruiters and employers."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=120)
    company_website = models.URLField(blank=True)
    company_description = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Recruiter: {self.company_name} ({self.user.username})"


class ProficiencyLevel(models.TextChoices):
    BEGINNER = 'beginner', 'Beginner'
    INTERMEDIATE = 'intermediate', 'Intermediate'
    ADVANCED = 'advanced', 'Advanced'
    EXPERT = 'expert', 'Expert'


class CandidateSkill(models.Model):
    """
    Explicit through-model between CandidateProfile and Skill.
    Enables storing proficiency level and verified experience per skill.
    """
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='candidate_skills')
    skill = models.ForeignKey('jobs.Skill', on_delete=models.CASCADE, related_name='skill_candidates')
    proficiency = models.CharField(
        max_length=20,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.INTERMEDIATE
    )
    years_practiced = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('candidate', 'skill')

    def __str__(self) -> str:
        return f"{self.candidate.user.username} - {self.skill.name} ({self.proficiency})"


@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    """Signal to ensure Profile and specific role profile exist."""
    if created:
        Profile.objects.create(user=instance)
