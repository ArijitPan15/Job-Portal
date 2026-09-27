from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.job_list_view, name='job_list'),
    path('post/', views.job_create_view, name='job_create'),
    path('<int:job_id>/', views.job_detail_view, name='job_detail'),
    path('<int:job_id>/skills/', views.job_manage_skills_view, name='job_skills'),
    path('<int:job_id>/skills/<int:skill_id>/remove/', views.job_remove_skill_view, name='job_remove_skill'),
]
