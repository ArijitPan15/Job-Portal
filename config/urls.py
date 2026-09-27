"""
Root URL configuration for Job Portal project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('jobs/', include('jobs.urls', namespace='jobs')),
    path('applications/', include('applications.urls', namespace='applications')),
    path('matching/', include('matching.urls', namespace='matching')),
    path('', include('jobs.urls', namespace='jobs_root')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
