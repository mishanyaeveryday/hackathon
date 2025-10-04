import React, { useState, useEffect } from 'react';
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Slider } from "./components/ui/slider";
import { Checkbox } from "./components/ui/checkbox";
import { Switch } from "./components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

import { Skeleton } from "./components/ui/skeleton";

// load tokens on module init
loadTokensFromStorage();

import { loadTokensFromStorage, apiLogin, apiRegister, apiLogout,
  apiGetPracticeTemplates, apiGetUserPractices, apiAddUserPracticeFromTemplate, apiDeleteUserPractice,
  apiCreateDayPlan, apiCreateSlot, apiStartSlot, apiFinishSlot, apiCreateRating } from './api';

// load tokens on module init
loadTokensFromStorage();

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  Play, 
  Pause, 
  Square, 
  User, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Calendar,
  Clock,
  CheckCircle,
  Sun,
  Moon,
  Sunrise,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowLeft,
  Languages
} from 'lucide-react';

// Types
type Practice = {
  id: string;
  name: string;
  duration: number;
  description: string;
  active: boolean;
};

type Slot = {
  id: string;
  practiceId: string | null;
  timeOfDay: 'morning' | 'day' | 'evening';
  duration: number;
  completed: boolean;
  date: string;
  instruction: string;
};

type Assessment = {
  slotId: string;
  mood: number;
  lightness: number;
  satisfaction: number;
  nervousness: number;
  timestamp: string;
};

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Language = 'ru' | 'en' | 'pl';

