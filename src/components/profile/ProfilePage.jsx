import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Link as LinkIcon,
  Linkedin,
  Github,
  Globe,
  FileText,
  DollarSign,
  Save,
  X,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  Edit3,
  Upload
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import ResumeUpload from './ResumeUpload';
import AvatarUpload from '../common/AvatarUpload';

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      )}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-slate-800/50 text-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 placeholder-slate-500 transition-all ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-amber-500/50'
        }`}
      />
    </div>
    {error && <p className="text-red-400 text-sm">{error}</p>}
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-300">{label}</label>
    <textarea
      {...props}
      className="w-full px-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 placeholder-slate-500 transition-all resize-none"
    />
  </div>
);

const SkillTag = ({ skill, onRemove, editable = true }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
    {skill}
    {editable && (
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="hover:text-amber-300 transition-colors"
      >
        <X size={14} />
      </button>
    )}
  </span>
);

const JobTypeCheckbox = ({ type, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
      checked 
        ? 'bg-amber-500 border-amber-500' 
        : 'border-slate-600 group-hover:border-slate-500'
    }`}>
      {checked && <Check size={14} className="text-slate-900" />}
    </div>
    <span className="text-slate-300 group-hover:text-white transition-colors">{type}</span>
  </label>
);

const Section = ({ title, children }) => (
  <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 space-y-6">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {children}
  </div>
);

export default function ProfilePage({ user, onBack, onAvatarUpdate }) {
  const { profile, isLoading, isSaving, error, updateProfile } = useProfile(user?.id);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    resume_url: '',
    job_title: '',
    years_experience: 0,
    skills: [],
    preferred_job_types: [],
    preferred_locations: [],
    salary_min: '',
    salary_max: '',
    is_open_to_work: true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        resume_url: profile.resume_url || '',
        job_title: profile.job_title || '',
        years_experience: profile.years_experience || 0,
        skills: profile.skills || [],
        preferred_job_types: profile.preferred_job_types || [],
        preferred_locations: profile.preferred_locations || [],
        salary_min: profile.salary_min || '',
        salary_max: profile.salary_max || '',
        is_open_to_work: profile.is_open_to_work ?? true,
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocation.trim() && !formData.preferred_locations.includes(newLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (locationToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(l => l !== locationToRemove)
    }));
  };

  const handleToggleJobType = (type) => {
    setFormData(prev => ({
      ...prev,
      preferred_job_types: prev.preferred_job_types.includes(type)
        ? prev.preferred_job_types.filter(t => t !== type)
        : [...prev.preferred_job_types, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    const updates = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      years_experience: parseInt(formData.years_experience) || 0,
    };

    const result = await updateProfile(updates);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <Check className="text-green-400 flex-shrink-0" size={20} />
            <p className="text-green-400">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {(error || saveError) && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-400">{error || saveError}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Upload */}
            <AvatarUpload
              userId={user?.id}
              currentAvatarUrl={profile?.avatar_url}
              userName={formData.full_name || user?.name}
              onAvatarChange={(newUrl) => {
                // Update the navbar avatar in real-time
                if (onAvatarUpdate) {
                  onAvatarUpdate(newUrl);
                }
              }}
            />

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {formData.full_name || 'Your Name'}
              </h1>
              <p className="text-slate-400 mb-3">{user?.email}</p>
              
              {/* Open to Work Badge */}
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <div className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.is_open_to_work ? 'bg-green-500' : 'bg-slate-600'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.is_open_to_work ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
                <input
                  type="checkbox"
                  name="is_open_to_work"
                  checked={formData.is_open_to_work}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.is_open_to_work ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {formData.is_open_to_work ? 'Open to work' : 'Not looking'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                icon={User}
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
              <InputField
                label="Location"
                icon={MapPin}
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="San Francisco, CA"
              />
              <InputField
                label="Current Job Title"
                icon={Briefcase}
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="Senior Software Engineer"
              />
            </div>
            
            <TextAreaField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              rows={4}
            />
          </Section>

          {/* Professional Experience */}
          <Section title="Professional Experience">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Years of Experience</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="years_experience"
                    min="0"
                    max="50"
                    value={formData.years_experience}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map((skill, index) => (
                  <SkillTag key={index} skill={skill} onRemove={handleRemoveSkill} />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  placeholder="Add a skill (e.g., React, Python)"
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 placeholder-slate-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </Section>

          {/* Job Preferences */}
          <Section title="Job Preferences">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">Preferred Job Types</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                  <JobTypeCheckbox
                    key={type}
                    type={type}
                    checked={formData.preferred_job_types.includes(type)}
                    onChange={() => handleToggleJobType(type)}
                  />
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Preferred Locations</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.preferred_locations.map((location, index) => (
                  <SkillTag key={index} skill={location} onRemove={handleRemoveLocation} />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation(e)}
                  placeholder="Add a preferred location"
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 placeholder-slate-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Salary Expectations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Minimum Salary (USD/year)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="salary_min"
                    min="0"
                    step="1000"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 placeholder-slate-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Maximum Salary (USD/year)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    name="salary_max"
                    min="0"
                    step="1000"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="150000"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 placeholder-slate-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Online Presence */}
          <Section title="Online Presence">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="LinkedIn URL"
                icon={Linkedin}
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <InputField
                label="GitHub URL"
                icon={Github}
                name="github_url"
                type="url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
              <InputField
                label="Portfolio Website"
                icon={Globe}
                name="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </Section>

          {/* Resume Management */}
          <Section title="Resume & Documents">
            <ResumeUpload userId={user?.id} />
          </Section>

          {/* Save Button (Mobile) */}
          <div className="sm:hidden">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
