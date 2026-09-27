from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import Profile, UserRole, CandidateProfile, CandidateSkill, EducationLevel, ProficiencyLevel
from jobs.models import Skill, Job, JobSkill, SkillCategory, JobType
from matching.services import JobMatchingService


class MatchingEngineTestCase(TestCase):
    def setUp(self):
        # 1. Create skills
        self.skills = {}
        for name in ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker', 'Redis']:
            self.skills[name] = Skill.objects.create(name=name, category=SkillCategory.BACKEND)

        # 2. Recruiter & Job
        self.recruiter_user = User.objects.create_user(username='recruiter_test', password='password123')
        self.job = Job.objects.create(
            recruiter=self.recruiter_user,
            title='Senior Backend Engineer',
            company_name='TestCorp',
            min_experience_years=3,
            min_education_level=EducationLevel.BACHELOR,
            job_type=JobType.FULL_TIME
        )
        # All 6 required
        for skill in self.skills.values():
            JobSkill.objects.create(job=self.job, skill=skill, is_required=True)

        # 3. Candidate Alex (4 skills: Python, Django, PostgreSQL, REST API)
        self.cand_user = User.objects.create_user(username='alex_test', password='password123')
        self.cand_profile = CandidateProfile.objects.create(
            user=self.cand_user,
            headline='Backend Engineer',
            years_of_experience=4,
            education_level=EducationLevel.BACHELOR
        )
        for name in ['Python', 'Django', 'PostgreSQL', 'REST API']:
            CandidateSkill.objects.create(
                candidate=self.cand_profile,
                skill=self.skills[name],
                proficiency=ProficiencyLevel.ADVANCED,
                years_practiced=3
            )

    def test_alex_match_score_and_gap(self):
        """Verifies candidate with 4/6 skills gets 66.7% skill score and exact matched/missing lists."""
        service = JobMatchingService()
        breakdown = service.calculate_match(self.cand_profile, self.job)

        # 4 out of 6 required skills matched
        self.assertEqual(len(breakdown.matched_skills), 4)
        self.assertIn('Python', breakdown.matched_skills)
        self.assertIn('Django', breakdown.matched_skills)
        self.assertIn('PostgreSQL', breakdown.matched_skills)
        self.assertIn('REST API', breakdown.matched_skills)

        # 2 missing skills
        self.assertEqual(len(breakdown.missing_skills), 2)
        self.assertIn('Docker', breakdown.missing_skills)
        self.assertIn('Redis', breakdown.missing_skills)

        # Skill score: 4/6 * 100 = 66.7%
        self.assertAlmostEqual(breakdown.skill_score, 66.7, places=1)

        # Experience score: 4 yrs >= 3 yrs required -> 100%
        self.assertEqual(breakdown.experience_score, 100.0)

        # Education score: Bachelor >= Bachelor -> 100%
        self.assertEqual(breakdown.education_score, 100.0)

        # Weighted total: (66.7 * 0.6) + (100 * 0.2) + (100 * 0.2) = 40.0 + 20.0 + 20.0 = 80.0%
        self.assertAlmostEqual(breakdown.total_score, 80.0, places=1)
