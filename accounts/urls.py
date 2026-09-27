from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('skills/add/', views.add_candidate_skill_view, name='add_skill'),
    path('skills/<int:skill_id>/remove/', views.remove_candidate_skill_view, name='remove_skill'),
]
