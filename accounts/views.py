from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpRequest, HttpResponse
from .forms import (
    UserRegistrationForm,
    CandidateProfileForm,
    RecruiterProfileForm,
    AddCandidateSkillForm
)
from .models import Profile, CandidateProfile, RecruiterProfile, CandidateSkill, UserRole
from jobs.models import Skill


def register_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect('jobs:job_list')

    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to the portal, {user.username}!")
            return redirect('accounts:profile')
    else:
        form = UserRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect('jobs:job_list')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f"Welcome back, {user.username}!")
            next_url = request.GET.get('next', 'jobs:job_list')
            return redirect(next_url)
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request: HttpRequest) -> HttpResponse:
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('jobs:job_list')


@login_required
def profile_view(request: HttpRequest) -> HttpResponse:
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if profile.is_candidate:
        candidate_profile, _ = CandidateProfile.objects.get_or_create(user=user)
        if request.method == 'POST' and 'update_profile' in request.POST:
            profile_form = CandidateProfileForm(request.POST, request.FILES, instance=candidate_profile)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, "Candidate profile updated successfully.")
                return redirect('accounts:profile')
        else:
            profile_form = CandidateProfileForm(instance=candidate_profile)

        skill_form = AddCandidateSkillForm()
        candidate_skills = candidate_profile.candidate_skills.select_related('skill').all()

        return render(request, 'accounts/candidate_profile.html', {
            'profile_form': profile_form,
            'skill_form': skill_form,
            'candidate_skills': candidate_skills,
            'candidate_profile': candidate_profile,
        })
    else:
        recruiter_profile, _ = RecruiterProfile.objects.get_or_create(
            user=user,
            defaults={'company_name': f"{user.username}'s Team"}
        )
        if request.method == 'POST':
            form = RecruiterProfileForm(request.POST, instance=recruiter_profile)
            if form.is_valid():
                form.save()
                messages.success(request, "Recruiter profile updated successfully.")
                return redirect('accounts:profile')
        else:
            form = RecruiterProfileForm(instance=recruiter_profile)

        posted_jobs = user.posted_jobs.all()
        return render(request, 'accounts/recruiter_profile.html', {
            'form': form,
            'posted_jobs': posted_jobs,
            'recruiter_profile': recruiter_profile,
        })


@login_required
def add_candidate_skill_view(request: HttpRequest) -> HttpResponse:
    if not hasattr(request.user, 'candidate_profile'):
        return JsonResponse({'error': 'Candidate profile required'}, status=403)

    if request.method == 'POST':
        form = AddCandidateSkillForm(request.POST)
        if form.is_valid():
            candidate_skill = form.save(commit=False)
            candidate_skill.candidate = request.user.candidate_profile
            candidate_skill.save()
            messages.success(request, f"Added skill: {candidate_skill.skill.name}")
        else:
            messages.error(request, "Skill already exists in your profile or invalid input.")

    return redirect('accounts:profile')


@login_required
def remove_candidate_skill_view(request: HttpRequest, skill_id: int) -> HttpResponse:
    if not hasattr(request.user, 'candidate_profile'):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    cand_skill = get_object_or_404(
        CandidateSkill,
        id=skill_id,
        candidate=request.user.candidate_profile
    )
    skill_name = cand_skill.skill.name
    cand_skill.delete()
    messages.info(request, f"Removed skill: {skill_name}")
    return redirect('accounts:profile')
