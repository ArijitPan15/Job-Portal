from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile, UserRole, CandidateProfile, RecruiterProfile, CandidateSkill
from jobs.models import Skill


class UserRegistrationForm(UserCreationForm):
    role = forms.ChoiceField(
        choices=UserRole.choices,
        widget=forms.RadioSelect(attrs={'class': 'btn-check'}),
        initial=UserRole.CANDIDATE,
        help_text="Select whether you are seeking jobs or hiring talent."
    )
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30, required=False)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'role')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data.get('first_name', '')
        user.last_name = self.cleaned_data.get('last_name', '')
        if commit:
            user.save()
            role = self.cleaned_data['role']
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()

            if role == UserRole.CANDIDATE:
                CandidateProfile.objects.get_or_create(user=user)
            elif role == UserRole.RECRUITER:
                RecruiterProfile.objects.get_or_create(
                    user=user,
                    defaults={'company_name': f"{user.username}'s Company"}
                )
        return user


class CandidateProfileForm(forms.ModelForm):
    class Meta:
        model = CandidateProfile
        fields = ['headline', 'bio', 'years_of_experience', 'education_level', 'resume']
        widgets = {
            'headline': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Full Stack Python/Django Engineer'}),
            'bio': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Brief summary of your expertise...'}),
            'years_of_experience': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'education_level': forms.Select(attrs={'class': 'form-select'}),
            'resume': forms.FileInput(attrs={'class': 'form-control'}),
        }


class RecruiterProfileForm(forms.ModelForm):
    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website', 'company_description', 'location']
        widgets = {
            'company_name': forms.TextInput(attrs={'class': 'form-control'}),
            'company_website': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://example.com'}),
            'company_description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'San Francisco, CA or Remote'}),
        }


class AddCandidateSkillForm(forms.ModelForm):
    class Meta:
        model = CandidateSkill
        fields = ['skill', 'proficiency', 'years_practiced']
        widgets = {
            'skill': forms.Select(attrs={'class': 'form-select'}),
            'proficiency': forms.Select(attrs={'class': 'form-select'}),
            'years_practiced': forms.NumberInput(attrs={'class': 'form-control', 'min': '1', 'max': '50'}),
        }
