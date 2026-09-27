from django.db import models
from django.contrib.auth.models import User
from jobs.models import Job


class ApplicationStatus(models.TextChoices):
    SUBMITTED = 'submitted', 'Submitted'
    UNDER_REVIEW = 'under_review', 'Under Review'
    SHORTLISTED = 'shortlisted', 'Shortlisted'
    REJECTED = 'rejected', 'Not Selected'
    ACCEPTED = 'accepted', 'Offer Extended'


class Application(models.Model):
    """Candidate application to a specific job."""
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.SUBMITTED,
        db_index=True
    )
    cover_letter = models.TextField(blank=True)
    match_score_snapshot = models.FloatField(
        default=0.0,
        help_text="Calculated match score percentage (0-100) at time of application"
    )
    matched_skills_count = models.PositiveIntegerField(default=0)
    missing_skills_count = models.PositiveIntegerField(default=0)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-applied_at']

    def __str__(self) -> str:
        return f"{self.candidate.username} -> {self.job.title} ({self.match_score_snapshot:.1f}%)"
