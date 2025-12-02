import React, { useState } from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  Shield,
  Eye,
  Globe,
  Palette,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  Loader2,
  BellRing,
  Briefcase,
  FileText,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative w-12 h-6 rounded-full transition-colors ${
      enabled ? 'bg-amber-500' : 'bg-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <div
      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
        enabled ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </button>
);

const SettingRow = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-amber-400" />
      </div>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="flex-shrink-0 ml-4">{children}</div>
  </div>
);

const ThemeOption = ({ theme, currentTheme, onChange, icon: Icon, label, preview }) => (
  <button
    onClick={() => onChange(theme)}
    className={`relative flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
      currentTheme === theme
        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/80'
    }`}
  >
    {/* Theme Preview */}
    <div className={`w-full h-16 rounded-lg overflow-hidden border ${
      theme === 'light' ? 'bg-white border-gray-200' : 
      theme === 'dark' ? 'bg-slate-900 border-slate-700' :
      'bg-gradient-to-r from-slate-900 via-slate-500 to-white border-slate-600'
    }`}>
      <div className={`h-4 ${
        theme === 'light' ? 'bg-gray-100' : 
        theme === 'dark' ? 'bg-slate-800' :
        'bg-gradient-to-r from-slate-800 to-gray-200'
      }`} />
      <div className="p-2 flex gap-1">
        <div className={`h-2 w-8 rounded ${
          theme === 'light' ? 'bg-blue-500' : 
          theme === 'dark' ? 'bg-amber-500' :
          'bg-gradient-to-r from-amber-500 to-blue-500'
        }`} />
        <div className={`h-2 w-4 rounded ${
          theme === 'light' ? 'bg-gray-300' : 
          theme === 'dark' ? 'bg-slate-700' :
          'bg-slate-500'
        }`} />
      </div>
    </div>
    
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          currentTheme === theme ? 'bg-amber-500/20' : 'bg-slate-700'
        }`}
      >
        <Icon
          size={20}
          className={currentTheme === theme ? 'text-amber-400' : 'text-slate-400'}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          currentTheme === theme ? 'text-amber-400' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
    
    {currentTheme === theme && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
        <Check size={12} className="text-slate-900" />
      </div>
    )}
  </button>
);

const Section = ({ title, description, children }) => (
  <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden">
    <div className="p-6 border-b border-slate-700/50">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function SettingsPage({ user, onBack }) {
  const { settings, isLoading, isSaving, updateSetting, resetSettings } = useSettings(user?.id);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleThemeChange = (theme) => {
    updateSetting('theme', theme);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleToggle = (key) => {
    updateSetting(key, !settings[key]);
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      await resetSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white light:bg-slate-100 light:text-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 light:from-white light:via-slate-50 light:to-white light:border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors light:text-slate-600 light:hover:text-slate-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="flex items-center gap-2 text-green-400 text-sm">
                  <Check size={16} />
                  Saved
                </span>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors light:bg-slate-200 light:hover:bg-slate-300 light:text-slate-700"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-white light:text-slate-900">Settings</h1>
          <p className="text-slate-400 mt-2 light:text-slate-600">
            Customize your JobFinder experience
          </p>
        </div>

        {/* Appearance */}
        <Section title="Appearance" description="Customize how JobFinder looks on your device">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4 light:text-slate-700">
                Theme
              </label>
              <div className="flex gap-4">
                <ThemeOption
                  theme="light"
                  currentTheme={settings.theme}
                  onChange={handleThemeChange}
                  icon={Sun}
                  label="Light"
                />
                <ThemeOption
                  theme="dark"
                  currentTheme={settings.theme}
                  onChange={handleThemeChange}
                  icon={Moon}
                  label="Dark"
                />
                <ThemeOption
                  theme="system"
                  currentTheme={settings.theme}
                  onChange={handleThemeChange}
                  icon={Monitor}
                  label="System"
                />
              </div>
            </div>

            <SettingRow
              icon={Eye}
              title="Compact View"
              description="Show more jobs with less spacing"
            >
              <ToggleSwitch
                enabled={settings.compactView}
                onChange={() => handleToggle('compactView')}
              />
            </SettingRow>

            <SettingRow
              icon={Briefcase}
              title="Show Salary"
              description="Display salary information on job cards"
            >
              <ToggleSwitch
                enabled={settings.showSalary}
                onChange={() => handleToggle('showSalary')}
              />
            </SettingRow>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" description="Choose what notifications you receive">
          <div className="space-y-2">
            <SettingRow
              icon={Bell}
              title="Push Notifications"
              description="Receive notifications in your browser"
            >
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
            </SettingRow>

            <SettingRow
              icon={Mail}
              title="Email Notifications"
              description="Receive updates via email"
            >
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
            </SettingRow>

            <SettingRow
              icon={BellRing}
              title="Application Updates"
              description="Get notified about your application status changes"
            >
              <ToggleSwitch
                enabled={settings.applicationUpdates}
                onChange={() => handleToggle('applicationUpdates')}
              />
            </SettingRow>

            <SettingRow
              icon={Briefcase}
              title="Job Recommendations"
              description="Receive personalized job recommendations"
            >
              <ToggleSwitch
                enabled={settings.jobRecommendations}
                onChange={() => handleToggle('jobRecommendations')}
              />
            </SettingRow>

            <SettingRow
              icon={FileText}
              title="Marketing Emails"
              description="Receive tips, updates, and promotional content"
            >
              <ToggleSwitch
                enabled={settings.marketingEmails}
                onChange={() => handleToggle('marketingEmails')}
              />
            </SettingRow>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Data" description="Manage your privacy preferences">
          <div className="space-y-2">
            <SettingRow
              icon={FileText}
              title="Auto-fill Applications"
              description="Use your profile data to auto-fill job applications"
            >
              <ToggleSwitch
                enabled={settings.autoApplyProfile}
                onChange={() => handleToggle('autoApplyProfile')}
              />
            </SettingRow>

            <div className="flex items-center justify-between py-4 border-b border-slate-700/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Shield size={20} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white light:text-slate-900">Privacy Policy</h4>
                  <p className="text-sm text-slate-400 light:text-slate-600">
                    Learn how we handle your data
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white light:text-slate-900">Delete Account</h4>
                  <p className="text-sm text-slate-400 light:text-slate-600">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </Section>

        {/* Language */}
        <Section title="Language & Region" description="Set your preferred language">
          <SettingRow
            icon={Globe}
            title="Language"
            description="Choose your preferred language"
          >
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 light:bg-white light:border-slate-300 light:text-slate-900"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </SettingRow>
        </Section>

        {/* About */}
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 text-center">
          <p className="text-slate-400 text-sm">
            JobFinder v1.0.0 • Made with ❤️ for job seekers everywhere
          </p>
        </div>
      </main>
    </div>
  );
}
