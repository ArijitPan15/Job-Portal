from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from jobs.models import Job
from accounts.models import CandidateProfile
from .services import JobMatchingService


@login_required
def skill_gap_detail_view(request, job_id: int):
    """HTML view presenting detailed skill-gap breakdown for the logged-in candidate."""
    if not hasattr(request.user, 'candidate_profile'):
        return render(request, 'matching/candidate_profile_required.html', {
            'message': 'Only candidate accounts can run personal skill-gap analysis.'
        })

    job = get_object_or_404(
        Job.objects.prefetch_related('job_skills__skill'),
        id=job_id
    )
    candidate = request.user.candidate_profile
    matching_service = JobMatchingService()
    breakdown = matching_service.calculate_match(candidate, job)

    return render(request, 'matching/gap_analysis.html', {
        'job': job,
        'candidate': candidate,
        'breakdown': breakdown,
    })


@login_required
def skill_gap_api_view(request, job_id: int):
    """AJAX endpoint for instant async skill gap calculations."""
    if not hasattr(request.user, 'candidate_profile'):
        return JsonResponse({'error': 'Candidate profile required'}, status=400)

    job = get_object_or_404(Job, id=job_id)
    candidate = request.user.candidate_profile
    service = JobMatchingService()
    breakdown = service.calculate_match(candidate, job)

    return JsonResponse({
        'total_score': breakdown.total_score,
        'skill_score': breakdown.skill_score,
        'experience_score': breakdown.experience_score,
        'education_score': breakdown.education_score,
        'matched_skills': breakdown.matched_skills,
        'missing_skills': breakdown.missing_skills,
        'preferred_matched': breakdown.preferred_matched,
        'preferred_missing': breakdown.preferred_missing,
        'explanations': breakdown.explanations,
    })


@login_required
def recruiter_candidate_match_view(request, job_id: int, candidate_id: int):
    """View allowing recruiters to inspect the exact match breakdown for an applicant."""
    job = get_object_or_404(Job, id=job_id, recruiter=request.user)
    candidate = get_object_or_404(CandidateProfile, id=candidate_id)

    service = JobMatchingService()
    breakdown = service.calculate_match(candidate, job)

    return render(request, 'matching/recruiter_match_detail.html', {
        'job': job,
        'candidate': candidate,
        'breakdown': breakdown,
    })