// Translation system
const translations = {
  'copy.brand.name': {
    ru: 'Placebo Coach',
    en: 'Placebo Coach', 
    pl: 'Placebo Coach'
  },
  'copy.nav.plan': {
    ru: 'План',
    en: 'Plan',
    pl: 'Plan dnia'
  },
  'copy.nav.slot': {
    ru: 'Слот',
    en: 'Slot',
    pl: 'Sesja'
  },
  'copy.nav.dashboard': {
    ru: 'Дашборд',
    en: 'Dashboard',
    pl: 'Panel'
  },
  'copy.nav.settings': {
    ru: 'Настройки',
    en: 'Settings',
    pl: 'Ustawienia'
  },
  'copy.nav.profile': {
    ru: 'Профиль',
    en: 'Profile',
    pl: 'Profil'
  },
  'copy.nav.login': {
    ru: 'Войти',
    en: 'Log in',
    pl: 'Zaloguj się'
  },
  'copy.actions.createPlan': {
    ru: 'Составить план на сегодня',
    en: 'Create today\'s plan',
    pl: 'Ułóż plan na dziś'
  },
  'copy.slot.title': {
    ru: 'Слот #{{n}}',
    en: 'Slot #{{n}}',
    pl: 'Sesja #{{n}}'
  },
  'copy.slot.meta.today': {
    ru: 'сегодня',
    en: 'today',
    pl: 'dzisiaj'
  },
  'copy.slot.meta.morning': {
    ru: 'утром',
    en: 'morning',
    pl: 'rano'
  },
  'copy.slot.meta.afternoon': {
    ru: 'днём',
    en: 'afternoon',
    pl: 'po południu'
  },
  'copy.slot.meta.evening': {
    ru: 'вечером',
    en: 'evening',
    pl: 'wieczorem'
  },
  'copy.slot.cta.start': {
    ru: 'Старт',
    en: 'Start',
    pl: 'Start'
  },
  'copy.slot.cta.completed': {
    ru: 'Завершён',
    en: 'Completed',
    pl: 'Ukończono'
  },
  'copy.slot.cta.continue': {
    ru: 'Продолжить',
    en: 'Continue',
    pl: 'Kontynuuj'
  },
  'copy.slot.cta.pause': {
    ru: 'Пауза',
    en: 'Pause',
    pl: 'Pauza'
  },
  'copy.slot.cta.finish': {
    ru: 'Завершить',
    en: 'Finish',
    pl: 'Zakończ'
  },
  'copy.timer.instruction': {
    ru: 'Следуйте таймеру. Дышите спокойно или сидите удобно.',
    en: 'Follow the timer. Breathe calmly or sit comfortably.',
    pl: 'Postępuj według timera. Oddychaj spokojnie lub siedź wygodnie.'
  },
  'copy.timer.inProgress': {
    ru: 'Слот в процессе',
    en: 'Slot in progress',
    pl: 'Sesja w toku'
  },
  'copy.rating.title': {
    ru: 'Как вы сейчас?',
    en: 'How do you feel now?',
    pl: 'Jak się teraz czujesz?'
  },
  'copy.rating.subtitle': {
    ru: 'Оценка нужна, чтобы увидеть, что реально помогает',
    en: 'Rating helps us see what really works',
    pl: 'Ocena pomoże zobaczyć, co naprawdę działa'
  },
  'copy.rating.mood': {
    ru: 'Настроение',
    en: 'Mood',
    pl: 'Nastrój'
  },
  'copy.rating.ease': {
    ru: 'Чувство лёгкости',
    en: 'Ease',
    pl: 'Lekkość'
  },
  'copy.rating.satisfaction': {
    ru: 'Удовлетворённость',
    en: 'Satisfaction',
    pl: 'Satysfakcja'
  },
  'copy.rating.nervousness': {
    ru: 'Нервозность',
    en: 'Nervousness',
    pl: 'Nerwowość'
  },
  'copy.rating.save': {
    ru: 'Сохранить',
    en: 'Save',
    pl: 'Zapisz'
  },
  'copy.dashboard.summary.legend': {
    ru: 'Сравнение: слоты с практикой vs слоты "ничего не делать"',
    en: 'Comparison: practice slots vs "do nothing" slots',
    pl: 'Porównanie: sesje z praktyką vs „nic nie robić"'
  },
  'copy.dashboard.confidence.low': {
    ru: 'уверенность: низкая',
    en: 'confidence: low',
    pl: 'pewność: niska'
  },
  'copy.dashboard.confidence.med': {
    ru: 'уверенность: средняя',
    en: 'confidence: medium',
    pl: 'pewność: średnia'
  },
  'copy.dashboard.confidence.high': {
    ru: 'уверенность: высокая',
    en: 'confidence: high',
    pl: 'pewność: wysoka'
  },
  'copy.empty.moreData': {
    ru: 'Сделайте ещё {{n}} слота, чтобы появились первые выводы',
    en: 'Do {{n}} more slots to see first insights',
    pl: 'Wykonaj jeszcze {{n}} sesje, aby zobaczyć pierwsze wnioski'
  },
  'copy.empty.noSlots': {
    ru: 'План не составлен',
    en: 'No plan created',
    pl: 'Brak planu'
  },
  'copy.empty.noPlan': {
    ru: 'Вернитесь к выбору практик и создайте план на сегодня',
    en: 'Go back to practice selection and create today\'s plan',
    pl: 'Wróć do wyboru praktyk i utwórz plan na dziś'
  },
  'copy.empty.createPlan': {
    ru: 'Составить план',
    en: 'Create plan',
    pl: 'Utwórz plan'
  },
  'copy.auth.login': {
    ru: 'Вход',
    en: 'Log in',
    pl: 'Logowanie'
  },
  'copy.auth.register': {
    ru: 'Создать аккаунт',
    en: 'Create account',
    pl: 'Utwórz konto'
  },
  'copy.auth.email': {
    ru: 'Email',
    en: 'Email',
    pl: 'Email'
  },
  'copy.auth.password': {
    ru: 'Пароль',
    en: 'Password',
    pl: 'Hasło'
  },
  'copy.auth.firstName': {
    ru: 'Имя',
    en: 'First name',
    pl: 'Imię'
  },
  'copy.auth.lastName': {
    ru: 'Фамилия',
    en: 'Last name',
    pl: 'Nazwisko'
  },
  'copy.auth.subtitle.login': {
    ru: 'Продолжим ваш N=1 эксперимент',
    en: 'Continue your N=1 experiment',
    pl: 'Kontynuuj swój eksperyment N=1'
  },
  'copy.auth.subtitle.register': {
    ru: 'Пара экранов — и можно к практике',
    en: 'A few screens and you\'re ready to practice',
    pl: 'Kilka ekranów i możesz zacząć praktykować'
  },
  'copy.auth.rememberMe': {
    ru: 'Запомнить меня',
    en: 'Remember me',
    pl: 'Zapamiętaj mnie'
  },
  'copy.auth.noAccount': {
    ru: 'Нет аккаунта?',
    en: 'No account?',
    pl: 'Nie masz konta?'
  },
  'copy.auth.hasAccount': {
    ru: 'Уже есть аккаунт?',
    en: 'Already have an account?',
    pl: 'Masz już konto?'
  },
  'copy.auth.registerLink': {
    ru: 'Зарегистрироваться',
    en: 'Register',
    pl: 'Zarejestruj się'
  },
  'copy.auth.loginLink': {
    ru: 'Войти',
    en: 'Log in',
    pl: 'Zaloguj się'
  },
  'copy.auth.disclaimer': {
    ru: 'Это N=1 эксперимент, не медицинская рекомендация',
    en: 'This is an N=1 experiment, not medical advice',
    pl: 'To eksperyment N=1, a nie porada medyczna'
  },
  'copy.practices.title': {
    ru: 'Выберите практики для эксперимента',
    en: 'Choose practices for your experiment',
    pl: 'Wybierz praktyki do eksperymentu'
  },
  'copy.practices.subtitle': {
    ru: 'Отметьте практики, которые хотите протестировать. Слоты иногда будут "нейтральными" — интерфейс специально не раскрывает какие. Это нужно для честного сравнения.',
    en: 'Select practices you want to test. Some slots will be "neutral" — the interface deliberately doesn\'t reveal which ones. This ensures fair comparison.',
    pl: 'Zaznacz praktyki, które chcesz przetestować. Niektóre sesje będą „neutralne" — interfejs celowo nie ujawnia które. To zapewnia uczciwe porównanie.'
  },
  'copy.plan.title': {
    ru: 'План на сегодня',
    en: 'Today\'s plan',
    pl: 'Plan na dziś'
  },
  'copy.plan.subtitle': {
    ru: '{{n}} слотов готовы к выполнению',
    en: '{{n}} slots ready to complete',
    pl: '{{n}} sesji gotowych do wykonania'
  },
  'copy.profile.title': {
    ru: 'Профиль пользователя',
    en: 'User Profile',
    pl: 'Profil użytkownika'
  },
  'copy.profile.subtitle': {
    ru: 'Ваш прогресс и статистика N=1 экспериментов',
    en: 'Your progress and N=1 experiment statistics',
    pl: 'Twój postęp i statystyki eksperymentów N=1'
  },
  'copy.language.selector': {
    ru: 'Язык',
    en: 'Language',
    pl: 'Język'
  }
} as const;

// Translation function with interpolation
const t = (key: keyof typeof translations, lang: Language, vars?: Record<string, string | number>): string => {
  let text: string = translations[key]?.[lang] ?? translations[key]?.['ru'] ?? key as string;
  
  if (vars) {
    Object.entries(vars).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), String(value));
    });
  }
  
  return text;
};

