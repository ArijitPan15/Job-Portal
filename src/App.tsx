import React, { useState, useMemo, useRef } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Search,
  Building,
  GraduationCap,
  Clock,
  Filter,
  FileText,
  Plus,
  Send,
  AlertCircle,
  Check,
  BookOpen,
  PieChart,
  Upload,
  LogIn,
  LogOut,
  FileUp,
  Trash2,
  Sparkles,
  User,
  ShieldCheck,
  Key
} from 'lucide-react';

// Canonical initial skills
const INITIAL_SKILLS = [
  'Python', 'Django', 'PostgreSQL', 'REST API', 'Docker', 'Redis',
  'Celery', 'React', 'TypeScript', 'AWS', 'Kubernetes', 'Linux',
  'Git', 'FastAPI', 'Tailwind CSS', 'CI/CD'
];

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  minExperience: number;
  minEducation: string;
  salary: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Backend Engineer (Python / Django)',
    company: 'NexTech Cloud Solutions',
    location: 'Remote (US/Global)',
    type: 'Full Time',
    minExperience: 3,
    minEducation: "Bachelor's Degree",
    salary: '$120,000 - $150,000',
    description: 'We are seeking an experienced Backend Engineer to scale our core microservices. You will design RESTful APIs, optimize PostgreSQL queries, and leverage Redis caching.',
    requiredSkills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker', 'Redis'],
    preferredSkills: ['Celery', 'Git', 'AWS']
  },
  {
    id: 2,
    title: 'Cloud DevOps & SRE Specialist',
    company: 'ScaleGrid Infrastructure',
    location: 'Remote / New York',
    type: 'Full Time',
    minExperience: 4,
    minEducation: "Bachelor's Degree",
    salary: '$130,000 - $160,000',
    description: 'Lead our containerization strategy and cloud infrastructure automation across multi-region Kubernetes clusters.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
    preferredSkills: ['Python', 'Git']
  },
  {
    id: 3,
    title: 'Full Stack Web Developer',
    company: 'PulseMedia Innovations',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full Time',
    minExperience: 2,
    minEducation: "Bachelor's Degree",
    salary: '$105,000 - $135,000',
    description: 'Build user-facing web applications integrating Django backends with React & TypeScript frontends.',
    requiredSkills: ['Python', 'Django', 'React', 'TypeScript', 'PostgreSQL'],
    preferredSkills: ['Tailwind CSS', 'REST API']
  }
];

interface ResumeInfo {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  extractedSkills: string[];
  contentPreview: string;
}

interface Candidate {
  id: string;
  name: string;
  username: string;
  email: string;
  roleTitle: string;
  yearsOfExperience: number;
  education: string;
  skills: string[];
  resume: ResumeInfo | null;
}

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'candidate' | 'recruiter';
  email: string;
}

const DEMO_USERS: Record<string, AuthUser> = {
  alex: {
    id: 'alex',
    username: 'alex_dev',
    name: 'Alex Chen',
    role: 'candidate',
    email: 'alex@devmail.com'
  },
  jordan: {
    id: 'jordan',
    username: 'jordan_devops',
    name: 'Jordan Rivera',
    role: 'candidate',
    email: 'jordan@cloud.com'
  },
  recruiter: {
    id: 'recruiter',
    username: 'sarah_recruiter',
    name: 'Sarah Jenkins',
    role: 'recruiter',
    email: 'sarah@nextech.io'
  }
};

const INITIAL_CANDIDATES: Record<string, Candidate> = {
  alex: {
    id: 'alex',
    username: 'alex_dev',
    name: 'Alex Chen',
    email: 'alex@devmail.com',
    roleTitle: 'Senior Python & Django Developer',
    yearsOfExperience: 4,
    education: "Bachelor's Degree",
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Git'],
    resume: {
      fileName: 'alex_chen_senior_backend_resume.pdf',
      fileSize: '342 KB',
      uploadedAt: 'Sep 26, 2026',
      extractedSkills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Git', 'Docker', 'Redis'],
      contentPreview: 'Senior Software Engineer with 4+ years specializing in Python, Django, REST API architecture, and database optimization. Experienced in scaling backend systems and relational schema modeling.'
    }
  },
  jordan: {
    id: 'jordan',
    username: 'jordan_devops',
    name: 'Jordan Rivera',
    email: 'jordan@cloud.com',
    roleTitle: 'DevOps & Cloud Engineer',
    yearsOfExperience: 5,
    education: "Master's Degree",
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Python'],
    resume: {
      fileName: 'jordan_rivera_devops_sre.pdf',
      fileSize: '415 KB',
      uploadedAt: 'Sep 25, 2026',
      extractedSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Python', 'Terraform'],
      contentPreview: 'Site Reliability Engineer with 5 years leading AWS cloud infrastructures, container orchestration via Kubernetes, and automated CI/CD deployment pipelines.'
    }
  }
};

