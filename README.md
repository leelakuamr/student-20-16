# 🚀 AdeptLearn - Personalized EdTech Platform

> **A modern, AI-powered educational platform that adapts to each student's learning journey through personalized recommendations, interactive modules, and collaborative features.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Features
- **Multi-Role Authentication** - Students, Instructors, Admins, and Parents
- **AI-Powered Recommendations** - Personalized learning suggestions
- **Interactive Learning Modules** - Video integration with YouTube
- **Real-Time Chatbot** - OpenAI GPT integration with fallback responses
- **Progress Tracking** - Visual progress bars and analytics
- **Assignment Management** - File upload and submission system
- **Discussion Forums** - Peer-to-peer learning and Q&A
- **Study Groups** - Collaborative learning spaces
- **Gamification** - Badges, leaderboards, and achievement system
- **Calendar Integration** - Event and assignment scheduling
- **Responsive Design** - Mobile-first, accessible interface

### 🤖 AI Integration
- **Smart Chatbot** - Context-aware responses about courses and assignments
- **Personalized Recommendations** - AI-driven learning path suggestions
- **Mock Responses** - Offline functionality when OpenAI API is unavailable
- **Chat History** - Persistent conversation storage per user

### 🎨 UI/UX Features
- **Modern Design** - Clean, intuitive interface with TailwindCSS
- **Dark Mode Support** - Theme switching capability
- **Accessibility** - High contrast, large text, keyboard navigation
- **Mobile Responsive** - Optimized for all device sizes
- **Component Library** - Reusable Radix UI components

## 🛠 Tech Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React 18 + React Router 6
- **Build Tool**: Vite
- **Styling**: TailwindCSS 3 + Radix UI
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Language**: TypeScript (Node.js)
- **Framework**: Express.js 5
- **Database**: JSON files (dev) + Prisma ORM ready
- **Validation**: Zod
- **CORS**: Cross-origin request handling

### Firebase Integration
- **Authentication**: Firebase Auth (email/password)
- **Database**: Firestore (user profiles)
- **Analytics**: Firebase Analytics
- **Admin SDK**: Server-side operations

### Development Tools
- **Package Manager**: PNPM
- **Testing**: Vitest
- **Linting**: TypeScript strict mode
- **Formatting**: Prettier
- **Hot Reload**: Vite HMR

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PNPM (recommended) or npm
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-20-20
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config to `client/lib/firebase.ts`

4. **Environment Variables (Optional)**
   ```bash
   # For AI chatbot functionality
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**
   - Local: http://localhost:8080
   - Network: http://192.168.31.194:8080

### Build for Production

```bash
# Build both client and server
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
student-20-20/
├── client/                    # React frontend
│   ├── components/           # Reusable UI components
│   │   ├── app/             # Application-specific components
│   │   └── ui/              # Base UI components (Radix UI)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   ├── pages/               # Route components
│   ├── App.tsx              # Main app component
│   └── global.css           # Global styles
├── server/                   # Express backend
│   ├── routes/              # API route handlers
│   ├── utils/               # Server utilities
│   ├── firebase.ts          # Firebase Admin SDK
│   └── index.ts             # Server entry point
├── shared/                   # Shared types and utilities
├── public/                   # Static assets
├── prisma/                   # Database schema (Prisma)
├── dist/                     # Build output
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (Firebase)
- `POST /api/auth/login` - User login (Firebase)
- `POST /api/auth/logout` - User logout (Firebase)

### Education
- `GET /api/users/me` - Get current user
- `GET /api/progress` - Get course progress
- `GET /api/recommendations` - Get AI recommendations
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Submit assignment

### AI & Chat
- `POST /api/ai/chat` - Send message to AI chatbot
- `GET /api/ai/history` - Get chat history

### Gamification
- `GET /api/badges` - Get user badges
- `POST /api/badges` - Award badge
- `GET /api/groups` - Get study groups
- `POST /api/groups` - Create study group

### Admin
- `GET /api/users` - List all users
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

## 👥 User Roles

### 🎓 Student
- Access to personalized dashboard
- Course progress tracking
- Assignment submission
- Discussion forum participation
- Study group creation/joining
- AI chatbot assistance
- Gamification features

### 👨‍🏫 Instructor
- Course management
- Student progress monitoring
- Assignment grading
- Discussion moderation
- Student communication

### 👨‍💼 Admin
- Platform-wide analytics
- User management
- Content moderation
- System configuration
- Role assignment

### 👨‍👩‍👧‍👦 Parent
- Child progress monitoring
- Teacher communication
- Learning analytics

## 📱 Screenshots

### Landing Page
- Hero section with feature highlights
- Role-based call-to-action buttons
- Feature grid showcasing capabilities
- Responsive design for all devices

### Student Dashboard
- Personalized welcome message
- Course progress visualization
- AI recommendations panel
- Interactive learning modules
- Assignment submission interface

### Instructor Console
- Course management table
- Student enrollment tracking
- Assignment submission queue
- Grading interface

### AI Chatbot
- Real-time conversation interface
- Context-aware responses
- Chat history persistence
- Mobile-optimized design

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Netlify
1. Connect repository
2. Set build command: `pnpm build`
3. Set publish directory: `dist/spa`

### Firebase Hosting
1. Install Firebase CLI
2. Run `firebase init hosting`
3. Deploy with `firebase deploy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**BEZAWADA RIKITHADEVI** - 246M1A0515

## 🙏 Acknowledgments

- Firebase for authentication and database services
- OpenAI for AI chatbot capabilities
- Radix UI for accessible component primitives
- TailwindCSS for utility-first styling
- React community for excellent documentation

---

**Built with ❤️ for the future of education**

*Ready to transform learning? Start exploring the platform at http://localhost:8080*