// Initial data with translations
const practiceTranslations = {
  '1': {
    name: {
      ru: 'Дыхание 4-7-8',
      en: '4-7-8 Breathing',
      pl: 'Oddech 4-7-8'
    },
    description: {
      ru: 'Техника глубокого дыхания для расслабления',
      en: 'Deep breathing technique for relaxation',
      pl: 'Technika głębokiego oddychania do relaksacji'
    }
  },
  '2': {
    name: {
      ru: '10 приседаний',
      en: '10 squats',
      pl: '10 przysiadów'
    },
    description: {
      ru: 'Лёгкая физическая активность',
      en: 'Light physical activity',
      pl: 'Lekka aktywność fizyczna'
    }
  },
  '3': {
    name: {
      ru: '30 сек солнечного света',
      en: '30 sec sunlight',
      pl: '30 sek światła słonecznego'
    },
    description: {
      ru: 'Естественное освещение для бодрости',
      en: 'Natural light for energy',
      pl: 'Naturalne światło dla energii'
    }
  }
};

const getInitialPractices = (lang: Language): Practice[] => [
  {
    id: '1',
    name: practiceTranslations['1'].name[lang],
    duration: 2,
    description: practiceTranslations['1'].description[lang],
    active: true
  },
  {
    id: '2', 
    name: practiceTranslations['2'].name[lang],
    duration: 1,
    description: practiceTranslations['2'].description[lang],
    active: true
  },
  {
    id: '3',
    name: practiceTranslations['3'].name[lang],
    duration: 0.5,
    description: practiceTranslations['3'].description[lang],
    active: true
  }
];

// Mock data for dashboard
const mockChartData = [
  { timeOfDay: 'Утро', mood: 6.2, lightness: 7.1, satisfaction: 5.8, nervousness: 4.3 },
  { timeOfDay: 'День', mood: 7.5, lightness: 6.8, satisfaction: 7.2, nervousness: 3.9 },
  { timeOfDay: 'Вечер', mood: 6.9, lightness: 6.2, satisfaction: 6.8, nervousness: 5.1 }
];

export default function App() {
  // State management
  const [currentScreen, setCurrentScreen] = useState<'practices' | 'plan' | 'slot' | 'dashboard' | 'settings' | 'login' | 'register' | 'profile'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');
  
  

useEffect(() => { // auto-load practices if tokens exist
  const access = localStorage.getItem('access');
  if (!access) return;
  (async () => {
    try {
      setIsAuthenticated(true);
      await loadPractices();
      setCurrentScreen('practices');
    } catch {}
  })();
}, []);
const [userPracticeByTemplate, setUserPracticeByTemplate] = useState<Record<string,string>>({});
const [practices, setPractices] = useState<Practice[]>(getInitialPractices(currentLanguage));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessment, setAssessment] = useState({
    mood: [5],
    lightness: [5],
    satisfaction: [5],
    nervousness: [5]
  });

  // Auth form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerState('completed');
            setShowAssessment(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState, timeRemaining]);

  // Update practices when language changes
  useEffect(() => {
    setPractices(prevPractices => {
      const updatedPractices = getInitialPractices(currentLanguage);
      return updatedPractices.map(newPractice => ({
        ...newPractice,
        active: prevPractices.find(p => p.id === newPractice.id)?.active ?? newPractice.active
      }));
    });
  }, [currentLanguage]);

  

// Load practices from API (templates + user selections)
async function loadPractices() {
  try {
    const templates = await apiGetPracticeTemplates();
    const ups = await apiGetUserPractices();
    const mapUP: Record<string,string> = {};
    ups.forEach(up => { mapUP[up.template] = up.id; });
    setUserPracticeByTemplate(mapUP);
    const toPractice = (tpl: any): Practice => ({
      id: tpl.id,
      name: tpl.title,
      duration: (tpl.default_duration_sec ?? 120) / 60,
      description: tpl.description ?? '',
      active: Boolean(mapUP[tpl.id])
    });
    setPractices(templates.map(toPractice));
  } catch (e) {
    console.warn('Failed to load practices from API', e);
  }
}

