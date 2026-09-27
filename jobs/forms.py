from django import forms
from .models import Job, JobSkill, Skill
from accounts.models import EducationLevel


class JobForm(forms.ModelForm):
    class Meta:
        model = Job
        fields = [
            'title', 'company_name', 'location', 'job_type',
            'min_experience_years', 'min_education_level',
            'salary_range', 'description', 'is_active'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Senior Django Developer'}),
            'company_name': forms.TextInput(attrs={'class': 'form-control'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Remote / New York'}),
            'job_type': forms.Select(attrs={'class': 'form-select'}),
            'min_experience_years': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'min_education_level': forms.Select(attrs={'class': 'form-select'}),
            'salary_range': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. $100k - $130k'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 6}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class AddJobSkillForm(forms.ModelForm):
    class Meta:
        model = JobSkill
        fields = ['skill', 'is_required', 'weight']
        widgets = {
            'skill': forms.Select(attrs={'class': 'form-select'}),
            'is_required': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'weight': forms.NumberInput(attrs={'class': 'form-control', 'min': '1', 'max': '5'}),
        }


class JobFilterForm(forms.Form):
    q = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Search by title, company, or keyword...'})
    )
    job_type = forms.ChoiceField(
        required=False,
        choices=[('', 'All Job Types')] + list(Job.job_type.field.choices),
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    min_match = forms.IntegerField(
        required=False,
        min_value=0,
        max_value=100,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Min Match % (e.g. 50)'})
    )
