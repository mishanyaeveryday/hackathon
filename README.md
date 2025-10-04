# 🧘 Placebo Coach

> **A scientific N=1 experiment platform for personalized wellness practice discovery**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2.25-green.svg)](https://djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 What is Placebo Coach?

Placebo Coach is a sophisticated platform that enables users to conduct their own **N=1 experiments** to discover which wellness practices actually work for them. By implementing rigorous scientific methodology including placebo-controlled trials, users can make data-driven decisions about their personal wellness routines.

### ✨ Key Features

- 🔬 **Scientific Rigor**: Placebo-controlled experiments with randomized slot assignment
- 📊 **Data-Driven Insights**: Comprehensive analytics with mood, ease, satisfaction, and nervousness tracking
- 🌍 **Multi-Language**: Support for Russian, English, and Polish
- ⏱️ **Smart Scheduling**: AI-powered daily planning with optimal timing
- 📱 **Mobile-First**: Responsive design with PWA capabilities
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** primitives for accessibility
- **Recharts** for data visualization

### Backend
- **Django 4.2** with REST Framework
- **PostgreSQL** database
- **JWT Authentication** with refresh tokens
- **Django SimpleJWT** for token management

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hackathon.git
cd hackathon
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

---

## 📖 How It Works

### 1. **Practice Selection** 🎯
Choose from predefined wellness practices or create your own:
- Breathing exercises (4-7-8 technique)
- Physical activities (squats, stretching)
- Mindfulness practices
- Light therapy sessions

### 2. **Daily Planning** 📅
The system automatically generates your daily schedule:
- **6 slots per day** (morning, afternoon, evening)
- **30% placebo slots** for unbiased comparison
- **Randomized assignment** to prevent bias
- **Optimal timing** based on your preferences

### 3. **Practice Execution** ⏱️
Execute your practices with built-in tools:
- **Timer-based sessions** with visual progress
- **Pause/resume functionality**
- **Real-time tracking**
- **Completion verification**

### 4. **Assessment** 📊
Rate your experience after each session:
- **Mood** (1-10 scale)
- **Ease** of practice
- **Satisfaction** level
- **Nervousness** reduction

### 5. **Analytics** 📈
Discover what actually works:
- **Effectiveness comparison** (practice vs. placebo)
- **Time-of-day analysis**
- **Statistical confidence** indicators
- **Progress tracking** over time

---

## 🔬 Scientific Methodology

### N=1 Experiment Design

Our platform implements rigorous scientific principles:

| Principle | Implementation |
|-----------|----------------|
| **Randomization** | Slots randomly assigned as practice or placebo |
| **Blinding** | Users unaware of placebo assignment |
| **Control Groups** | Placebo slots serve as controls |
| **Standardization** | Consistent metrics across all sessions |
| **Statistical Analysis** | Confidence intervals and effect sizes |

### Placebo Control System

- **30% placebo rate** for optimal statistical power
- **Identical interface** for practice and placebo slots
- **Same assessment process** for both types
- **Blinded analysis** until experiment completion

---

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ UserPractice : has
    User ||--o{ DayPlan : creates
    User ||--o{ Slot : schedules
    User ||--o{ Rating : provides
    
    PracticeTemplate ||--o{ UserPractice : template_for
    DayPlan ||--o{ Slot : contains
    UserPractice ||--o{ Slot : assigned_to
    Slot ||--|| Rating : rated_by
    
    User {
        uuid id PK
        string username
        string email
        image avatar
    }
    
    PracticeTemplate {
        uuid id PK
        string title
        text description
        int default_duration_sec
        string video
    }
    
    Slot {
        uuid id PK
        string variant
        string status
        string time_of_day
        datetime scheduled_at_utc
        int duration_sec_snapshot
    }
    
    Rating {
        uuid id PK
        int mood
        int ease
        int satisfaction
        int nervousness
    }
```

---

## 🔌 API Reference

### Authentication Endpoints

```http
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
```

### Practice Management

```http
GET    /api/practice-templates/     # List all templates
POST   /api/user-practices/         # Create user practice
GET    /api/user-practices/         # List user's practices
PATCH  /api/user-practices/{id}/    # Update practice
DELETE /api/user-practices/{id}/    # Delete practice
```

### Planning & Execution

```http
GET    /api/day-plans/              # List day plans
POST   /api/day-plans/              # Create day plan
GET    /api/slots/                  # List slots
PATCH  /api/slots/{id}/start/       # Start slot
PATCH  /api/slots/{id}/finish/      # Finish slot
```

### Analytics

```http
GET    /api/ratings/                # List ratings
POST   /api/ratings/                # Create rating
GET    /api/analytics/effectiveness/ # Practice effectiveness
```

---

## 🎨 UI Components

Built with modern, accessible components:

- **shadcn/ui** - High-quality, customizable components
- **Radix UI** - Unstyled, accessible primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library

### Component Examples

```tsx
// Practice Card Component
<Card className="practice-card">
  <CardHeader>
    <CardTitle>{practice.name}</CardTitle>
    <CardDescription>{practice.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge variant="outline">{practice.duration}min</Badge>
    <Switch checked={practice.active} />
  </CardContent>
</Card>

// Timer Component
<div className="timer-circle">
  <CircularProgress value={progress} />
  <div className="timer-display">{formatTime(remaining)}</div>
</div>
```

---

## 🌍 Internationalization

Full multi-language support with dynamic switching:

| Language | Code | Status |
|----------|------|--------|
| Русский | `ru` | ✅ Complete |
| English | `en` | ✅ Complete |
| Polski | `pl` | ✅ Complete |

### Translation System

```tsx
const translations = {
  'copy.practices.title': {
    ru: 'Выберите практики для эксперимента',
    en: 'Choose practices for your experiment',
    pl: 'Wybierz praktyki do eksperymentu'
  }
};

// Usage
const title = t('copy.practices.title', currentLanguage);
```

---

## 📱 Mobile Experience

- **Responsive Design** - Optimized for all screen sizes
- **Touch-Friendly** - Large touch targets and gestures
- **PWA Support** - Install as native app
- **Offline Capability** - Practice sessions work offline
- **Mobile Navigation** - Bottom tab navigation

---

## 🔒 Security & Privacy

- **JWT Authentication** with refresh token rotation
- **Password Validation** with strength requirements
- **CSRF Protection** on all forms
- **SQL Injection Prevention** through ORM
- **XSS Protection** with content sanitization
- **Data Encryption** for sensitive information

---

## 🚀 Deployment

### Production Environment

```bash
# Backend
pip install -r requirements.txt
python manage.py collectstatic
python manage.py migrate
gunicorn server.wsgi:application

# Frontend
npm run build
# Deploy dist/ folder to your CDN
```

### Docker Deployment

```bash
# Build images
docker build -t placebo-coach-backend ./backend
docker build -t placebo-coach-frontend ./frontend

# Run with docker-compose
docker-compose up -d
```

### Environment Variables

```env
# Backend
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/db
ALLOWED_HOSTS=yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 📈 Performance

- **Code Splitting** - Lazy loading for optimal bundle size
- **Image Optimization** - WebP format with fallbacks
- **API Caching** - Redis for frequently accessed data
- **Database Indexing** - Optimized queries
- **CDN Integration** - Global content delivery

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Unsplash](https://unsplash.com) for high-quality stock photos
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

## 🔮 Roadmap

- [ ] Machine learning-powered recommendations
- [ ] Advanced statistical analysis
- [ ] Social features and community challenges
- [ ] Native mobile apps (iOS/Android)
- [ ] Integration with fitness trackers
- [ ] Advanced reporting and insights
- [ ] AI coach for personalized guidance
- [ ] Integration with health platforms
- [ ] Enterprise features for organizations

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/placebo-coach?style=social)](https://github.com/yourusername/placebo-coach)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/placebo-coach?style=social)](https://github.com/yourusername/placebo-coach)

---

**⚠️ Disclaimer**: This is an N=1 experiment platform, not medical advice. Consult healthcare professionals for serious health concerns.

</div>

