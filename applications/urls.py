from django.urls import path
from . import views

app_name = 'applications'

urlpatterns = [
    path('apply/<int:job_id>/', views.apply_job_view, name='apply_job'),
    path('my-applications/', views.candidate_applications_view, name='candidate_applications'),
    path('job/<int:job_id>/review/', views.recruiter_job_applications_view, name='recruiter_job_applications'),
    path('update-status/<int:application_id>/', views.update_application_status_view, name='update_status'),
]
