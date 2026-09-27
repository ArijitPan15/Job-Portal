"""
Seed script to populate canonical skills, test candidates, recruiters, and jobs.
Run via: python seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile, UserRole, CandidateProfile, RecruiterProfile, CandidateSkill, EducationLevel, ProficiencyLevel
from jobs.models import Skill, SkillCategory, Job, JobSkill, JobType


def run_seed():
    print("🌱 Seeding SkillMatch database...")

    # 1. Master Skills Catalog
    skills_data = [
        ("Python", SkillCategory.BACKEND),
        ("Django", SkillCategory.BACKEND),
        ("PostgreSQL", SkillCategory.DATABASE),
        ("REST API", SkillCategory.BACKEND),
        ("Docker", SkillCategory.DEVOPS),
        ("Redis", SkillCategory.DATABASE),
        ("Celery", SkillCategory.BACKEND),
        ("React", SkillCategory.FRONTEND),
        ("TypeScript", SkillCategory.FRONTEND),
        ("AWS", SkillCategory.DEVOPS),
        ("Kubernetes", SkillCategory.DEVOPS),
        ("Linux", SkillCategory.DEVOPS),
        ("Git", SkillCategory.GENERAL),
        ("FastAPI", SkillCategory.BACKEND),
        ("Tailwind CSS", SkillCategory.FRONTEND),
        ("CI/CD", SkillCategory.DEVOPS),
    ]

    skill_objs = {}
    for name, cat in skills_data:
        s, _ = Skill.objects.get_or_create(name=name, defaults={'category': cat})
        skill_objs[name] = s
    print(f"✓ Created {len(skill_objs)} canonical skills")

    # 2. Recruiter User
    recruiter_user, created = User.objects.get_or_create(
        username="sarah_recruiter",
        defaults={
            "email": "sarah@nextech.io",
            "first_name": "Sarah",
            "last_name": "Jenkins"
        }
    )
    recruiter_user.set_password("RecruiterPass123!")
    recruiter_user.save()

    prof, _ = Profile.objects.get_or_create(user=recruiter_user)
    prof.role = UserRole.RECRUITER
    prof.save()

    rec_prof, _ = RecruiterProfile.objects.get_or_create(
        user=recruiter_user,
        defaults={
            "company_name": "NexTech Cloud Solutions",
            "company_website": "https://nextech.example.io",
            "company_description": "Building high-performance distributed cloud software.",
            "location": "San Francisco, CA & Remote"
        }
    )
    print("✓ Recruiter account ready (Username: sarah_recruiter / Password: RecruiterPass123!)")

    # 3. Candidate 1 (Alex - The prompt benchmark profile!)
    alex_user, _ = User.objects.get_or_create(
        username="alex_dev",
        defaults={
            "email": "alex@devmail.com",
            "first_name": "Alex",
            "last_name": "Chen"
        }
    )
    alex_user.set_password("CandidatePass123!")
    alex_user.save()

    alex_prof, _ = Profile.objects.get_or_create(user=alex_user)
    alex_prof.role = UserRole.CANDIDATE
    alex_prof.save()

    alex_cand, _ = CandidateProfile.objects.get_or_create(
        user=alex_user,
        defaults={
            "headline": "Python & Django Backend Engineer",
            "bio": "Passionate backend engineer with 4 years building scalable REST APIs and relational database architectures.",
            "years_of_experience": 4,
            "education_level": EducationLevel.BACHELOR,
        }
    )

    # Alex has: Python, Django, PostgreSQL, REST API (Missing: Docker, Redis)
    alex_skills = [
        ("Python", ProficiencyLevel.EXPERT, 4),
        ("Django", ProficiencyLevel.ADVANCED, 4),
        ("PostgreSQL", ProficiencyLevel.ADVANCED, 3),
        ("REST API", ProficiencyLevel.EXPERT, 4),
        ("Git", ProficiencyLevel.ADVANCED, 4),
    ]
    for sk_name, prof_lvl, yrs in alex_skills:
        CandidateSkill.objects.get_or_create(
            candidate=alex_cand,
            skill=skill_objs[sk_name],
            defaults={"proficiency": prof_lvl, "years_practiced": yrs}
        )
    print("✓ Candidate Alex ready (Username: alex_dev / Password: CandidatePass123!)")

    # 4. Candidate 2 (Jordan - DevOps specialist)
    jordan_user, _ = User.objects.get_or_create(
        username="jordan_devops",
        defaults={
            "email": "jordan@cloud.com",
            "first_name": "Jordan",
            "last_name": "Rivera"
        }
    )
    jordan_user.set_password("CandidatePass123!")
    jordan_user.save()

    j_prof, _ = Profile.objects.get_or_create(user=jordan_user)
    j_prof.role = UserRole.CANDIDATE
    j_prof.save()

    j_cand, _ = CandidateProfile.objects.get_or_create(
        user=jordan_user,
        defaults={
            "headline": "DevOps & Site Reliability Engineer",
            "bio": "Cloud architect specializing in containerization, CI/CD, and Kubernetes orchestration.",
            "years_of_experience": 5,
            "education_level": EducationLevel.MASTER,
        }
    )

    jordan_skills = [
        ("Docker", ProficiencyLevel.EXPERT, 5),
        ("Kubernetes", ProficiencyLevel.ADVANCED, 4),
        ("Linux", ProficiencyLevel.EXPERT, 5),
        ("AWS", ProficiencyLevel.ADVANCED, 4),
        ("Python", ProficiencyLevel.INTERMEDIATE, 3),
        ("CI/CD", ProficiencyLevel.EXPERT, 4),
    ]
    for sk_name, prof_lvl, yrs in jordan_skills:
        CandidateSkill.objects.get_or_create(
            candidate=j_cand,
            skill=skill_objs[sk_name],
            defaults={"proficiency": prof_lvl, "years_practiced": yrs}
        )
    print("✓ Candidate Jordan ready (Username: jordan_devops / Password: CandidatePass123!)")

    # 5. Job 1: The flagship job from the prompt!
    job1, _ = Job.objects.get_or_create(
        recruiter=recruiter_user,
        title="Senior Backend Engineer (Python / Django)",
        defaults={
            "company_name": "NexTech Cloud Solutions",
            "location": "Remote (US/Global)",
            "job_type": JobType.FULL_TIME,
            "min_experience_years": 3,
            "min_education_level": EducationLevel.BACHELOR,
            "salary_range": "$120,000 - $150,000",
            "description": (
                "We are seeking an experienced Backend Engineer to scale our core microservices.\n"
                "You will design secure RESTful APIs, optimize PostgreSQL queries, and leverage Redis caching.\n"
                "Our stack is Python, Django, PostgreSQL, Docker, Redis, and Celery."
            ),
            "is_active": True
        }
    )

    # Job 1 requires: Python, Django, PostgreSQL, REST API, Docker, Redis
    job1_reqs = [
        ("Python", True, 2),
        ("Django", True, 2),
        ("PostgreSQL", True, 1),
        ("REST API", True, 1),
        ("Docker", True, 1),
        ("Redis", True, 1),
        ("Celery", False, 1), # Nice to have
    ]
    for sk_name, is_req, wt in job1_reqs:
        JobSkill.objects.get_or_create(
            job=job1,
            skill=skill_objs[sk_name],
            defaults={"is_required": is_req, "weight": wt}
        )
    print("✓ Job 1 created: Senior Backend Engineer (Python, Django, PostgreSQL, REST API, Docker, Redis)")

    # 6. Job 2: Cloud DevOps Engineer
    job2, _ = Job.objects.get_or_create(
        recruiter=recruiter_user,
        title="Cloud Infrastructure & DevOps Engineer",
        defaults={
            "company_name": "NexTech Cloud Solutions",
            "location": "Remote",
            "job_type": JobType.FULL_TIME,
            "min_experience_years": 4,
            "min_education_level": EducationLevel.BACHELOR,
            "salary_range": "$130,000 - $160,000",
            "description": "Lead our cloud infrastructure automation, CI/CD pipelines, and Kubernetes deployments.",
            "is_active": True
        }
    )

    job2_reqs = [
        ("Docker", True, 2),
        ("Kubernetes", True, 2),
        ("AWS", True, 2),
        ("Linux", True, 1),
        ("CI/CD", True, 1),
        ("Python", False, 1),
    ]
    for sk_name, is_req, wt in job2_reqs:
        JobSkill.objects.get_or_create(
            job=job2,
            skill=skill_objs[sk_name],
            defaults={"is_required": is_req, "weight": wt}
        )
    print("✓ Job 2 created: Cloud Infrastructure & DevOps Engineer")

    print("\n✅ Seed complete! All benchmark models and data initialized.")


if __name__ == '__main__':
    run_seed()
