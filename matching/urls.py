from django.urls import path
from . import views

app_name = 'matching'

urlpatterns = [
    path('job/<int:job_id>/', views.skill_gap_detail_view, name='gap_detail'),
    path('api/job/<int:job_id>/', views.skill_gap_api_view, name='gap_api'),
    path('job/<int:job_id>/candidate/<int:candidate_id>/', views.recruiter_candidate_match_view, name='recruiter_candidate_match'),
]
