from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden
from .models import Job, Skill, JobSkill
from .forms import JobForm, AddJobSkillForm, JobFilterForm
from matching.services import JobMatchingService
from applications.models import Application


def job_list_view(request: HttpRequest) -> HttpResponse:
    """Lists jobs with filter search and dynamic candidate match scoring."""
    jobs_qs = Job.objects.filter(is_active=True).select_related('recruiter').prefetch_related('job_skills__skill')

    query = request.GET.get('q', '').strip()
    job_type = request.GET.get('job_type', '').strip()
    min_match_param = request.GET.get('min_match', '').strip()

    if query:
        jobs_qs = jobs_qs.filter(
            Q(title__icontains=query) |
            Q(company_name__icontains=query) |
            Q(description__icontains=query) |
            Q(job_skills__skill__name__icontains=query)
        ).distinct()

    if job_type:
        jobs_qs = jobs_qs.filter(job_type=job_type)

    matching_service = JobMatchingService()
    is_candidate = request.user.is_authenticated and hasattr(request.user, 'candidate_profile')
    candidate_profile = request.user.candidate_profile if is_candidate else None

    # Attach match scores if candidate is logged in
    enriched_jobs = []
    for job in jobs_qs:
        breakdown = None
        has_applied = False
        if is_candidate and candidate_profile:
            breakdown = matching_service.calculate_match(candidate_profile, job)
            has_applied = Application.objects.filter(candidate=request.user, job=job).exists()

        enriched_jobs.append({
            'job': job,
            'breakdown': breakdown,
            'has_applied': has_applied,
        })

    # Sort or filter by match score if requested
    if is_candidate and min_match_param.isdigit():
        min_score = float(min_match_param)
        enriched_jobs = [item for item in enriched_jobs if item['breakdown'] and item['breakdown'].total_score >= min_score]

    if is_candidate:
        enriched_jobs.sort(
            key=lambda x: x['breakdown'].total_score if x['breakdown'] else 0,
            reverse=True
        )

    filter_form = JobFilterForm(request.GET)

    return render(request, 'jobs/job_list.html', {
        'enriched_jobs': enriched_jobs,
        'filter_form': filter_form,
        'is_candidate': is_candidate,
        'query': query,
    })


def job_detail_view(request: HttpRequest, job_id: int) -> HttpResponse:
    job = get_object_or_404(
        Job.objects.select_related('recruiter').prefetch_related('job_skills__skill'),
        id=job_id
    )

    breakdown = None
    existing_application = None
    is_candidate = request.user.is_authenticated and hasattr(request.user, 'candidate_profile')

    if is_candidate:
        matching_service = JobMatchingService()
        breakdown = matching_service.calculate_match(request.user.candidate_profile, job)
        existing_application = Application.objects.filter(candidate=request.user, job=job).first()

    return render(request, 'jobs/job_detail.html', {
        'job': job,
        'breakdown': breakdown,
        'existing_application': existing_application,
        'is_candidate': is_candidate,
    })


@login_required
def job_create_view(request: HttpRequest) -> HttpResponse:
    if not hasattr(request.user, 'profile') or not request.user.profile.is_recruiter:
        messages.error(request, "Only recruiter accounts can post job listings.")
        return redirect('jobs:job_list')

    if request.method == 'POST':
        form = JobForm(request.POST)
        if form.is_valid():
            job = form.save(commit=False)
            job.recruiter = request.user
            job.save()
            messages.success(request, f"Job '{job.title}' posted! Now add required skills.")
            return redirect('jobs:job_skills', job_id=job.id)
    else:
        # Prepopulate company name from recruiter profile if available
        initial_data = {}
        if hasattr(request.user, 'recruiter_profile'):
            initial_data['company_name'] = request.user.recruiter_profile.company_name
            initial_data['location'] = request.user.recruiter_profile.location
        form = JobForm(initial=initial_data)

    return render(request, 'jobs/job_create.html', {'form': form})


@login_required
def job_manage_skills_view(request: HttpRequest, job_id: int) -> HttpResponse:
    job = get_object_or_404(Job, id=job_id, recruiter=request.user)

    if request.method == 'POST' and 'add_skill' in request.POST:
        form = AddJobSkillForm(request.POST)
        if form.is_valid():
            job_skill = form.save(commit=False)
            job_skill.job = job
            job_skill.save()
            messages.success(request, f"Added {job_skill.skill.name} to required skills.")
            return redirect('jobs:job_skills', job_id=job.id)
        else:
            messages.error(request, "Skill is already added or form is invalid.")
    else:
        form = AddJobSkillForm()

    current_skills = job.job_skills.select_related('skill').all()
    return render(request, 'jobs/job_manage_skills.html', {
        'job': job,
        'form': form,
        'current_skills': current_skills,
    })


@login_required
def job_remove_skill_view(request: HttpRequest, job_id: int, skill_id: int) -> HttpResponse:
    job = get_object_or_404(Job, id=job_id, recruiter=request.user)
    job_skill = get_object_or_404(JobSkill, id=skill_id, job=job)
    name = job_skill.skill.name
    job_skill.delete()
    messages.info(request, f"Removed skill: {name}")
    return redirect('jobs:job_skills', job_id=job.id)
