# JobStream ⚡

A modern, full-featured job aggregation and application tracking platform built with React and Supabase. JobStream helps job seekers discover opportunities from multiple sources, save favorites, apply with one click, and track their application journey—all in one beautiful, responsive interface.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat&logo=supabase&logoColor=white)

## 🌟 Features

### For Job Seekers
- **🔍 Smart Job Discovery** - Browse aggregated job listings from multiple sources (LinkedIn, Indeed, Glassdoor, etc.)
- **🎯 Advanced Filtering** - Filter by job type, location, salary range, experience level, and more
- **💾 Save Jobs** - Bookmark interesting opportunities for later review
- **⚡ Quick Apply** - One-click application submission
- **📊 Application Tracking** - Monitor your applications through every stage (Applied → Viewed → Interviewing → Offered)
- **🔔 Real-time Notifications** - Get notified about new job matches and application updates
- **👤 Profile Management** - Maintain your professional profile, resume, and preferences
- **⚙️ Customizable Settings** - Configure notifications, theme preferences, and more

### Application Statuses
Track your job applications through the complete hiring pipeline:
- **Applied** - Application submitted, awaiting response
- **Viewed** - Employer has reviewed your application
- **Interviewing** - Interview process in progress
- **Offered** - Congratulations! You received an offer
- **Rejected** - Application not selected
- **Withdrawn** - You withdrew the application

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, Real-time) |
| **State Management** | React Hooks (useState, useEffect, useCallback, useMemo) |
| **Authentication** | Supabase Auth (Email/Password, OAuth) |

## 📁 Project Structure

```
src/
├── components/           # React UI components
│   ├── AdvancedFilters.jsx      # Multi-criteria job filtering
│   ├── ApplicationsPage.jsx     # Application tracking dashboard
│   ├── AuthPage.jsx             # Login/Register interface
│   ├── JobCard.jsx              # Individual job listing card
│   ├── JobDashboard.jsx         # Main dashboard layout
│   ├── JobDetails.jsx           # Detailed job view with apply
│   ├── JobList.jsx              # Scrollable job listings
│   ├── Navbar.jsx               # Top navigation bar
│   ├── NotificationsDropdown.jsx # Real-time notifications
│   ├── ProfilePage.jsx          # User profile editor
│   ├── SavedJobsSidebar.jsx     # Saved jobs panel
│   ├── SettingsPage.jsx         # User preferences
│   └── ToastNotification.jsx    # Toast alerts
├── hooks/                # Custom React hooks
│   ├── useApplications.js       # Application CRUD operations
│   ├── useJobs.js               # Job fetching and caching
│   ├── useNotifications.js      # Notification management
│   ├── useProfile.js            # Profile data handling
│   ├── useSavedJobs.js          # Saved jobs operations
│   └── useSettings.js           # User settings context
├── lib/
│   └── supabase.js              # Supabase client & helpers
├── utils/
│   └── jobUtils.js              # Job filtering utilities
├── App.jsx                      # Root component & routing
├── App.css                      # Global styles
├── main.jsx                     # React entry point
└── index.css                    # Tailwind imports

supabase/
├── schema.sql                   # Database schema & RLS policies
└── seed_jobs.sql                # Sample job data
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobstream.git
   cd jobstream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - (Optional) Run `supabase/seed_jobs.sql` for sample data

4. **Configure environment variables**
   ```bash
   # Create .env file in project root
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🗄️ Database Schema

The application uses a PostgreSQL database (via Supabase) with the following core tables:

- **profiles** - Extended user data (skills, preferences, resume)
- **jobs** - Job listings with company info, salary, requirements
- **companies** - Company information and branding
- **job_sources** - Job aggregation source tracking
- **saved_jobs** - User's bookmarked jobs
- **applications** - Job application tracking with status history
- **application_history** - Audit log of status changes
- **job_alerts** - Saved search alerts
- **user_settings** - Notification and theme preferences

All tables implement Row Level Security (RLS) for data protection.

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Secure Authentication** - Supabase Auth with email verification
- **OAuth Support** - Sign in with Google, GitHub, etc.
- **Protected API Routes** - All mutations require authentication

## 🎨 UI/UX Highlights

- **Dark Theme** - Easy on the eyes with amber/orange accents
- **Responsive Design** - Works seamlessly on desktop and tablet
- **Smooth Animations** - Polished micro-interactions
- **Real-time Updates** - Instant feedback on actions
- **Accessible** - Keyboard navigation and screen reader support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with ❤️ using React, Vite, Tailwind CSS, and Supabase.

---

<p align="center">
  <strong>⭐ Star this repo if you find it helpful!</strong>
</p>
