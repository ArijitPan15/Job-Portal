"""
Rule-Based Job Matching & Skill-Gap Analysis Service.

Transparent, deterministic scoring:
- Skills Match: 60%
- Experience Match: 20%
- Education Match: 20%
"""
from dataclasses import dataclass, field
from typing import List, Set, Dict, Any, Optional
from django.conf import settings
from accounts.models import CandidateProfile, EducationLevel
from jobs.models import Job, JobSkill


EDUCATION_RANK = {
    EducationLevel.HIGH_SCHOOL: 1,
    EducationLevel.ASSOCIATE: 2,
    EducationLevel.BACHELOR: 3,
    EducationLevel.MASTER: 4,
    EducationLevel.DOCTORATE: 5,
}


@dataclass
class MatchBreakdown:
    total_score: float
    skill_score: float
    experience_score: float
    education_score: float

    # Skills detail
    matched_skills: List[str] = field(default_factory=list)
    missing_skills: List[str] = field(default_factory=list)
    preferred_matched: List[str] = field(default_factory=list)
    preferred_missing: List[str] = field(default_factory=list)

    # Transparency reasons
    explanations: List[str] = field(default_factory=list)
    weights: Dict[str, float] = field(default_factory=dict)

    @property
    def is_strong_match(self) -> bool:
        return self.total_score >= 75.0

    @property
    def is_moderate_match(self) -> bool:
        return 50.0 <= self.total_score < 75.0

    @property
    def badge_class(self) -> str:
        if self.total_score >= 75:
            return "bg-success"
        elif self.total_score >= 50:
            return "bg-warning text-dark"
        return "bg-secondary"


class JobMatchingService:
    """Service to calculate transparent match score and skill-gap between candidate and job."""

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        # Allow custom weights or fall back to settings
        self.weights = weights or getattr(settings, 'MATCHING_WEIGHTS', {
            'SKILL': 0.60,
            'EXPERIENCE': 0.20,
            'EDUCATION': 0.20,
        })

    def calculate_match(self, candidate: CandidateProfile, job: Job) -> MatchBreakdown:
        """
        Executes pure rule-based matching:
        1. Set intersection for required and preferred skills.
        2. Ratio of candidate years of experience vs job requirement.
        3. Education rank hierarchy comparison.
        4. Weighted combination.
        """
        explanations = []

        # 1. Skills Evaluation (Set Theory)
        candidate_skills_set = set(
            candidate.candidate_skills.select_related('skill').values_list('skill__name', flat=True)
        )

        job_skills = list(job.job_skills.select_related('skill').all())
        required_skills_set: Set[str] = {js.skill.name for js in job_skills if js.is_required}
        preferred_skills_set: Set[str] = {js.skill.name for js in job_skills if not js.is_required}

        # Intersections & Differences
        matched_required = sorted(list(candidate_skills_set & required_skills_set))
        missing_required = sorted(list(required_skills_set - candidate_skills_set))
        matched_preferred = sorted(list(candidate_skills_set & preferred_skills_set))
        missing_preferred = sorted(list(preferred_skills_set - candidate_skills_set))

        if required_skills_set:
            skill_score = (len(matched_required) / len(required_skills_set)) * 100.0
            explanations.append(
                f"Skill Match: {len(matched_required)} of {len(required_skills_set)} required skills matched "
                f"({skill_score:.1f}%)."
            )
        else:
            skill_score = 100.0
            explanations.append("Skill Match: No specific skills were marked as strictly required (100.0%).")

        # 2. Experience Evaluation
        cand_exp = candidate.years_of_experience
        req_exp = job.min_experience_years

        if req_exp <= 0:
            exp_score = 100.0
            explanations.append("Experience: Entry-level position, requirement satisfied (100.0%).")
        elif cand_exp >= req_exp:
            exp_score = 100.0
            explanations.append(
                f"Experience: Candidate has {cand_exp} yr(s), exceeding required {req_exp} yr(s) (100.0%)."
            )
        else:
            exp_score = (cand_exp / req_exp) * 100.0
            explanations.append(
                f"Experience: Candidate has {cand_exp} yr(s) of {req_exp} required yr(s) ({exp_score:.1f}%)."
            )

        # 3. Education Evaluation
        cand_edu_rank = EDUCATION_RANK.get(candidate.education_level, 1)
        job_edu_rank = EDUCATION_RANK.get(job.min_education_level, 3)

        if cand_edu_rank >= job_edu_rank:
            edu_score = 100.0
            explanations.append(
                f"Education: Candidate holds {candidate.get_education_level_display()}, fulfilling requirement "
                f"({job.get_min_education_level_display()}) (100.0%)."
            )
        elif cand_edu_rank == job_edu_rank - 1:
            edu_score = 60.0
            explanations.append(
                f"Education: Candidate holds {candidate.get_education_level_display()}, one tier below "
                f"{job.get_min_education_level_display()} (60.0%)."
            )
        else:
            edu_score = 30.0
            explanations.append(
                f"Education: Candidate holds {candidate.get_education_level_display()}, significantly below "
                f"{job.get_min_education_level_display()} (30.0%)."
            )

        # 4. Weighted Total
        w_skill = self.weights.get('SKILL', 0.60)
        w_exp = self.weights.get('EXPERIENCE', 0.20)
        w_edu = self.weights.get('EDUCATION', 0.20)

        total_score = round(
            (skill_score * w_skill) + (exp_score * w_exp) + (edu_score * w_edu),
            1
        )

        return MatchBreakdown(
            total_score=total_score,
            skill_score=round(skill_score, 1),
            experience_score=round(exp_score, 1),
            education_score=round(edu_score, 1),
            matched_skills=matched_required,
            missing_skills=missing_required,
            preferred_matched=matched_preferred,
            preferred_missing=missing_preferred,
            explanations=explanations,
            weights={'Skill (60%)': w_skill, 'Experience (20%)': w_exp, 'Education (20%)': w_edu},
        )