const EDUCATION_RANK: Record<string, number> = {
  'High School': 1,
  'Associate Degree': 2,
  "Bachelor's Degree": 3,
  "Master's Degree": 4,
  'Doctorate / PhD': 5
};

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'recruiter'>('jobs');

  // Currently authenticated user (Defaults to logged in candidate Alex Chen)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(DEMO_USERS.alex);

  // Candidate mutable profiles
  const [candidateProfiles, setCandidateProfiles] = useState<Record<string, Candidate>>(INITIAL_CANDIDATES);

  // Active candidate object for the currently logged in user
  const activeCandidate = (currentUser && currentUser.role === 'candidate')
    ? (candidateProfiles[currentUser.id] || null)
    : null;

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);

  // Modal states
  const [selectedJobForGap, setSelectedJobForGap] = useState<Job | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'demo'>('login');
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [inspectingResumeCandidate, setInspectingResumeCandidate] = useState<Candidate | null>(null);

  // Password-based auth states
  const [authFullName, setAuthFullName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authRoleChoice, setAuthRoleChoice] = useState<'candidate' | 'recruiter'>('candidate');

  // Resume upload drag state
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Applications state
  const [applications, setApplications] = useState<Array<{
    id: number;
    candidateName: string;
    candidateId: string;
    jobId: number;
    jobTitle: string;
    company: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    resumeFileName: string;
    status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Offer Extended';
    appliedAt: string;
  }>>([
    {
      id: 1,
      candidateName: 'Alex Chen',
      candidateId: 'alex',
      jobId: 1,
      jobTitle: 'Senior Backend Engineer (Python / Django)',
      company: 'NexTech Cloud Solutions',
      matchScore: 80.0,
      matchedSkills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
      missingSkills: ['Docker', 'Redis'],
      resumeFileName: 'alex_chen_senior_backend_resume.pdf',
      status: 'Under Review',
      appliedAt: '2026-09-26'
    }
  ]);

  // Recruiter new job form
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobExp, setNewJobExp] = useState(3);
  const [newJobEdu, setNewJobEdu] = useState("Bachelor's Degree");
  const [newJobSalary, setNewJobSalary] = useState('$110,000 - $140,000');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobSkills, setNewJobSkills] = useState<string[]>(['Python', 'Django', 'PostgreSQL']);

  // Rule-based matching engine logic
  const calculateMatch = (candidate: Candidate, job: Job) => {
    const candidateSkillsSet = new Set(candidate.skills);
    const requiredSet = new Set(job.requiredSkills);

    const matchedRequired = job.requiredSkills.filter(s => candidateSkillsSet.has(s));
    const missingRequired = job.requiredSkills.filter(s => !candidateSkillsSet.has(s));
    const matchedPreferred = job.preferredSkills.filter(s => candidateSkillsSet.has(s));

    // 1. Skill Score (60%)
    const skillScore = requiredSet.size > 0
      ? (matchedRequired.length / requiredSet.size) * 100
      : 100;

    // 2. Experience Score (20%)
    const expScore = job.minExperience <= 0
      ? 100
      : candidate.yearsOfExperience >= job.minExperience
        ? 100
        : (candidate.yearsOfExperience / job.minExperience) * 100;

    // 3. Education Score (20%)
    const candEduRank = EDUCATION_RANK[candidate.education] || 1;
    const jobEduRank = EDUCATION_RANK[job.minEducation] || 3;
    let eduScore = 100;
    if (candEduRank < jobEduRank) {
      eduScore = candEduRank === jobEduRank - 1 ? 60 : 30;
    }

    // Weighted Total
    const totalScore = Math.round(((skillScore * 0.60) + (expScore * 0.20) + (eduScore * 0.20)) * 10) / 10;

    const explanations = [
      `Skill Match (60% wt): ${matchedRequired.length} of ${requiredSet.size} required skills matched (${Math.round(skillScore)}%).`,
      `Experience Match (20% wt): Candidate has ${candidate.yearsOfExperience} yr(s) vs ${job.minExperience} yr(s) required (${Math.round(expScore)}%).`,
      `Education Match (20% wt): Candidate holds ${candidate.education}, requirement is ${job.minEducation} (${Math.round(eduScore)}%).`
    ];

    return {
      totalScore,
      skillScore: Math.round(skillScore * 10) / 10,
      experienceScore: Math.round(expScore * 10) / 10,
      educationScore: Math.round(eduScore * 10) / 10,
      matchedRequired,
      missingRequired,
      matchedPreferred,
      explanations
    };
  };

  // Toggle candidate skill in interactive mode
  const handleToggleCandidateSkill = (skill: string) => {
    if (!activeCandidate) return;
    const currentList = activeCandidate.skills;
    const newList = currentList.includes(skill)
      ? currentList.filter(s => s !== skill)
      : [...currentList, skill];

    setCandidateProfiles(prev => ({
      ...prev,
      [activeCandidate.id]: {
        ...activeCandidate,
        skills: newList
      }
    }));
  };

  // Process uploaded resume
  const processUploadedResume = (file: File) => {
    if (!activeCandidate) return;

    const detected: string[] = [];
    const sampleKeywords = ['Docker', 'Redis', 'PostgreSQL', 'Django', 'Python', 'REST API', 'AWS', 'Git', 'Linux'];
    sampleKeywords.forEach(k => {
      if (Math.random() > 0.3 || activeCandidate.skills.includes(k)) {
        detected.push(k);
      }
    });

    const newResume: ResumeInfo = {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      uploadedAt: 'Just now',
      extractedSkills: detected,
      contentPreview: `Extracted summary from ${file.name}: Verified software developer credentials with proven track record in full-stack architecture, relational database management, and cloud deployments.`
    };

    setCandidateProfiles(prev => ({
      ...prev,
      [activeCandidate.id]: {
        ...activeCandidate,
        resume: newResume
      }
    }));

    setResumeUploadSuccess(true);
    setTimeout(() => setResumeUploadSuccess(false), 3500);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedResume(file);
    }
  };

  // Import detected skills from resume into profile
  const handleImportExtractedSkills = () => {
    if (!activeCandidate || !activeCandidate.resume) return;
    const extracted = activeCandidate.resume.extractedSkills;
    const merged = Array.from(new Set([...activeCandidate.skills, ...extracted]));

    setCandidateProfiles(prev => ({
      ...prev,
      [activeCandidate.id]: {
        ...activeCandidate,
        skills: merged
      }
    }));
  };

  // Apply to job
  const handleApply = (job: Job) => {
    if (!currentUser) {
      setAuthTab('login');
      setShowAuthModal(true);
      return;
    }
    if (!activeCandidate) {
      alert("Recruiter accounts cannot submit candidate applications. Please switch to a Candidate account.");
      return;
    }

    const alreadyApplied = applications.some(a => a.candidateId === activeCandidate.id && a.jobId === job.id);
    if (alreadyApplied) return;

    const breakdown = calculateMatch(activeCandidate, job);
    const newApp = {
      id: Date.now(),
      candidateName: currentUser.name,
      candidateId: activeCandidate.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      matchScore: breakdown.totalScore,
      matchedSkills: breakdown.matchedRequired,
      missingSkills: breakdown.missingRequired,
      resumeFileName: activeCandidate.resume?.fileName || 'resume_profile.pdf',
      status: 'Submitted' as const,
      appliedAt: '2026-09-27'
    };
    setApplications(prev => [newApp, ...prev]);
  };

  // Create new job
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobCompany.trim()) return;

    const newJob: Job = {
      id: Date.now(),
      title: newJobTitle,
      company: newJobCompany,
      location: newJobLocation,
      type: 'Full Time',
      minExperience: Number(newJobExp),
      minEducation: newJobEdu,
      salary: newJobSalary,
      description: newJobDesc || 'Exciting engineering opportunity with modern tech stack.',
      requiredSkills: newJobSkills,
      preferredSkills: ['Git']
    };

    setJobs(prev => [newJob, ...prev]);
    setNewJobTitle('');
    setNewJobCompany('');
    setNewJobDesc('');
    setActiveTab('jobs');
  };

  // Handle Standard Password Login / Registration
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = authUsername.trim();
    if (!cleanUsername) return;

    // Check pre-configured demo handles
    if (cleanUsername === 'alex_dev') {
      setCurrentUser(DEMO_USERS.alex);
      setShowAuthModal(false);
      return;
    }
    if (cleanUsername === 'jordan_devops') {
      setCurrentUser(DEMO_USERS.jordan);
      setShowAuthModal(false);
      return;
    }
    if (cleanUsername === 'sarah_recruiter') {
      setCurrentUser(DEMO_USERS.recruiter);
      setShowAuthModal(false);
      return;
    }

    const userId = `user_${cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
    const displayName = authFullName.trim() || cleanUsername;
    const email = authEmail.trim() || `${cleanUsername}@example.com`;

    const newUser: AuthUser = {
      id: userId,
      username: cleanUsername,
      name: displayName,
      role: authRoleChoice,
      email: email
    };

    if (authRoleChoice === 'candidate') {
      setCandidateProfiles(prev => ({
        ...prev,
        [userId]: prev[userId] || {
          id: userId,
          username: cleanUsername,
          name: displayName,
          email: email,
          roleTitle: 'Software Developer',
          yearsOfExperience: 3,
          education: "Bachelor's Degree",
          skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
          resume: null
        }
      }));
    }

    setCurrentUser(newUser);
    setShowAuthModal(false);
    setAuthFullName('');
    setAuthUsername('');
    setAuthPassword('');
    setAuthEmail('');
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedJobType === 'All' || job.type === selectedJobType;

      if (!matchesSearch || !matchesType) return false;

      if (activeCandidate && minMatchFilter > 0) {
        const match = calculateMatch(activeCandidate, job);
        return match.totalScore >= minMatchFilter;
      }
      return true;
    });
  }, [jobs, searchQuery, selectedJobType, minMatchFilter, activeCandidate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">SkillMatch Portal</span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Skill Gap &amp; Transparent Match Scoring</p>
            </div>
          </div>

          {/* Right Header: Logged in User Identity & Auth Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* User Identity Display Pill */}
                <div className="flex items-center gap-2.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                    currentUser.role === 'recruiter' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white leading-tight">{currentUser.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        currentUser.role === 'recruiter'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {currentUser.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      @{currentUser.username}
                    </div>
                  </div>
                </div>

                {/* Candidate Resume Button */}
                {activeCandidate && (
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-2 rounded-xl transition"
                    title="Upload or manage your resume document"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{activeCandidate.resume ? 'Manage Resume' : 'Upload Resume'}</span>
                    {activeCandidate.resume && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </button>
                )}

                {/* Switch Account */}
                <button
                  onClick={() => {
                    setAuthTab('login');
                    setShowAuthModal(true);
                  }}
                  className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
                  title="Switch or log into another user account"
                >
                  Switch User
                </button>

                {/* Sign Out */}
                <button
                  onClick={() => setCurrentUser(null)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* When Logged Out (Guest Mode) */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthTab('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm font-medium border-t border-slate-800">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" /> Browse Jobs &amp; Match Scores
          </button>

          {currentUser && currentUser.role === 'candidate' && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> My Applications ({applications.filter(a => a.candidateId === activeCandidate?.id).length})
            </button>
          )}

          {currentUser && currentUser.role === 'recruiter' && (
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`py-3 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'recruiter'
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4" /> Recruiter ATS &amp; Post Job
            </button>
          )}
        </div>
      </header>

      {/* Guest Mode Callout */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-3 px-4 shadow-inner border-b border-blue-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>You are currently browsing as Guest.</strong> Sign in with your name to get automated skill-gap analysis, or register as a Recruiter to post jobs.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthTab('login');
                  setShowAuthModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-lg transition"
              >
                Sign In with Credentials
              </button>
              <button
                onClick={() => {
                  setAuthTab('register');
                  setShowAuthModal(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-1.5 rounded-lg transition"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Candidate Profile & Resume Banner */}
        {activeCandidate && activeTab === 'jobs' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{activeCandidate.name}'s Profile:</span>
                <span className="text-slate-500 text-sm">{activeCandidate.roleTitle} &bull; {activeCandidate.yearsOfExperience} yrs exp &bull; {activeCandidate.education}</span>
              </div>

              {/* Resume Status Pill & Upload Trigger */}
              <div className="flex items-center gap-2">
                {activeCandidate.resume ? (
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 px-3 py-1 rounded-lg font-medium transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resume: <strong>{activeCandidate.resume.fileName}</strong> ({activeCandidate.resume.fileSize})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 px-3 py-1 rounded-lg font-medium transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>No Resume Attached &bull; <strong>Upload PDF/Doc</strong></span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Your Skills:</span>
              {INITIAL_SKILLS.map(skill => {
                const hasSkill = activeCandidate.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => handleToggleCandidateSkill(skill)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 font-medium ${
                      hasSkill
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {hasSkill ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: Browse Jobs */}
        {activeTab === 'jobs' && (
          <div>
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[280px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or required skill (e.g. Python, Docker)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium">Type:</span>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {activeCandidate && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Min Match %:</span>
                    <select
                      value={minMatchFilter}
                      onChange={(e) => setMinMatchFilter(Number(e.target.value))}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                    >
                      <option value="0">Any Match</option>
                      <option value="50">&ge; 50%</option>
                      <option value="75">&ge; 75% Strong Match</option>
                      <option value="90">&ge; 90% Perfect Fit</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {filteredJobs.map(job => {
                const breakdown = activeCandidate ? calculateMatch(activeCandidate, job) : null;
                const hasApplied = applications.some(a => a.candidateId === activeCandidate?.id && a.jobId === job.id);

                return (
                  <div
                    key={job.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="flex-1 min-w-[320px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {job.type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Min {job.minExperience} yr(s) exp
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> {job.minEducation}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                        <p className="text-sm font-medium text-blue-600 mb-2">{job.company} &bull; <span className="text-slate-500 font-normal">{job.location}</span></p>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                        {/* Skills Overlap Badges */}
                        <div>
                          {breakdown ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-400 mr-1">Skills:</span>
                              {breakdown.matchedRequired.map(skill => (
                                <span
                                  key={skill}
                                  className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium"
                                  title="Candidate has this required skill"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" /> {skill}
                                </span>
                              ))}
                              {breakdown.missingRequired.map(skill => (
                                <span
                                  key={skill}
                                  className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-medium"
                                  title="Missing required skill (Skill Gap)"
                                >
                                  <XCircle className="w-3 h-3 text-rose-500" /> {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-400 mr-1">Required:</span>
                              {job.requiredSkills.map(skill => (
                                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Match Score & Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {breakdown ? (
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-base border-2 shadow-xs ${
                                breakdown.totalScore >= 75
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                                  : breakdown.totalScore >= 50
                                    ? 'bg-amber-50 text-amber-700 border-amber-500'
                                    : 'bg-rose-50 text-rose-700 border-rose-400'
                              }`}>
                                <span>{breakdown.totalScore}%</span>
                                <span className="text-[9px] font-normal leading-none -mt-0.5">MATCH</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500">
                              {breakdown.matchedRequired.length}/{job.requiredSkills.length} skills matched
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAuthTab('login');
                              setShowAuthModal(true);
                            }}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Sign in to view score
                          </button>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobForGap(job)}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1"
                          >
                            <PieChart className="w-3.5 h-3.5 text-blue-600" /> Skill Gap
                          </button>

                          {activeCandidate ? (
                            hasApplied ? (
                              <button
                                disabled
                                className="text-xs px-3.5 py-2 rounded-lg bg-slate-100 text-slate-500 font-medium cursor-not-allowed flex items-center gap-1 border border-slate-200"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Applied
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApply(job)}
                                className="text-xs px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-1 shadow-xs"
                              >
                                <Send className="w-3 h-3" /> Apply Now
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => {
                                setAuthTab('login');
                                setShowAuthModal(true);
                              }}
                              className="text-xs px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition"
                            >
                              Sign In to Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Candidate Applications */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application Tracking Dashboard</h2>
                <p className="text-xs text-slate-500">Real-time status updates and locked match score snapshots at time of submission</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
                {applications.filter(a => a.candidateId === activeCandidate?.id).length} Active Submissions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Job Title &amp; Company</th>
                    <th className="py-3 px-4">Match Score Snapshot</th>
                    <th className="py-3 px-4">Skills Overlap</th>
                    <th className="py-3 px-4">Attached Resume</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications
                    .filter(a => a.candidateId === activeCandidate?.id)
                    .map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                          <div className="text-xs text-slate-400">{app.company}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            app.matchScore >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {app.matchScore}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-emerald-600 font-semibold">{app.matchedSkills.length} matched</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-rose-600 font-semibold">{app.missingSkills.length} missing</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            {app.resumeFileName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">{app.appliedAt}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'Offer Extended'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Shortlisted'
                                ? 'bg-blue-100 text-blue-800'
                                : app.status === 'Under Review'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-slate-100 text-slate-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {applications.filter(a => a.candidateId === activeCandidate?.id).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  You haven't applied for any jobs yet. Browse available jobs to view your automated match scores!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Recruiter ATS */}
        {activeTab === 'recruiter' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Applicant Review Pipeline */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Applicant Pipeline (Ranked by Match Score)</h2>
                  <p className="text-xs text-slate-500">Recruiters review incoming applications with candidate match scores &amp; resumes</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-medium">
                  {applications.length} Candidates
                </span>
              </div>

              <div className="space-y-3">
                {applications.map(app => {
                  const candidateObj = candidateProfiles[app.candidateId];
                  return (
                    <div key={app.id} className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition bg-slate-50/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{app.candidateName}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {app.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Applied for: <span className="font-semibold text-slate-700">{app.jobTitle}</span></p>

                          <div className="mt-2 text-xs flex flex-wrap gap-1">
                            <span className="text-slate-400">Matched:</span>
                            {app.matchedSkills.map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                {s}
                              </span>
                            ))}
                            <span className="text-slate-400 ml-2">Missing:</span>
                            {app.missingSkills.map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Candidate Resume Link */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (candidateObj) {
                                  setInspectingResumeCandidate(candidateObj);
                                }
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Attached Resume ({app.resumeFileName})
                            </button>
                          </div>
                        </div>

                        {/* Recruiter Status Action */}
                        <select
                          value={app.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
                          }}
                          className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white font-medium focus:ring-1 focus:ring-blue-500 shrink-0"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Offer Extended">Offer Extended</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Post New Job Form */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" /> Create Job Opportunity
                </h3>
                <p className="text-xs text-slate-500">Define required skills to feed the rule-based matching engine</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Django Architect"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechCorp Labs"
                      value={newJobCompany}
                      onChange={(e) => setNewJobCompany(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min Exp (Yrs)</label>
                    <input
                      type="number"
                      min="0"
                      value={newJobExp}
                      onChange={(e) => setNewJobExp(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min Education</label>
                    <select
                      value={newJobEdu}
                      onChange={(e) => setNewJobEdu(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white"
                    >
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mandatory Required Skills</label>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border border-slate-200 p-2 rounded-lg bg-slate-50">
                    {INITIAL_SKILLS.map(skill => {
                      const isSelected = newJobSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => {
                            setNewJobSkills(prev =>
                              prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                            );
                          }}
                          className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Click skills to require for this job</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Responsibilities, stack, and deliverables..."
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm transition"
                >
                  Publish Job Posting
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: Skill Gap Analysis Modal */}
        {selectedJobForGap && activeCandidate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Automated Skill-Gap Report
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedJobForGap.title}</h2>
                  <p className="text-xs text-slate-500">{selectedJobForGap.company} &bull; {selectedJobForGap.location}</p>
                </div>
                <button
                  onClick={() => setSelectedJobForGap(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Calculated Results */}
              {(() => {
                const breakdown = calculateMatch(activeCandidate, selectedJobForGap);
                return (
                  <div className="space-y-5">
                    {/* Score summary banner */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Candidate: {activeCandidate.name} (@{activeCandidate.username})</span>
                        <div className="text-2xl font-black text-slate-900 mt-0.5">{breakdown.totalScore}% Overall Match</div>
                        <span className="text-xs text-slate-500">Weighted: 60% Skills + 20% Experience + 20% Education</span>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-lg border-2 ${
                        breakdown.totalScore >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                          : breakdown.totalScore >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-500'
                            : 'bg-rose-50 text-rose-700 border-rose-400'
                      }`}>
                        {breakdown.totalScore}%
                      </div>
                    </div>

                    {/* Matched vs Missing Skills Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matched Skills */}
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Matched Skills ({breakdown.matchedRequired.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {breakdown.matchedRequired.map(s => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                              {s}
                            </span>
                          ))}
                          {breakdown.matchedRequired.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No skills matched yet.</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills (The Gap!) */}
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-sm mb-2">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Missing Required Skills ({breakdown.missingRequired.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {breakdown.missingRequired.map(s => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-300">
                              {s}
                            </span>
                          ))}
                          {breakdown.missingRequired.length === 0 && (
                            <span className="text-xs text-emerald-700 font-semibold">Zero gap! 100% of required skills possessed.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transparent Explanations */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Transparent Math Breakdown
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {breakdown.explanations.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 pt-3 border-t border-slate-100 font-mono text-[11px] text-slate-500">
                        Formula: ({breakdown.skillScore} &times; 0.60) + ({breakdown.experienceScore} &times; 0.20) + ({breakdown.educationScore} &times; 0.20) = <strong className="text-slate-900">{breakdown.totalScore}%</strong>
                      </div>
                    </div>

                    {/* Interactive Skill Toggler Inside Modal */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800 block mb-1">
                        Try Adding Missing Skills to see Match Score increase:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {breakdown.missingRequired.map(s => (
                          <button
                            key={s}
                            onClick={() => handleToggleCandidateSkill(s)}
                            className="px-2 py-1 rounded bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-medium flex items-center gap-1 transition"
                          >
                            <Plus className="w-3 h-3" /> Add "{s}" to {activeCandidate.name}'s Profile
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setSelectedJobForGap(null)}
                        className="text-xs px-4 py-2 rounded-lg border border-slate-200 font-medium hover:bg-slate-50"
                      >
                        Close Report
                      </button>
                      <button
                        onClick={() => {
                          handleApply(selectedJobForGap);
                          setSelectedJobForGap(null);
                        }}
                        className="text-xs px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Send className="w-3 h-3" /> Submit Application
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* MODAL 2: Resume Upload & Management Modal */}
        {showResumeModal && activeCandidate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-blue-600" />
                    Resume Management
                  </h3>
                  <p className="text-xs text-slate-500">Upload your CV/resume to support automatic skill detection</p>
                </div>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {resumeUploadSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Resume uploaded and analyzed successfully!</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(true);
                }}
                onDragLeave={() => setIsDraggingResume(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processUploadedResume(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  isDraggingResume
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Click to select or drag &amp; drop your resume file
                </h4>
                <p className="text-xs text-slate-500">Supports PDF, DOCX, DOC, or TXT (Max 10 MB)</p>
              </div>

              {/* Current Active Resume Card */}
              {activeCandidate.resume ? (
                <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{activeCandidate.resume.fileName}</div>
                        <div className="text-xs text-slate-500">{activeCandidate.resume.fileSize} &bull; Uploaded {activeCandidate.resume.uploadedAt}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCandidateProfiles(prev => ({
                          ...prev,
                          [activeCandidate.id]: {
                            ...activeCandidate,
                            resume: null
                          }
                        }));
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 p-1 flex items-center gap-1 font-medium"
                      title="Remove resume"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>

                  {/* Smart Resume Scanner Insights */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Skills Detected in Resume:
                      </span>
                      <button
                        onClick={handleImportExtractedSkills}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded transition"
                      >
                        + Import All to Profile
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {activeCandidate.resume.extractedSkills.map(s => {
                        const alreadyInProfile = activeCandidate.skills.includes(s);
                        return (
                          <span
                            key={s}
                            className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium ${
                              alreadyInProfile
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {alreadyInProfile ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-amber-600" />}
                            {s}
                            {!alreadyInProfile && <span className="text-[9px] text-amber-600 font-bold">(New)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resume Text Summary */}
                  <div className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-700 block mb-0.5">Resume Summary Preview:</span>
                    {activeCandidate.resume.contentPreview}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-4 text-xs text-slate-400">
                  No resume file uploaded yet. Uploading a resume provides hiring managers with your complete work history.
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="text-xs px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: User Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {authTab === 'login' && 'Sign In to Account'}
                    {authTab === 'register' && 'Create New Account'}
                    {authTab === 'demo' && 'Quick Demo Profiles'}
                  </h3>
                  <p className="text-xs text-slate-500">Sign in with your credentials or switch benchmark user accounts</p>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Login Method Tabs */}
              <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-100 text-xs font-semibold mb-4">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    authTab === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    authTab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Register
                </button>

                <button
                  type="button"
                  onClick={() => setAuthTab('demo')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    authTab === 'demo'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Demo Accounts
                </button>
              </div>

              {/* TAB 1: Sign In */}
              {authTab === 'login' && (
                <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. srabanipan or alex_dev"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition mt-2"
                  >
                    Sign In
                  </button>
                </form>
              )}

              {/* TAB 2: Register */}
              {authTab === 'register' && (
                <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthRoleChoice('candidate')}
                        className={`p-2 rounded-lg border text-center font-medium transition ${
                          authRoleChoice === 'candidate'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        Job Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthRoleChoice('recruiter')}
                        className={`p-2 rounded-lg border text-center font-medium transition ${
                          authRoleChoice === 'recruiter'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        Recruiter / Employer
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Srabani Pan"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. srabanipan"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. srabanipan@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition mt-2"
                  >
                    Create Account as {authRoleChoice === 'candidate' ? 'Candidate' : 'Recruiter'}
                  </button>
                </form>
              )}

              {/* TAB 3: 1-Click Demo Profiles */}
              {authTab === 'demo' && (
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-700 block mb-2">Select a pre-configured benchmark account:</span>

                  <button
                    onClick={() => {
                      setCurrentUser(DEMO_USERS.alex);
                      setShowAuthModal(false);
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">👨‍💻 Alex Chen (@alex_dev)</div>
                      <div className="text-[11px] text-slate-500">Candidate &bull; Python, Django, PostgreSQL, REST API</div>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">Log In</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser(DEMO_USERS.jordan);
                      setShowAuthModal(false);
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">🚀 Jordan Rivera (@jordan_devops)</div>
                      <div className="text-[11px] text-slate-500">Candidate &bull; DevOps, Docker, Kubernetes, AWS, Linux</div>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">Log In</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser(DEMO_USERS.recruiter);
                      setShowAuthModal(false);
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">🏢 Sarah Jenkins (@sarah_recruiter)</div>
                      <div className="text-[11px] text-slate-500">Recruiter &bull; NexTech Cloud Solutions</div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">Log In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL 4: Recruiter Resume Inspection Modal */}
        {inspectingResumeCandidate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase">
                    Recruiter Document Review
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {inspectingResumeCandidate.name}'s Resume
                  </h3>
                  <p className="text-xs text-slate-500">{inspectingResumeCandidate.roleTitle} &bull; {inspectingResumeCandidate.education}</p>
                </div>
                <button
                  onClick={() => setInspectingResumeCandidate(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {inspectingResumeCandidate.resume ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-bold text-slate-900">{inspectingResumeCandidate.resume.fileName}</div>
                        <div className="text-[11px] text-slate-500">{inspectingResumeCandidate.resume.fileSize} &bull; Uploaded {inspectingResumeCandidate.resume.uploadedAt}</div>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Verified Upload
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Skills Verified from Document
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {inspectingResumeCandidate.resume.extractedSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    <span className="font-bold block mb-1 text-slate-900">Summary:</span>
                    {inspectingResumeCandidate.resume.contentPreview}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No resume file attached for this applicant.
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setInspectingResumeCandidate(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
