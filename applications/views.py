from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden
from jobs.models import Job
from .models import Application, ApplicationStatus
from matching.services import JobMatchingService


@login_required
def apply_job_view(request: HttpRequest, job_id: int) -> HttpResponse:
    """Candidate submits application with automated snapshot of match score."""
    if not hasattr(request.user, 'candidate_profile'):
        messages.error(request, "Only job candidates can submit applications.")
        return redirect('jobs:job_detail', job_id=job_id)

    job = get_object_or_404(Job, id=job_id, is_active=True)

    # Check for existing application
    if Application.objects.filter(candidate=request.user, job=job).exists():
        messages.warning(request, "You have already applied for this job.")
        return redirect('jobs:job_detail', job_id=job.id)

    if request.method == 'POST':
        cover_letter = request.POST.get('cover_letter', '').strip()

        # Compute transparent match score snapshot at time of applying
        candidate_profile = request.user.candidate_profile
        matching_service = JobMatchingService()
        breakdown = matching_service.calculate_match(candidate_profile, job)

        Application.objects.create(
            candidate=request.user,
            job=job,
            cover_letter=cover_letter,
            match_score_snapshot=breakdown.total_score,
            matched_skills_count=len(breakdown.matched_skills),
            missing_skills_count=len(breakdown.missing_skills),
            status=ApplicationStatus.SUBMITTED
        )

        messages.success(
            request,
            f"Application submitted successfully for {job.title}! Match score: {breakdown.total_score}%"
        )
        return redirect('applications:candidate_applications')

    # GET displays confirmation & breakdown before submitting
    candidate_profile = request.user.candidate_profile
    matching_service = JobMatchingService()
    breakdown = matching_service.calculate_match(candidate_profile, job)

    return render(request, 'applications/apply_confirm.html', {
        'job': job,
        'breakdown': breakdown,
    })


@login_required
def candidate_applications_view(request: HttpRequest) -> HttpResponse:
    """Displays tracking dashboard for candidate's applied jobs."""
    if not hasattr(request.user, 'candidate_profile'):
        messages.error(request, "Candidate account required.")
        return redirect('jobs:job_list')

    applications = Application.objects.filter(
        candidate=request.user
    ).select_related('job', 'job__recruiter').order_by('-applied_at')

    return render(request, 'applications/candidate_applications.html', {
        'applications': applications,
    })


@login_required
def recruiter_job_applications_view(request: HttpRequest, job_id: int) -> HttpResponse:
    """Recruiter reviews all applicants for their job with match scores."""
    job = get_object_or_404(Job, id=job_id, recruiter=request.user)

    applications = Application.objects.filter(job=job).select_related(
        'candidate', 'candidate__candidate_profile'
    ).order_by('-match_score_snapshot')

    return render(request, 'applications/recruiter_applications.html', {
        'job': job,
        'applications': applications,
        'status_choices': ApplicationStatus.choices,
    })


@login_required
def update_application_status_view(request: HttpRequest, application_id: int) -> HttpResponse:
    """Updates applicant pipeline status (Under Review, Shortlisted, etc.)."""
    application = get_object_or_404(
        Application.objects.select_related('job'),
        id=application_id,
        job__recruiter=request.user
    )

    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in ApplicationStatus.values:
            application.status = new_status
            application.save()
            messages.success(
                request,
                f"Status for applicant {application.candidate.username} updated to '{application.get_status_display()}'."
            )
        else:
            messages.error(request, "Invalid status choice.")

    return redirect('applications:recruiter_job_applications', job_id=application.job.id)