// Generate daily plan
  const generateDayPlan = async () => {
    const activePractices = practices.filter(p => p.active);
    const today = new Date().toISOString().split('T')[0];
    const timeSlots: ('morning' | 'day' | 'evening')[] = ['morning', 'day', 'evening'];

    let serverDayPlanId: string | null = null;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const dp = await apiCreateDayPlan(today, tz);
      serverDayPlanId = dp.id;
    } catch (e) {
      console.warn('DayPlan create failed (maybe admin-only). Continue locally.');
    }

    const newSlots: Slot[] = [];
    let doCount = 0, ctrlCount = 0;

    for (let i = 0; i < 6; i++) {
      const isDo = doCount <= ctrlCount;
      const practiceId = isDo ? (activePractices[Math.floor(Math.random() * activePractices.length)]?.id || null) : null;
      if (isDo) doCount++; else ctrlCount++;
      const timeOfDay = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      newSlots.push({
        id: `slot-${Date.now()}-${i}`,
        practiceId,
        timeOfDay,
        duration: practiceId ? practices.find(p => p.id === practiceId)?.duration || 2 : 2,
        completed: false,
        date: today,
        instruction: t('copy.timer.instruction', currentLanguage)
      });

      if (serverDayPlanId) {
        try {
          const variant = isDo ? 'DO' : 'CONTROL';
          const tod = timeOfDay === 'morning' ? 'MORNING' : timeOfDay === 'day' ? 'AFTERNOON' : 'EVENING';
          const scheduled = new Date(Date.now() + (i+1)*60*60*1000).toISOString();
          const upId = practiceId ? userPracticeByTemplate[practiceId] : null;
          await apiCreateSlot({
            day_plan: serverDayPlanId,
            user_practice: upId,
            variant,
            status: 'PLANNED',
            time_of_day: tod,
            scheduled_at_utc: scheduled,
            duration_sec_snapshot: Math.round((practiceId ? (practices.find(p => p.id === practiceId)?.duration || 2) : 2) * 60),
            display_payload: { neutral_instruction: t('copy.timer.instruction', currentLanguage) }
          });
        } catch (e) {
          console.warn('Create slot failed', e);
        }
      }
    }

    setSlots(newSlots);
    setCurrentScreen('plan');
  };


  // Start slot timer
  const startSlot = (slot: Slot) => {
    setCurrentSlot(slot);
    setTimeRemaining(slot.duration * 60); // Convert to seconds
    setTimerState('idle');
    setCurrentScreen('slot');
  };

  // Timer controls
  const startTimer = () => setTimerState('running');
  const pauseTimer = () => setTimerState('paused');
  const completeTimer = () => {
    setTimerState('completed');
    setShowAssessment(true);
  };

  // Save assessment
  const saveAssessment = () => {
    if (!currentSlot) return;
    
    const newAssessment: Assessment = {
      slotId: currentSlot.id,
      mood: assessment.mood[0],
      lightness: assessment.lightness[0],
      satisfaction: assessment.satisfaction[0],
      nervousness: assessment.nervousness[0],
      timestamp: new Date().toISOString()
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    setSlots(prev => prev.map(s => 
      s.id === currentSlot.id ? { ...s, completed: true } : s
    ));
    
    setShowAssessment(false);
    setCurrentScreen('dashboard');
    setCurrentSlot(null);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auth functions
  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (loginForm.email === 'test@example.com' && loginForm.password === 'password') {
      setCurrentUser({
        id: '1',
        email: loginForm.email,
        firstName: 'Тест',
        lastName: 'Пользователь'
      });
      setIsAuthenticated(true);
      setCurrentScreen('practices');
    } else {
      setAuthError('Неверный email или пароль');
    }
    
    setAuthLoading(false);
  };

  const handleRegister = async () => {
    setAuthLoading(true);
    setAuthError('');
    
    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Пароли не совпадают');
      setAuthLoading(false);
      return;
    }
    
    if (registerForm.password.length < 8) {
      setAuthError('Пароль должен содержать минимум 8 символов');
      setAuthLoading(false);
      return;
    }
    
    if (!registerForm.agreeToTerms) {
      setAuthError('Необходимо согласиться с условиями');
      setAuthLoading(false);
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentUser({
      id: '1',
      email: registerForm.email,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName
    });
    setIsAuthenticated(true);
    setCurrentScreen('practices');
    setAuthLoading(false);
  };

  const handleLogout = () => { apiLogout(); setCurrentUser(null); setIsAuthenticated(false); setCurrentScreen('login'); };

  // Get time of day icon
  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return <Sunrise className="w-4 h-4" />;
      case 'day': return <Sun className="w-4 h-4" />;
      case 'evening': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Language Switcher Component
  const LanguageSwitcher = () => {
    const languageOptions = [
      { value: 'ru' as Language, label: 'RU'},
      { value: 'en' as Language, label: 'EN'},
      { value: 'pl' as Language, label: 'PL'}
    ];

    return (
      <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
        <SelectTrigger className="w-20 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // Navigation component
  const Navigation = () => {
    const isAuthScreen = currentScreen === 'login' || currentScreen === 'register';
    
    return (
      <nav className="border-b bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl tracking-tight">{t('copy.brand.name', currentLanguage)}</h1>
            {isAuthenticated && !isAuthScreen && (
              <div className="hidden md:flex space-x-6">
                <Button 
                  variant={currentScreen === 'plan' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('plan')}
                  className="h-9"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('copy.nav.plan', currentLanguage)}
                </Button>
                <Button 
                  variant={currentScreen === 'slot' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('slot')}
                  className="h-9"
                  disabled={!currentSlot}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {t('copy.nav.slot', currentLanguage)}
                </Button>
                <Button 
                  variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('dashboard')}
                  className="h-9"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('copy.nav.dashboard', currentLanguage)}
                </Button>
                <Button 
                  variant={currentScreen === 'settings' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('settings')}
                  className="h-9"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  {t('copy.nav.settings', currentLanguage)}
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {isAuthenticated && !isAuthScreen ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentScreen('profile')}
                  title={t('copy.nav.profile', currentLanguage)}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ) : !isAuthScreen ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentScreen('login')}
                title={t('copy.nav.login', currentLanguage)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('copy.nav.login', currentLanguage)}
              </Button>
            ) : null}
          </div>
        </div>
      </nav>
    );
  };

  // Practice Selection Screen
  const PracticeSelection = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="mb-4">{t('copy.practices.title', currentLanguage)}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('copy.practices.subtitle', currentLanguage)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {practices.map(practice => (
          <Card key={practice.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{practice.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3">{practice.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {practice.duration === 0.5 ? 
                      (currentLanguage === 'ru' ? '30 сек' : 
                       currentLanguage === 'en' ? '30 sec' : '30 sek') : 
                      `${practice.duration} ${currentLanguage === 'ru' ? 'мин' : 
                                             currentLanguage === 'en' ? 'min' : 'min'}`}
                  </Badge>
                </div>
                <Checkbox 
                  checked={practice.active}
                  
onCheckedChange={async (checked: any) => {
                const isActive = !!checked;
                setPractices(prev => prev.map(p => p.id === practice.id ? { ...p, active: isActive } : p));
                try {
                  if (isActive) {
                    const up = await apiAddUserPracticeFromTemplate(practice.id);
                    setUserPracticeByTemplate(prev => ({ ...prev, [practice.id]: up.id }));
                  } else {
                    const upId = userPracticeByTemplate[practice.id];
                    if (upId) {
                      await apiDeleteUserPractice(upId);
                      setUserPracticeByTemplate(prev => { const next = { ...prev }; delete next[practice.id]; return next; });
                    }
                  }
                } catch (e) {
                  setPractices(prev => prev.map(p => p.id === practice.id ? { ...p, active: !isActive } : p));
                }
              }}
                  className="mt-1"
                />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Button 
          onClick={generateDayPlan}
          disabled={!practices.some(p => p.active)}
          size="lg"
          className="px-8"
        >
          {t('copy.actions.createPlan', currentLanguage)}
        </Button>
      </div>
    </div>
  );

  // Day Plan Screen
  const DayPlan = () => {
    const getTimeOfDayText = (timeOfDay: string) => {
      switch (timeOfDay) {
        case 'morning': return t('copy.slot.meta.morning', currentLanguage);
        case 'day': return t('copy.slot.meta.afternoon', currentLanguage);
        case 'evening': return t('copy.slot.meta.evening', currentLanguage);
        default: return timeOfDay;
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">{t('copy.plan.title', currentLanguage)}</h2>
          <p className="text-muted-foreground">
            {t('copy.plan.subtitle', currentLanguage, { n: slots.length.toString() })}
          </p>
        </div>
        
        {slots.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="mb-2">{t('copy.empty.noSlots', currentLanguage)}</h3>
              <p className="text-muted-foreground mb-6">
                {t('copy.empty.noPlan', currentLanguage)}
              </p>
              <Button onClick={() => setCurrentScreen('practices')}>
                {t('copy.empty.createPlan', currentLanguage)}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slots.map((slot, index) => (
              <Card key={slot.id} className={slot.completed ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">
                      {t('copy.slot.title', currentLanguage, { n: (index + 1).toString() })}
                    </CardTitle>
                    {slot.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    {getTimeIcon(slot.timeOfDay)}
                    <span className="capitalize">{getTimeOfDayText(slot.timeOfDay)}</span>
                    <span>•</span>
                    <span>
                      {slot.duration === 0.5 ? 
                        (currentLanguage === 'ru' ? '30 сек' : 
                         currentLanguage === 'en' ? '30 sec' : '30 sek') : 
                        `${slot.duration} ${currentLanguage === 'ru' ? 'мин' : 
                                           currentLanguage === 'en' ? 'min' : 'min'}`}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {t('copy.slot.meta.today', currentLanguage)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('copy.timer.instruction', currentLanguage)}
                  </p>
                  <Button 
                    onClick={() => startSlot(slot)}
                    disabled={slot.completed}
                    className="w-full"
                  >
                    {slot.completed ? 
                      t('copy.slot.cta.completed', currentLanguage) : 
                      t('copy.slot.cta.start', currentLanguage)}
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Slot Timer Screen
  const SlotTimer = () => {
    if (!currentSlot) return null;
    
    const progress = currentSlot.duration > 0 ? ((currentSlot.duration * 60 - timeRemaining) / (currentSlot.duration * 60)) * 100 : 0;
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-8">
            <h2 className="mb-2">{t('copy.timer.inProgress', currentLanguage)}</h2>
            <p className="text-muted-foreground">
              {t('copy.timer.instruction', currentLanguage)}
            </p>
          </div>
          
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-mono mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentSlot.duration === 0.5 ? 
                      (currentLanguage === 'ru' ? '30 сек' : 
                       currentLanguage === 'en' ? '30 sec' : '30 sek') : 
                      `${currentSlot.duration} ${currentLanguage === 'ru' ? 'мин' : 
                                                 currentLanguage === 'en' ? 'min' : 'min'}`}
                  </div>
                </div>
              </div>
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {timerState === 'idle' && (
              <Button onClick={startTimer} size="lg">
                <Play className="w-5 h-5 mr-2" />
                {t('copy.slot.cta.start', currentLanguage)}
              </Button>
            )}
            {timerState === 'running' && (
              <Button onClick={pauseTimer} variant="outline" size="lg">
                <Pause className="w-5 h-5 mr-2" />
                {t('copy.slot.cta.pause', currentLanguage)}
              </Button>
            )}
            {timerState === 'paused' && (
              <Button onClick={startTimer} size="lg">
                <Play className="w-5 h-5 mr-2" />
                {t('copy.slot.cta.continue', currentLanguage)}
              </Button>
            )}
            <Button onClick={completeTimer} variant="outline" size="lg">
              <Square className="w-5 h-5 mr-2" />
              {t('copy.slot.cta.finish', currentLanguage)}
            </Button>
          </div>
        </div>
        
        {/* Assessment Modal */}
        {showAssessment && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-t-lg p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">{t('copy.rating.title', currentLanguage)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('copy.rating.subtitle', currentLanguage)}
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>{t('copy.rating.mood', currentLanguage)}</label>
                    <span className="text-sm text-muted-foreground">{assessment.mood[0]}</span>
                  </div>
                  <Slider
                    value={assessment.mood}
                    onValueChange={(value: any) => setAssessment(prev => ({ ...prev, mood: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>{t('copy.rating.ease', currentLanguage)}</label>
                    <span className="text-sm text-muted-foreground">{assessment.lightness[0]}</span>
                  </div>
                  <Slider
                    value={assessment.lightness}
                    onValueChange={(value: any) => setAssessment(prev => ({ ...prev, lightness: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>{t('copy.rating.satisfaction', currentLanguage)}</label>
                    <span className="text-sm text-muted-foreground">{assessment.satisfaction[0]}</span>
                  </div>
                  <Slider
                    value={assessment.satisfaction}
                    onValueChange={(value: any) => setAssessment(prev => ({ ...prev, satisfaction: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>{t('copy.rating.nervousness', currentLanguage)}</label>
                    <span className="text-sm text-muted-foreground">{assessment.nervousness[0]}</span>
                  </div>
                  <Slider
                    value={assessment.nervousness}
                    onValueChange={(value: any) => setAssessment(prev => ({ ...prev, nervousness: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <Button onClick={saveAssessment} className="w-full" size="lg">
                  {t('copy.rating.save', currentLanguage)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>
        <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('copy.auth.login', currentLanguage)}</CardTitle>
          <p className="text-muted-foreground">
            {t('copy.auth.subtitle.login', currentLanguage)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {authError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {authError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('copy.auth.email', currentLanguage)}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={authLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('copy.auth.password', currentLanguage)}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={currentLanguage === 'ru' ? 'Введите пароль' : 
                             currentLanguage === 'en' ? 'Enter password' : 'Wprowadź hasło'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  disabled={authLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={loginForm.rememberMe}
                onCheckedChange={(checked: any) => setLoginForm(prev => ({ ...prev, rememberMe: !!checked }))}
                disabled={authLoading}
              />
              <Label htmlFor="remember" className="text-sm">
                {t('copy.auth.rememberMe', currentLanguage)}
              </Label>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            size="lg"
            disabled={authLoading || !loginForm.email || !loginForm.password}
          >
            {authLoading ? 
              (currentLanguage === 'ru' ? 'Вход...' : 
               currentLanguage === 'en' ? 'Logging in...' : 'Logowanie...') : 
              t('copy.auth.loginLink', currentLanguage)}
          </Button>
          
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              {currentLanguage === 'ru' ? 'Демо' : 
               currentLanguage === 'en' ? 'Demo' : 'Demo'}: test@example.com / password
            </div>
            <p className="text-sm text-muted-foreground">
              {t('copy.auth.noAccount', currentLanguage)}{' '}
              <button
                onClick={() => setCurrentScreen('register')}
                className="text-primary hover:underline"
                disabled={authLoading}
              >
                {t('copy.auth.registerLink', currentLanguage)}
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              {t('copy.auth.disclaimer', currentLanguage)}
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );

  // Register Screen
  const RegisterScreen = () => {
    const getPasswordStrength = () => {
      if (registerForm.password.length < 6) {
        return currentLanguage === 'ru' ? 'Слабый' : 
               currentLanguage === 'en' ? 'Weak' : 'Słaby';
      } else if (registerForm.password.length < 8) {
        return currentLanguage === 'ru' ? 'Средний' : 
               currentLanguage === 'en' ? 'Medium' : 'Średni';
      } else if (registerForm.password.length < 10) {
        return currentLanguage === 'ru' ? 'Хороший' : 
               currentLanguage === 'en' ? 'Good' : 'Dobry';
      } else {
        return currentLanguage === 'ru' ? 'Сильный' : 
               currentLanguage === 'en' ? 'Strong' : 'Silny';
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('copy.auth.register', currentLanguage)}</CardTitle>
            <p className="text-muted-foreground">
              {t('copy.auth.subtitle.register', currentLanguage)}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {authError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                {authError}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('copy.auth.firstName', currentLanguage)}</Label>
                  <Input
                    id="firstName"
                    placeholder={t('copy.auth.firstName', currentLanguage)}
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('copy.auth.lastName', currentLanguage)}</Label>
                  <Input
                    id="lastName"
                    placeholder={t('copy.auth.lastName', currentLanguage)}
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={authLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registerEmail">{t('copy.auth.email', currentLanguage)}</Label>
                <Input
                  id="registerEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={authLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registerPassword">{t('copy.auth.password', currentLanguage)}</Label>
                <div className="relative">
                  <Input
                    id="registerPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={currentLanguage === 'ru' ? 'Минимум 8 символов' : 
                               currentLanguage === 'en' ? 'Minimum 8 characters' : 'Minimum 8 znaków'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={authLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={authLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {registerForm.password && (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={`h-1 flex-1 rounded-full ${
                            registerForm.password.length >= segment * 2
                              ? registerForm.password.length < 6
                                ? 'bg-red-400'
                                : registerForm.password.length < 8
                                ? 'bg-orange-400'
                                : registerForm.password.length < 10
                                ? 'bg-green-400'
                                : 'bg-blue-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getPasswordStrength()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {currentLanguage === 'ru' ? 'Подтвердить пароль' : 
                   currentLanguage === 'en' ? 'Confirm password' : 'Potwierdź hasło'}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={currentLanguage === 'ru' ? 'Повторите пароль' : 
                               currentLanguage === 'en' ? 'Repeat password' : 'Powtórz hasło'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={authLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={authLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={registerForm.agreeToTerms}
                  onCheckedChange={(checked: any) => setRegisterForm(prev => ({ ...prev, agreeToTerms: !!checked }))}
                  disabled={authLoading}
                />
                <Label htmlFor="terms" className="text-sm">
                  {currentLanguage === 'ru' ? 'Согласен с условиями и политикой' : 
                   currentLanguage === 'en' ? 'Agree with terms and policy' : 'Zgadzam się z warunkami i polityką'}
                </Label>
              </div>
            </div>
            
            <Button 
              onClick={handleRegister} 
              className="w-full" 
              size="lg"
              disabled={authLoading || !registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.agreeToTerms}
            >
              {authLoading ? 
                (currentLanguage === 'ru' ? 'Создание...' : 
                 currentLanguage === 'en' ? 'Creating...' : 'Tworzenie...') : 
                t('copy.auth.register', currentLanguage)}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('copy.auth.hasAccount', currentLanguage)}{' '}
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="text-primary hover:underline"
                  disabled={authLoading}
                >
                  {t('copy.auth.loginLink', currentLanguage)}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  };

  // Profile Screen
  const ProfileScreen = () => {
    // Calculate user statistics
    const completedSlots = slots.filter(slot => slot.completed).length;
    const totalSlots = slots.length;
    const completionRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;
    
    // Calculate practice stats
    const practiceStats = practices.map(practice => {
      const practiceSlots = slots.filter(slot => slot.practiceId === practice.id);
      const completedPracticeSlots = practiceSlots.filter(slot => slot.completed);
      const practiceAssessments = assessments.filter(assessment => 
        practiceSlots.some(slot => slot.id === assessment.slotId)
      );
      
      const avgMood = practiceAssessments.length > 0 
        ? practiceAssessments.reduce((sum, a) => sum + a.mood, 0) / practiceAssessments.length 
        : 0;
        
      return {
        ...practice,
        completedSlots: completedPracticeSlots.length,
        totalSlots: practiceSlots.length,
        avgMood: Number(avgMood.toFixed(1))
      };
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">{t('copy.profile.title', currentLanguage)}</h2>
          <p className="text-muted-foreground">
            {t('copy.profile.subtitle', currentLanguage)}
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </CardTitle>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {currentLanguage === 'ru' ? 'Участник с' : 
                       currentLanguage === 'en' ? 'Member since' : 'Członek od'} {new Date().toLocaleDateString(
                        currentLanguage === 'ru' ? 'ru-RU' : 
                        currentLanguage === 'en' ? 'en-US' : 'pl-PL'
                      )}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  {currentLanguage === 'ru' ? 'Выйти' : 
                   currentLanguage === 'en' ? 'Log out' : 'Wyloguj się'}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Общий прогресс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">{completedSlots}</div>
                  <p className="text-sm text-muted-foreground">Завершено слотов</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">{completionRate}%</div>
                  <p className="text-sm text-muted-foreground">Процент выполнения</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">{assessments.length}</div>
                  <p className="text-sm text-muted-foreground">Оценок сделано</p>
                </div>
              </div>
              
              {totalSlots > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Прогресс выполнения</span>
                    <span>{completedSlots}/{totalSlots}</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика по практикам</CardTitle>
              <p className="text-sm text-muted-foreground">
                Эффективность и активность ваших практик
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {practiceStats.map(practice => (
                  <div key={practice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{practice.name}</div>
                        {!practice.active && (
                          <Badge variant="secondary" className="text-xs">Неактивна</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {practice.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Завершено: {practice.completedSlots}/{practice.totalSlots}
                        </span>
                        {practice.avgMood > 0 && (
                          <span className="text-muted-foreground">
                            Ср. настроение: {practice.avgMood}/10
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {practice.duration === 0.5 ? '30 сек' : `${practice.duration} мин`}
                      </Badge>
                      {practice.totalSlots > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round((practice.completedSlots / practice.totalSlots) * 100)}% выполнено
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {practiceStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Практики не найдены</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setCurrentScreen('practices')}
                    >
                      Выбрать практики
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {assessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние оценки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessments.slice(-5).reverse().map((assessment, index) => {
                    const slot = slots.find(s => s.id === assessment.slotId);
                    const practice = slot?.practiceId ? practices.find(p => p.id === slot.practiceId) : null;
                    const date = new Date(assessment.timestamp);
                    
                    return (
                      <div key={assessment.slotId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">
                            {practice?.name || 'Нейтральный слот'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString('ru-RU')} в {date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Настроение: {assessment.mood}/10
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Лёгкость: {assessment.lightness}/10
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentScreen('practices')}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Выбрать практики</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentScreen('plan')}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">План дня</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentScreen('dashboard')}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-sm">Дашборд</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentScreen('settings')}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-sm">Настройки</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Dashboard Screen
  const Dashboard = () => {
    const [selectedMetric, setSelectedMetric] = useState<'mood' | 'lightness' | 'satisfaction' | 'nervousness'>('mood');
    
    const getMetricLabel = (metric: string) => {
      switch (metric) {
        case 'mood': return t('copy.rating.mood', currentLanguage);
        case 'lightness': return t('copy.rating.ease', currentLanguage);
        case 'satisfaction': return t('copy.rating.satisfaction', currentLanguage);
        case 'nervousness': return t('copy.rating.nervousness', currentLanguage);
        default: return metric;
      }
    };

    const getMockChartData = () => {
      const morningLabel = currentLanguage === 'ru' ? 'Утро' : 
                          currentLanguage === 'en' ? 'Morning' : 'Rano';
      const dayLabel = currentLanguage === 'ru' ? 'День' : 
                      currentLanguage === 'en' ? 'Day' : 'Dzień';
      const eveningLabel = currentLanguage === 'ru' ? 'Вечер' : 
                          currentLanguage === 'en' ? 'Evening' : 'Wieczór';
      
      return [
        { timeOfDay: morningLabel, mood: 6.2, lightness: 7.1, satisfaction: 5.8, nervousness: 4.3 },
        { timeOfDay: dayLabel, mood: 7.5, lightness: 6.8, satisfaction: 7.2, nervousness: 3.9 },
        { timeOfDay: eveningLabel, mood: 6.9, lightness: 6.2, satisfaction: 6.8, nervousness: 5.1 }
      ];
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">{t('copy.nav.dashboard', currentLanguage)}</h2>
          <p className="text-muted-foreground">
            {currentLanguage === 'ru' ? 'Анализ эффективности практик' : 
             currentLanguage === 'en' ? 'Practice effectiveness analysis' : 'Analiza skuteczności praktyk'}
          </p>
        </div>
        
        {assessments.length < 3 ? (
          <Card className="text-center py-12 mb-8">
            <CardContent>
              <h3 className="mb-2">
                {currentLanguage === 'ru' ? 'Недостаточно данных' : 
                 currentLanguage === 'en' ? 'Not enough data' : 'Za mało danych'}
              </h3>
              <p className="text-muted-foreground">
                {t('copy.empty.moreData', currentLanguage, { n: (3 - assessments.length).toString() })}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="mb-4">
                {currentLanguage === 'ru' ? 'Итоги по практикам' : 
                 currentLanguage === 'en' ? 'Practice results' : 'Wyniki praktyk'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practices.filter(p => p.active).map(practice => (
                  <Card key={practice.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{practice.name}</CardTitle>
                      <div className="text-2xl mb-2">
                        {currentLanguage === 'ru' ? '+0.7 к настроению' : 
                         currentLanguage === 'en' ? '+0.7 to mood' : '+0.7 do nastroju'}
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {t('copy.dashboard.confidence.med', currentLanguage)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('copy.dashboard.summary.legend', currentLanguage)}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {currentLanguage === 'ru' ? 'По времени суток' : 
                     currentLanguage === 'en' ? 'By time of day' : 'Według pory dnia'}
                  </CardTitle>
                  <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                    <TabsList>
                      <TabsTrigger value="mood">{t('copy.rating.mood', currentLanguage)}</TabsTrigger>
                      <TabsTrigger value="lightness">{t('copy.rating.ease', currentLanguage)}</TabsTrigger>
                      <TabsTrigger value="satisfaction">{t('copy.rating.satisfaction', currentLanguage)}</TabsTrigger>
                      <TabsTrigger value="nervousness">{t('copy.rating.nervousness', currentLanguage)}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMockChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timeOfDay" />
                      <YAxis domain={[0, 10]} />
                      <Bar dataKey={selectedMetric} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  // Settings Screen  
  const Settings = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2">{t('copy.nav.settings', currentLanguage)}</h2>
        <p className="text-muted-foreground">
          {currentLanguage === 'ru' ? 'Управление практиками и данными' : 
           currentLanguage === 'en' ? 'Manage practices and data' : 'Zarządzaj praktykami i danymi'}
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ru' ? 'Язык интерфейса' : 
               currentLanguage === 'en' ? 'Interface Language' : 'Język interfejsu'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label>{t('copy.language.selector', currentLanguage)}</Label>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentLanguage === 'ru' ? 'Практики' : 
               currentLanguage === 'en' ? 'Practices' : 'Praktyki'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {practices.map(practice => (
              <div key={practice.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{practice.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {practice.duration === 0.5 ? '30 секунд' : `${practice.duration} минут`}
                  </div>
                </div>
                <Switch 
                  checked={practice.active}
                  onCheckedChange={(checked: any) => {
                    setPractices(prev => prev.map(p => 
                      p.id === practice.id ? { ...p, active: checked } : p
                    ));
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Данные</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => {
                setSlots([]);
                setAssessments([]);
                setCurrentSlot(null);
              }}
            >
              Сбросить демо-данные
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Это N=1 эксперимент, не медицинская рекомендация. 
              Консультируйтесь с врачом ��ри серьёзных проблемах со здоровьем.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Mobile Navigation
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
      <div className="flex justify-around">
        <Button 
          variant={currentScreen === 'plan' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('plan')}
          size="sm"
          title={t('copy.nav.plan', currentLanguage)}
        >
          <Calendar className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'slot' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('slot')}
          size="sm"
          disabled={!currentSlot}
          title={t('copy.nav.slot', currentLanguage)}
        >
          <Clock className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('dashboard')}
          size="sm"
          title={t('copy.nav.dashboard', currentLanguage)}
        >
          <LayoutDashboard className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'settings' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('settings')}
          size="sm"
          title={t('copy.nav.settings', currentLanguage)}
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          onClick={() => setCurrentScreen('profile')}
          size="sm"
          title={t('copy.nav.profile', currentLanguage)}
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login': return <LoginScreen />;
      case 'register': return <RegisterScreen />;
      case 'practices': return <PracticeSelection />;
      case 'plan': return <DayPlan />;
      case 'slot': return <SlotTimer />;
      case 'dashboard': return <Dashboard />;
      case 'settings': return <Settings />;
      case 'profile': return <ProfileScreen />;
      default: return isAuthenticated ? <PracticeSelection /> : <LoginScreen />;
    }
  };

  const isAuthScreen = currentScreen === 'login' || currentScreen === 'register';
  
  return (
    <div className="min-h-screen bg-background">
      {!isAuthScreen && <Navigation />}
      <main className={isAuthScreen ? "" : "pb-20 md:pb-0"}>
        {renderScreen()}
      </main>
      {!isAuthScreen && isAuthenticated && <MobileNav />}
    </div>
  );
}