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
import { loadTokensFromStorage, apiLogin, apiRegister, apiLogout,
  apiGetPracticeTemplates,
  apiCreateDayPlan, apiGetDayPlanByDate, apiCreateSlot, apiStartSlot, apiFinishSlot, apiCreateRating, 
  apiListSlots,
  apiUpdatePracticeTemplate,
  apiGenerateSlotsForPlan,
  apiGeneratePractices,
  apiDeleteSlot,
  apiDeletePracticeTemplate} from './api';
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

loadTokensFromStorage();

// Types
type Practice = {
  id: string;
  name: string;
  duration: number;
  description: string;
  selected: boolean;
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
  },
  'copy.common.minutes': {
    ru: 'мин',
    en: 'min',
    pl: 'min'
  },
  'copy.common.seconds30': {
    ru: '30 сек',
    en: '30 sec',
    pl: '30 sek'
  },
  'copy.common.neutralSlot': {
    ru: 'Нейтральный слот',
    en: 'Neutral slot',
    pl: 'Sesja neutralna'
  },
  'copy.profile.overview':        { ru: 'Общий прогресс', en: 'Overall progress',        pl: 'Postęp ogólny' },
  'copy.profile.completedSlots':  { ru: 'Завершено слотов', en: 'Slots completed',        pl: 'Zakończone sesje' },
  'copy.profile.completionRate':  { ru: 'Процент выполнения', en: 'Completion rate',      pl: 'Wskaźnik realizacji' },
  'copy.profile.ratingsMade':     { ru: 'Оценок сделано', en: 'Ratings made',            pl: 'Wystawione oceny' },
  'copy.profile.progressLabel':   { ru: 'Прогресс выполнения', en: 'Completion progress', pl: 'Postęp realizacji' },

  'copy.profile.practiceStats':   { ru: 'Статистика по практикам', en: 'Practice statistics', pl: 'Statystyki praktyk' },
  'copy.profile.practiceStatsSub':{ ru: 'Эффективность и активность ваших практик', en: 'Effectiveness and activity of your practices', pl: 'Skuteczność i aktywność twoich praktyk' },
  'copy.profile.inactive':        { ru: 'Неактивна', en: 'Inactive',                     pl: 'Nieaktywna' },
  'copy.profile.completedOf':     { ru: 'Завершено', en: 'Completed',                     pl: 'Zakończono' },
  'copy.profile.avgMood':         { ru: 'Ср. настроение', en: 'Avg. mood',               pl: 'Śr. nastrój' },
  'copy.profile.recentRatings':   { ru: 'Последние оценки', en: 'Recent ratings',        pl: 'Ostatnie oceny' },
  'copy.profile.quickActions':    { ru: 'Быстрые действия', en: 'Quick actions',         pl: 'Szybkie działania' },
  'copy.profile.choosePractices': { ru: 'Выбрать практики', en: 'Choose practices',      pl: 'Wybierz praktyki' },
  'copy.profile.dayPlan':         { ru: 'План дня', en: 'Day plan',                      pl: 'Plan dnia' },
  'copy.profile.completedPercent':{ ru: 'выполнено', en: 'completed',                    pl: 'ukończono' },
  'copy.profile.noPractices':     { ru: 'Практики не найдены', en: 'No practices found', pl: 'Nie znaleziono praktyk' },

  'copy.common.at':               { ru: 'в', en: 'at',                                   pl: 'o' },
  'copy.settings.data': {
    ru: 'Данные',
    en: 'Data',
    pl: 'Dane'
  },
  'copy.settings.resetDemo': {
    ru: 'Сбросить демо-данные',
    en: 'Reset demo data',
    pl: 'Resetuj dane demo'
  },
  'copy.settings.disclaimer': {
    ru: 'Это эксперимент N=1, не медицинская рекомендация. При серьёзных проблемах со здоровьем консультируйтесь с врачом.',
    en: 'This is an N=1 experiment, not medical advice. Consult a doctor for serious health issues.',
    pl: 'To eksperyment N=1, a nie porada medyczna. W przypadku poważnych problemów zdrowotnych skonsultuj się z lekarzem.'}
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

function getLocale(lang: Language): string {
  return lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'pl-PL';
}
function formatDuration(lang: Language, duration: number): string {
  if (duration === 0.5) {
    return lang === 'ru' ? '30 сек' : (lang === 'en' ? '30 sec' : '30 sek');
  }
  const unit = lang === 'ru' ? 'мин' : 'min';
  return `${duration} ${unit}`;
}


export default function App() {
  // State management
  const [currentScreen, setCurrentScreen] = useState<'practices' | 'plan' | 'slot' | 'dashboard' | 'settings' | 'login' | 'register' | 'profile'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const locale = getLocale(currentLanguage);

useEffect(() => { // auto-load practices if tokens exist
  setCurrentScreen('login');
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
const [practices, setPractices] = useState<Practice[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [historyData, setHistoryData] = useState<{date: string, slots: Slot[], completed: number}[]>([]);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Cookie-based persistence functions
  const saveToCookies = (key: string, data: any) => {
    try {
      const serialized = JSON.stringify(data);
      document.cookie = `${key}=${encodeURIComponent(serialized)}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      console.log(`Saved to cookies: ${key}`, data);
    } catch (e) {
      console.warn(`Failed to save to cookies: ${key}`, e);
    }
  };

  const loadFromCookies = (key: string) => {
    try {
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
      if (cookie) {
        const value = cookie.split('=')[1];
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded);
        console.log(`Loaded from cookies: ${key}`, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`Failed to load from cookies: ${key}`, e);
    }
    return null;
  };

  const clearCookie = (key: string) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  // Format duration for display
  const formatMinutes = (m: number) => {
    const v = Number.isFinite(m) ? m : 0;
    const unitMin = currentLanguage === 'ru' ? 'мин' : 'min';
    const unitSec = currentLanguage === 'ru' ? 'сек' : 'sec';

    // If duration is less than 1 minute, convert to seconds
    if (v < 1) {
      const seconds = Math.round(v * 60);
      return `${seconds} ${unitSec}`;
    }

    // For 1 minute or more, display in minutes
    const rounded = Math.round(v * 10) / 10; // Round to one decimal place
    // If it's almost a whole number, display as a whole number
    return Math.abs(rounded - Math.round(rounded)) < 0.05
      ? `${Math.round(rounded)} ${unitMin}`
      : `${rounded} ${unitMin}`;
  };

  // Reset all user data except account
  const resetUserData = async () => {
    if (!confirm(currentLanguage === 'ru' ? 
      'Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.' :
      currentLanguage === 'en' ? 
      'Are you sure you want to delete all data? This action cannot be undone.' :
      'Czy na pewno chcesz usunąć wszystkie dane? Ta akcja nie może zostać cofnięta.')) {
      return;
    }

    try {
      console.log('Resetting all user data...');
      
      // Clear all cookies
      clearCookie('dayPlanSlots');
      clearCookie('practices');
      clearCookie('historyData');
      clearCookie('timerState');
      
      // Clear localStorage
      localStorage.removeItem('timerState');
      
      // Reset all state
      setSlots([]);
      setPractices([]);
      setHistoryData([]);
      setCurrentSlot(null);
      setTimeRemaining(0);
      setTimerState('idle');
      setAssessments([]);
      setShowAssessment(false);
      
      // Delete all practices from backend
      const allPractices = await apiGetPracticeTemplates();
      if (allPractices.length > 0) {
        console.log(`Deleting ${allPractices.length} practices from backend...`);
        await Promise.all(
          allPractices.map(practice =>
            apiDeletePracticeTemplate(practice.id).catch(err =>
              console.warn(`Failed to delete practice ${practice.id}:`, err)
            )
          )
        );
      }
      
      // Delete all slots from backend
      const allSlots = await apiListSlots();
      if (allSlots.length > 0) {
        console.log(`Deleting ${allSlots.length} slots from backend...`);
        await Promise.all(
          allSlots.map(slot =>
            apiDeleteSlot(slot.id).catch(err =>
              console.warn(`Failed to delete slot ${slot.id}:`, err)
            )
          )
        );
      }
      
      console.log('✓ All user data reset successfully');
      alert(currentLanguage === 'ru' ? 
        'Все данные успешно удалены!' :
        currentLanguage === 'en' ? 
        'All data has been successfully deleted!' :
        'Wszystkie dane zostały pomyślnie usunięte!');
        
    } catch (error) {
      console.error('Failed to reset user data:', error);
      alert(currentLanguage === 'ru' ? 
        'Ошибка при удалении данных. Попробуйте еще раз.' :
        currentLanguage === 'en' ? 
        'Error deleting data. Please try again.' :
        'Błąd podczas usuwania danych. Spróbuj ponownie.');
    }
  };

  // Refresh history data from current slots
  const refreshHistoryFromSlots = () => {
    if (slots.length === 0) return;
    
    const today = new Date().toISOString().slice(0, 10);
    setHistoryData(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === today);
      const completedCount = slots.filter(s => s.completed).length;
      
      if (existingDayIndex >= 0) {
        // Update existing day with current slots
        const updatedDay = {
          ...prev[existingDayIndex],
          slots: slots,
          completed: completedCount
        };
        const newHistory = [...prev];
        newHistory[existingDayIndex] = updatedDay;
        console.log('Refreshed history for existing day:', updatedDay);
        return newHistory;
      } else {
        // Add new day with current slots
        const newDay = {
          date: today,
          slots: slots,
          completed: completedCount
        };
        console.log('Created new history day from slots:', newDay);
        return [newDay, ...prev].slice(0, 30);
      }
    });
  };
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

  // Timer state persistence
  const saveTimerState = () => {
    if (currentSlot && timerState !== 'idle') {
      const timerData = {
        slotId: currentSlot.id,
        timeRemaining,
        timerState,
        timestamp: Date.now()
      };
      localStorage.setItem('timerState', JSON.stringify(timerData));
    }
  };

  const loadTimerState = () => {
    try {
      const saved = localStorage.getItem('timerState');
      if (saved) {
        const timerData = JSON.parse(saved);
        // Only restore if it's from today and less than 24 hours old
        if (Date.now() - timerData.timestamp < 24 * 60 * 60 * 1000) {
          // Find the slot
          const slot = slots.find(s => s.id === timerData.slotId);
          if (slot) {
            setCurrentSlot(slot);
            setTimeRemaining(timerData.timeRemaining);
            setTimerState(timerState === 'completed' ? 'idle' : timerData.timerState);
            console.log('Restored timer state:', timerData);
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load timer state:', e);
    }
    return false;
  };

  // Save timer state when it changes
  useEffect(() => {
    saveTimerState();
  }, [currentSlot, timeRemaining, timerState]);

  // Save slots to cookies whenever they change
  useEffect(() => {
    if (slots.length > 0) {
      saveToCookies('dayPlanSlots', slots);
    }
  }, [slots]);

  // Save practices to cookies whenever they change
  useEffect(() => {
    if (practices.length > 0) {
      saveToCookies('practices', practices);
    }
  }, [practices]);

  // Save history data to cookies whenever it changes
  useEffect(() => {
    if (historyData.length > 0) {
      saveToCookies('historyData', historyData);
    }
  }, [historyData]);

  // Refresh history whenever slots change
  useEffect(() => {
    if (slots.length > 0) {
      refreshHistoryFromSlots();
    }
  }, [slots]);

  // Load timer state on startup
  useEffect(() => {
    if (slots.length > 0) {
      loadTimerState();
    }
  }, [slots]);

  // Load data on app startup
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('User logged in, loading data...');
      
      // Try to load practices from cookies first
      const savedPractices = loadFromCookies('practices');
      if (savedPractices && savedPractices.length > 0) {
        console.log('Loading practices from cookies:', savedPractices.length);
        setPractices(savedPractices);
      } else {
        console.log('No saved practices in cookies, loading from backend...');
        loadPractices();
      }
      
      // Try to load slots from cookies first
      const savedSlots = loadFromCookies('dayPlanSlots');
      if (savedSlots && savedSlots.length > 0) {
        console.log('Loading slots from cookies:', savedSlots.length);
        setSlots(savedSlots);
      } else {
        console.log('No saved slots in cookies, loading from backend...');
        loadTodayData();
      }
      
      // Try to load history from cookies first
      const savedHistory = loadFromCookies('historyData');
      if (savedHistory && savedHistory.length > 0) {
        console.log('Loading history from cookies:', savedHistory.length);
        setHistoryData(savedHistory);
      } else {
        console.log('No saved history in cookies, loading from backend...');
        loadHistoryData();
      }
    }
  }, [isAuthenticated, currentUser]);

  // Auto-refresh data when page is reloaded or screen changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      console.log('Auto-refreshing data for screen:', currentScreen);
      
      // Try to load from cookies first
      const savedSlots = loadFromCookies('dayPlanSlots');
      if (savedSlots && savedSlots.length > 0) {
        console.log('Auto-refresh: Loading slots from cookies:', savedSlots.length);
        setSlots(savedSlots);
      } else {
        console.log('Auto-refresh: No saved slots, loading from backend...');
        loadTodayData();
      }
      
      // Try to load history from cookies first
      const savedHistory = loadFromCookies('historyData');
      if (savedHistory && savedHistory.length > 0) {
        console.log('Auto-refresh: Loading history from cookies:', savedHistory.length);
        setHistoryData(savedHistory);
      } else {
        console.log('Auto-refresh: No saved history, loading from backend...');
        loadHistoryData();
      }
    }
  }, [isAuthenticated, currentUser, currentScreen]);

  // Refresh data when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && currentUser) {
        console.log('User returned to tab - refreshing data...');
        
        // Try to load from cookies first
        const savedSlots = loadFromCookies('dayPlanSlots');
        if (savedSlots && savedSlots.length > 0) {
          console.log('Tab return: Loading slots from cookies:', savedSlots.length);
          setSlots(savedSlots);
        } else {
          console.log('Tab return: No saved slots, loading from backend...');
          loadTodayData();
        }
        
        // Try to load history from cookies first
        const savedHistory = loadFromCookies('historyData');
        if (savedHistory && savedHistory.length > 0) {
          console.log('Tab return: Loading history from cookies:', savedHistory.length);
          setHistoryData(savedHistory);
        } else {
          console.log('Tab return: No saved history, loading from backend...');
          loadHistoryData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, currentUser]);

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

  
// Load practices from API (templates + user selections)
async function loadPractices() {
  try {
    const templates = await apiGetPracticeTemplates();
    const mapUP: Record<string,string> = {};
    setUserPracticeByTemplate(mapUP);
    const toPractice = (tpl: any): Practice => ({
      id: tpl.id,
      name: tpl.title,
      duration: (tpl.default_duration_sec ?? 120) / 60,
      description: tpl.description ?? '',
      selected: Boolean(tpl.is_selected) // Load selection state from backend
    });
    setPractices(templates.map(toPractice));
  } catch (e) {
    console.warn('Failed to load practices from API', e);
  }
}

// Load existing day plan and slots for today
async function loadTodayData() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    console.log('Loading today\'s data for:', today);
    
    // Try to get existing day plan for today
    const dayPlan = await apiGetDayPlanByDate(today);
    console.log('Day plan query result:', dayPlan);
    
    if (dayPlan) {
      console.log('Found existing day plan:', dayPlan);
      
      // Load slots for this day plan
      const slotsData = await apiListSlots({ day_plan: dayPlan.id });
      console.log('Found existing slots:', slotsData.length);
      
      if (slotsData.length > 0) {
        // Convert backend slots to frontend format
        const toClientTimeOfDay = (v?: string): 'morning' | 'day' | 'evening' => {
          if (v === 'MORNING') return 'morning';
          if (v === 'AFTERNOON') return 'day';
          if (v === 'EVENING') return 'evening';
          return 'day';
        };

        const mapped: Slot[] = slotsData.map((d: any) => {
          const rawPractice = d.practice_template ?? d.user_practice ?? d.template ?? d.practice ?? null;
          const practiceId = rawPractice == null ? null : typeof rawPractice === 'string' ? rawPractice : (rawPractice.id ? String(rawPractice.id) : null);
          const timeOfDay = d.time_of_day ? toClientTimeOfDay(String(d.time_of_day)) : 'day';
          const durationMin = (typeof d.duration_sec_snapshot === 'number' ? d.duration_sec_snapshot : 120) / 60;
          const iso = d.scheduled_at_utc || null;
          const date = iso ? String(iso).slice(0, 10) : today;
          const instruction = d.display_payload?.neutral_instruction || t('copy.timer.instruction', currentLanguage);

          return {
            id: String(d.id),
            serverId: String(d.id),
            practiceId,
            timeOfDay,
            duration: durationMin,
            completed: d.status === 'DONE',
            date,
            instruction,
          };
        });

        // Sort by newest first and limit to 6
        const sortedSlots = mapped.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.id.localeCompare(a.id);
        });
        const limitedSlots = sortedSlots.slice(0, 6);

        setSlots(limitedSlots);
        console.log('Loaded slots:', limitedSlots.length);
      }
    } else {
      console.log('No existing day plan found for today');
    }
  } catch (e) {
    console.warn('Failed to load today\'s data:', e);
  }
}

// Load historical data for dashboard
async function loadHistoryData() {
  try {
    console.log('Loading historical data...');
    
    // Get all slots (not filtered by day plan)
    const allSlotsData = await apiListSlots();
    console.log('Found all slots:', allSlotsData.length);
    
    if (allSlotsData.length > 0) {
      // Convert backend slots to frontend format
      const toClientTimeOfDay = (v?: string): 'morning' | 'day' | 'evening' => {
        if (v === 'MORNING') return 'morning';
        if (v === 'AFTERNOON') return 'day';
        if (v === 'EVENING') return 'evening';
        return 'day';
      };

      const mapped: Slot[] = allSlotsData.map((d: any) => {
        const rawPractice = d.practice_template ?? d.user_practice ?? d.template ?? d.practice ?? null;
        const practiceId = rawPractice == null ? null : typeof rawPractice === 'string' ? rawPractice : (rawPractice.id ? String(rawPractice.id) : null);
        const timeOfDay = d.time_of_day ? toClientTimeOfDay(String(d.time_of_day)) : 'day';
        const durationMin = (typeof d.duration_sec_snapshot === 'number' ? d.duration_sec_snapshot : 120) / 60;
        const iso = d.scheduled_at_utc || null;
        const date = iso ? String(iso).slice(0, 10) : new Date().toISOString().slice(0, 10);
        const instruction = d.display_payload?.neutral_instruction || t('copy.timer.instruction', currentLanguage);

        return {
          id: String(d.id),
          serverId: String(d.id),
          practiceId,
          timeOfDay,
          duration: durationMin,
          completed: d.status === 'DONE',
          date,
          instruction,
        };
      });

      // Group by date
      const groupedByDate = mapped.reduce((acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
      }, {} as Record<string, Slot[]>);

      // Convert to history format
      const history = Object.entries(groupedByDate)
        .map(([date, slots]) => ({
          date,
          slots,
          completed: slots.filter(s => s.completed).length
        }))
        .sort((a, b) => b.date.localeCompare(a.date)) // Newest first
        .slice(0, 30); // Last 30 days

      setHistoryData(history);
      console.log('Loaded history:', history.length, 'days');
    }
  } catch (e) {
    console.warn('Failed to load historical data:', e);
  }
}

// Generate daily plan
  const generateDayPlan = async () => {
  console.log('=== Generate Day Plan ===');
  console.log('Local practices:', practices.map(p => ({ id: p.id, name: p.name, selected: p.selected })));
  console.log('Selected practices (local):', practices.filter(p => p.selected).length);
  
  // (опционально) если локально ничего не выбрано — подскажем выбрать,
  // но сервер всё равно возьмёт выбранные практики из БД текущего пользователя
  if (!practices.some(p => p.selected)) {
    console.log('❌ No practices selected locally, showing alert');
    alert(currentLanguage === 'ru' 
      ? 'Пожалуйста, выберите хотя бы одну практику (установите галочку)'
      : currentLanguage === 'en'
      ? 'Please select at least one practice (check the box)'
      : 'Wybierz co najmniej jedną praktykę (zaznacz pole)');
    return;
  }

  console.log('✅ Local check passed, proceeding with plan creation...');

  const today = new Date().toISOString().slice(0, 10);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  try {
    console.log('Step 1: Creating day plan...');
    const dp = await apiCreateDayPlan(today, tz);
    console.log('✓ Day plan created:', dp);
    console.log('Day plan ID:', dp.id);
    console.log('Day plan date:', dp.local_date);
    
    // Wait a moment for backend to sync selected practices
    console.log('Waiting for backend to sync...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify practices are selected in backend
    console.log('Verifying selected practices in backend...');
    const backendPractices = await apiGetPracticeTemplates();
    const selectedInBackend = backendPractices.filter(p => p.is_selected);
    console.log(`Backend has ${selectedInBackend.length} selected practices:`, selectedInBackend.map(p => p.title));
    
    if (selectedInBackend.length === 0) {
      throw new Error('No practices are selected in the backend. Please select some practices first.');
    }
    
    // Check if slots already exist for this day plan
    console.log('Checking existing slots for this day plan...');
    const existingSlots = await apiListSlots({ day_plan: dp.id });
    console.log(`Found ${existingSlots.length} existing slots:`, existingSlots.map(s => ({ id: s.id, practice: s.practice_template })));
    
    // Clear existing slots if any
    if (existingSlots.length > 0) {
      console.log(`Clearing ${existingSlots.length} existing slots...`);
      await Promise.all(
        existingSlots.map(slot =>
          apiDeleteSlot(slot.id).catch(err =>
            console.warn(`Failed to delete slot ${slot.id}:`, err)
          )
        )
      );
      console.log('✓ Existing slots cleared');
    }
    
    console.log('Step 2: Generating slots for plan...');
    const slotsResult = await apiGenerateSlotsForPlan(dp.id);
    console.log('✓ Slots generation result:', slotsResult);

    console.log('Step 3: Fetching slots...');
    const dtos = await apiListSlots({ day_plan: dp.id });
    console.log('✓ Fetched slots:', dtos);

    const toClientTimeOfDay = (v?: string): 'morning' | 'day' | 'evening' => {
      if (v === 'MORNING') return 'morning';
      if (v === 'AFTERNOON') return 'day';
      if (v === 'EVENING') return 'evening';
      return 'day';
    };

    const mapped: Slot[] = (dtos || []).map((d: any) => {
      const rawPractice =
        d.practice_template ?? d.user_practice ?? d.template ?? d.practice ?? null;

      const practiceId =
        rawPractice == null
          ? null
          : typeof rawPractice === 'string'
          ? rawPractice
          : (rawPractice.id ? String(rawPractice.id) : null);

      const timeOfDay =
        d.time_of_day ? toClientTimeOfDay(String(d.time_of_day)) : 'day';

      const durationMin =
        (typeof d.duration_sec_snapshot === 'number'
          ? d.duration_sec_snapshot
          : 120) / 60;

      const iso = d.scheduled_at_utc || null;
      const date = iso ? String(iso).slice(0, 10) : today;

      const instruction =
        d.display_payload?.neutral_instruction ||
        t('copy.timer.instruction', currentLanguage);

      return {
        id: String(d.id),
        serverId: String(d.id),
        practiceId,
        timeOfDay,
        duration: durationMin,
        completed: d.status === 'DONE',
        date,
        instruction,
      };
    });

    // Keep only the 6 newest slots
    const sortedSlots = mapped.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
    const limitedSlots = sortedSlots.slice(0, 6);
    const slotsToDelete = sortedSlots.slice(6); // Slots beyond the first 6

    // Delete old slots from backend
    if (slotsToDelete.length > 0) {
      console.log(`Deleting ${slotsToDelete.length} old slots...`);
      await Promise.all(
        slotsToDelete.map(slot => 
          apiDeleteSlot(slot.id).catch(err => 
            console.warn(`Failed to delete slot ${slot.id}:`, err)
          )
        )
      );
    }

    console.log(`✓ Final result: ${limitedSlots.length} slots kept, navigating to plan screen`);
    setSlots(limitedSlots);
    
    // Add today's plan to history
    setHistoryData(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === today);
      if (existingDayIndex >= 0) {
        // Update existing day with new slots
        const updatedDay = {
          ...prev[existingDayIndex],
          slots: limitedSlots,
          completed: limitedSlots.filter(s => s.completed).length
        };
        const newHistory = [...prev];
        newHistory[existingDayIndex] = updatedDay;
        return newHistory;
      } else {
        // Add new day
        const newDay = {
          date: today,
          slots: limitedSlots,
          completed: limitedSlots.filter(s => s.completed).length
        };
        return [newDay, ...prev].slice(0, 30); // Keep last 30 days
      }
    });
    
    setCurrentScreen('plan');
  } catch (e: any) {
    console.error('generateDayPlan failed', e);
    console.error('Error details:', JSON.stringify(e, null, 2));
    
    // Show user-friendly error message with more details
    const baseMsg = 
      currentLanguage === 'ru' 
        ? 'Не удалось создать план.'
        : currentLanguage === 'en'
        ? 'Failed to create plan.'
        : 'Nie udało się utworzyć planu.';
    
    const detailMsg = 
      currentLanguage === 'ru'
        ? '\n\nВажно: После выбора практик (галочки) подождите 1-2 секунды, чтобы изменения сохранились на сервере, затем нажмите "Create Plan".'
        : currentLanguage === 'en'
        ? '\n\nImportant: After selecting practices (checkboxes), wait 1-2 seconds for changes to save to the server, then click "Create Plan".'
        : '\n\nWażne: Po wybraniu praktyk (pola wyboru) poczekaj 1-2 sekundy na zapisanie zmian na serwerze, a następnie kliknij "Create Plan".';
    
    alert(baseMsg + detailMsg);
    setCurrentScreen('practices');
  }
};



  // Check if slot is available at current time
  const isSlotAvailable = (slot: Slot) => {
    const currentHour = new Date().getHours();
    const slotTimeOfDay = slot.timeOfDay;
    
    switch (slotTimeOfDay) {
      case 'morning':
        return currentHour >= 5 && currentHour < 12;
      case 'day':
        return currentHour >= 12 && currentHour < 18;
      case 'evening':
        return currentHour >= 18 || currentHour < 5;
      default:
        return true;
    }
  };

  // Start slot timer
  const startSlot = (slot: Slot) => {
    // Check if current time matches the slot's time of day
    const currentHour = new Date().getHours();
    const slotTimeOfDay = slot.timeOfDay;
    
    let isCorrectTime = false;
    let timeMessage = '';
    
    switch (slotTimeOfDay) {
      case 'morning':
        isCorrectTime = currentHour >= 5 && currentHour < 12;
        timeMessage = currentLanguage === 'ru' ? 
          'Утренние практики можно делать с 5:00 до 12:00' :
          currentLanguage === 'en' ? 
          'Morning practices can be done from 5:00 AM to 12:00 PM' :
          'Praktyki poranne można wykonywać od 5:00 do 12:00';
        break;
      case 'day':
        isCorrectTime = currentHour >= 12 && currentHour < 18;
        timeMessage = currentLanguage === 'ru' ? 
          'Дневные практики можно делать с 12:00 до 18:00' :
          currentLanguage === 'en' ? 
          'Day practices can be done from 12:00 PM to 6:00 PM' :
          'Praktyki dzienne można wykonywać od 12:00 do 18:00';
        break;
      case 'evening':
        isCorrectTime = currentHour >= 18 || currentHour < 5;
        timeMessage = currentLanguage === 'ru' ? 
          'Вечерние практики можно делать с 18:00 до 5:00' :
          currentLanguage === 'en' ? 
          'Evening practices can be done from 6:00 PM to 5:00 AM' :
          'Praktyki wieczorne można wykonywać od 18:00 do 5:00';
        break;
    }
    
    if (!isCorrectTime) {
      alert(timeMessage);
      return;
    }
    
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
    // Clear timer state from localStorage
    localStorage.removeItem('timerState');
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
    
    // Update history data when a slot is completed
    const today = new Date().toISOString().slice(0, 10);
    setHistoryData(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === today);
      if (existingDayIndex >= 0) {
        // Update existing day - find the slot and mark it as completed
        const updatedSlots = prev[existingDayIndex].slots.map(s => 
          s.id === currentSlot.id ? { ...s, completed: true } : s
        );
        const completedCount = updatedSlots.filter(s => s.completed).length;
        
        const updatedDay = {
          ...prev[existingDayIndex],
          slots: updatedSlots,
          completed: completedCount
        };
        const newHistory = [...prev];
        newHistory[existingDayIndex] = updatedDay;
        console.log('Updated history for existing day:', updatedDay);
        return newHistory;
      } else {
        // Add new day - get all current slots and mark the completed one
        const allSlots = slots.map(s => 
          s.id === currentSlot.id ? { ...s, completed: true } : s
        );
        const completedCount = allSlots.filter(s => s.completed).length;
        
        const newDay = {
          date: today,
          slots: allSlots,
          completed: completedCount
        };
        console.log('Created new history day:', newDay);
        return [newDay, ...prev].slice(0, 30); // Keep last 30 days
      }
    });
    
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

  const handleLogin = async () => {
  setAuthLoading(true);
  setAuthError('');
  try {
    // бек ожидает { username, password } — мы используем email как username
    await apiLogin({ email: loginForm.email, password: loginForm.password });

    // минимальная карточка пользователя в стейт
    setCurrentUser({
      id: 'me',
      email: loginForm.email,
      firstName: loginForm.email.split('@')[0],
      lastName: ''
    });
    setIsAuthenticated(true);

    // если у тебя есть функция подгрузки практик — подтяни
    if (typeof loadPractices === 'function') {
      await loadPractices();
    }

    setCurrentScreen('practices');
  } catch (e: any) {
    setAuthError(currentLanguage === 'ru' ? 'Неверный email или пароль' : 
                 currentLanguage === 'en' ? 'Invalid email or password' : 
                 'Nieprawidłowy email lub hasło');
  } finally {
    setAuthLoading(false);
  }
};

const handleRegister = async () => {
  setAuthLoading(true);
  setAuthError('');
  try {
    if (registerForm.password !== registerForm.confirmPassword) throw new Error('pass_mismatch');
    if (registerForm.password.length < 8) throw new Error('pass_short');
    if (!registerForm.agreeToTerms) throw new Error('no_terms');

    // регистрация
    await apiRegister({ 
      email: registerForm.email, 
      password: registerForm.password,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName
    });
    // авто-логин
    await apiLogin({ email: registerForm.email, password: registerForm.password });

    setCurrentUser({
      id: 'me',
      email: registerForm.email,
      firstName: registerForm.firstName || registerForm.email.split('@')[0],
      lastName: registerForm.lastName || ''
    });
    setIsAuthenticated(true);

    if (typeof loadPractices === 'function') {
      await loadPractices();
    }

    setCurrentScreen('practices');
  } catch (e: any) {
    console.error('Registration error:', e);
    setAuthError(
      e.message === 'pass_mismatch' 
        ? (currentLanguage === 'ru' ? 'Пароли не совпадают' : 
           currentLanguage === 'en' ? 'Passwords do not match' : 
           'Hasła nie pasują do siebie')
        : e.message === 'pass_short'
        ? (currentLanguage === 'ru' ? 'Пароль должен содержать минимум 8 символов' : 
           currentLanguage === 'en' ? 'Password must be at least 8 characters' : 
           'Hasło musi mieć co najmniej 8 znaków')
        : e.message === 'no_terms'
        ? (currentLanguage === 'ru' ? 'Необходимо согласиться с условиями' : 
           currentLanguage === 'en' ? 'You must agree to the terms' : 
           'Musisz zgodzić się z warunkami')
        : (currentLanguage === 'ru' ? `Ошибка регистрации: ${e.message || 'Неизвестная ошибка'}` : 
           currentLanguage === 'en' ? `Registration failed: ${e.message || 'Unknown error'}` : 
           `Rejestracja nie powiodła się: ${e.message || 'Nieznany błąd'}`)
    );
  } finally {
    setAuthLoading(false);
  }
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
const PracticeSelection = () => {
  const [genPrompt, setGenPrompt] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const genBtnText =
    currentLanguage === 'ru' ? 'Сгенерировать' :
    currentLanguage === 'pl' ? 'Wygeneruj' : 'Generate';

  const genPlaceholder =
    currentLanguage === 'ru'
      ? 'Опишите: дыхательные 1–3 мин, без оборудования…'
      : currentLanguage === 'pl'
      ? 'Opisz: oddech 1–3 min, bez sprzętu…'
      : 'Describe: breathing 1–3 min, no equipment…';

  async function handleGeneratePractices() {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    setGenError(null);
    try {
      // Store old practices - separate selected from unselected
      const oldPractices = [...practices];
      const selectedPractices = oldPractices.filter(p => p.selected);
      const unselectedPractices = oldPractices.filter(p => !p.selected);
      
      // Delete ONLY unselected old practices
      if (unselectedPractices.length > 0) {
        console.log(`Deleting ${unselectedPractices.length} unselected practices to make room for new ones...`);
        await Promise.all(
          unselectedPractices.map(practice => 
            apiDeletePracticeTemplate(practice.id).catch(err => 
              console.warn(`Failed to delete practice ${practice.id}:`, err)
            )
          )
        );
      }
      
      console.log(`Keeping ${selectedPractices.length} selected practices`);
      
      // Generate new practices (AI should create 6)
      const resp = await apiGeneratePractices(genPrompt.trim()); // <- POST /practices/generate/
      
      // нормализация к локальному типу Practice
      const normalized = (resp || []).map((tpl: any) => ({
        id: String(tpl.id),
        name: tpl.title || '—',
        description: tpl.description || '',
        duration: Math.max(0.5, (Number(tpl.default_duration_sec ?? 120) / 60)),
        selected: !!tpl.is_selected,
      }));

      console.log(`Generated ${normalized.length} new practices`);
      
      // Combine selected practices with new ones
      const allPractices = [...selectedPractices, ...normalized];
      const sortedAll = allPractices.sort((a: Practice, b: Practice) => b.id.localeCompare(a.id));
      
      // Keep only 6 total (prioritize selected ones)
      const keepPractices = sortedAll.slice(0, 6);
      const deleteExtra = sortedAll.slice(6);
      
      // Delete extra practices
      if (deleteExtra.length > 0) {
        console.log(`Deleting ${deleteExtra.length} extra practices...`);
        await Promise.all(
          deleteExtra.map((practice: Practice) => 
            apiDeletePracticeTemplate(practice.id).catch((err: any) => 
              console.warn(`Failed to delete extra practice ${practice.id}:`, err)
            )
          )
        );
      }

      // Update local state with all selected FIRST
      const finalPractices = keepPractices.map((p: Practice) => ({ ...p, selected: true }));
      setPractices(finalPractices);
      
      // Auto-select all NEW generated practices in the backend
      const newPracticesInKeep = keepPractices.filter(p => 
        normalized.some((n: Practice) => n.id === p.id)
      );
      
      if (newPracticesInKeep.length > 0) {
        console.log(`Auto-selecting ${newPracticesInKeep.length} new practices...`);
        await Promise.all(
          newPracticesInKeep.map((practice: Practice) => 
            apiUpdatePracticeTemplate(practice.id, { is_selected: true })
              .then(() => {
                console.log(`✓ Auto-selected practice: ${practice.name}`);
              })
              .catch((err: any) => 
                console.warn(`Failed to auto-select practice ${practice.id}:`, err)
              )
          )
        );
      }
      
      setGenPrompt('');
    } catch (e: any) {
      setGenError(
        currentLanguage === 'ru'
          ? 'Не удалось сгенерировать практики'
          : currentLanguage === 'pl'
          ? 'Nie udało się wygenerować практyk'
          : 'Failed to generate practices'
      );
      console.warn('generate_practices_failed', e);
    } finally {
      setGenLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="mb-4">{t('copy.practices.title', currentLanguage)}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('copy.practices.subtitle', currentLanguage)}
        </p>
      </div>

      {/* Панель генерации практик */}
      <div className="mb-6 flex items-start gap-2">
        <Input
          value={genPrompt}
          onChange={(e) => setGenPrompt(e.target.value)}
          placeholder={genPlaceholder}
          disabled={genLoading}
          className="flex-1"
        />
        <Button
          onClick={handleGeneratePractices}
          disabled={genLoading || !genPrompt.trim()}
        >
          {genLoading ? (currentLanguage === 'ru' ? 'Генерация…' : currentLanguage === 'pl' ? 'Generowanie…' : 'Generating…') : genBtnText}
        </Button>
      </div>
      {genError && (
        <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {genError}
        </div>
      )}

      <div className="mb-8">
        {practices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {currentLanguage === 'ru' ? 'Нет практик. Создайте их с помощью генератора выше.' :
                 currentLanguage === 'en' ? 'No practices. Create them using the generator above.' :
                 'Brak praktyk. Utwórz je za pomocą generatora powyżej.'}
              </p>
            </CardContent>
          </Card>
        ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-2 overscroll-contain thin-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice) => (
              <Card key={practice.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{practice.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">
                        {practice.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {formatMinutes(practice.duration)}
                      </Badge>
                    </div>

                    <Checkbox
                      checked={practice.selected}
                      onCheckedChange={async (checked: any) => {
                        console.log('Checkbox clicked:', checked, 'for practice:', practice.id);
                        const isSelected = !!checked;
                        // оптимистично обновим UI
                        setPractices(prev =>
                          prev.map(p => p.id === practice.id ? { ...p, selected: isSelected } : p)
                        );
                        try {
                          console.log(`Sending API request to update practice ${practice.id} to is_selected=${isSelected}`);
                          await apiUpdatePracticeTemplate(practice.id, { is_selected: isSelected });
                          console.log(`✓ Practice ${practice.id} updated: is_selected=${isSelected}`);
                        } catch (error) {
                          console.error('✗ Failed to update practice selection:', error);
                          // откат при ошибке
                          setPractices(prev =>
                            prev.map(p => p.id === practice.id ? { ...p, selected: !isSelected } : p)
                          );
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
        )}
      </div>

      <div className="text-center space-y-4">
        <div className="flex gap-4 justify-center">
        <Button
          onClick={generateDayPlan}
          disabled={!practices.some(p => p.selected)}
          size="lg"
          className="px-8"
        >
          {t('copy.actions.createPlan', currentLanguage)}
        </Button>
          <Button
            onClick={async () => {
              console.log('Reloading practices from backend...');
              await loadPractices();
              console.log('Practices reloaded:', practices.map(p => ({ id: p.id, name: p.name, selected: p.selected })));
            }}
            variant="outline"
            size="lg"
          >
            🔄 Reload
        </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentLanguage === 'ru' 
            ? 'После выбора практик нажмите "Reload", затем "Create Plan"'
            : currentLanguage === 'en'
            ? 'After selecting practices, click "Reload", then "Create Plan"'
            : 'Po wybraniu praktyk kliknij "Reload", a następnie "Create Plan"'}
        </p>
      </div>
    </div>
  );
};

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

    // Show only 6 newest slots
    const visibleSlots = [...slots]
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        // If dates are equal, sort by id descending (newest first)
        return b.id.localeCompare(a.id);
      })
      .slice(0, 6);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
          <h2 className="mb-2">{t('copy.plan.title', currentLanguage)}</h2>
          <p className="text-muted-foreground">
                {slots.length > 6
                  ? `${currentLanguage === 'ru' ? 'Показано 6 из' : currentLanguage === 'en' ? 'Showing 6 of' : 'Wyświetlanie 6 z'} ${slots.length}`
                  : t('copy.plan.subtitle', currentLanguage, { n: slots.length.toString() })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentScreen('practices')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentLanguage === 'ru' ? 'Выбрать практики' : 
                 currentLanguage === 'en' ? 'Choose Practices' : 'Wybierz Praktyki'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentScreen('dashboard')}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                {currentLanguage === 'ru' ? 'История' : 
                 currentLanguage === 'en' ? 'History' : 'Historia'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Manual refresh triggered');
                  
                  // Try to load from cookies first
                  const savedSlots = loadFromCookies('dayPlanSlots');
                  if (savedSlots && savedSlots.length > 0) {
                    console.log('Manual refresh: Loading slots from cookies:', savedSlots.length);
                    setSlots(savedSlots);
                  } else {
                    console.log('Manual refresh: No saved slots, loading from backend...');
                    loadTodayData();
                  }
                }}
                className="flex items-center gap-2"
              >
                🔄
                {currentLanguage === 'ru' ? 'Обновить' : 
                 currentLanguage === 'en' ? 'Refresh' : 'Odśwież'}
              </Button>
            </div>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {visibleSlots.map((slot, index) => (
              <Card key={slot.id} className={`h-80 flex flex-col ${
                !isSlotAvailable(slot) && !slot.completed 
                  ? 'opacity-60 border-orange-200 bg-orange-50' 
                  : slot.completed 
                  ? 'opacity-50 border-green-200 bg-green-50' 
                  : ''
              }`}>
                <CardHeader className="pb-4 px-6 pt-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {practices.find(p => p.id === slot.practiceId)?.name}
                    </CardTitle>
                    {slot.completed && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getTimeIcon(slot.timeOfDay)}
                    <span className="capitalize">{getTimeOfDayText(slot.timeOfDay)}</span>
                    <span>•</span>
                      <span>{formatMinutes(slot.duration)}</span>
                    </div>
                    {!isSlotAvailable(slot) && !slot.completed && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600">
                          {currentLanguage === 'ru' ? 'Доступно' : 
                           currentLanguage === 'en' ? 'Available' : 'Dostępne'} 
                          {slot.timeOfDay === 'morning' ? 
                            (currentLanguage === 'ru' ? ' с 5:00' : 
                             currentLanguage === 'en' ? ' from 5:00 AM' : ' od 5:00') :
                           slot.timeOfDay === 'day' ? 
                            (currentLanguage === 'ru' ? ' с 12:00' : 
                             currentLanguage === 'en' ? ' from 12:00 PM' : ' od 12:00') :
                            (currentLanguage === 'ru' ? ' с 18:00' : 
                             currentLanguage === 'en' ? ' from 6:00 PM' : ' od 18:00')}
                    </span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {t('copy.slot.meta.today', currentLanguage)}
                    </Badge>
                  </div>
                  </div>
                </CardHeader>
                
                <div className="flex-1 flex flex-col justify-between px-6">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {slot.instruction}
                  </p>
                  
                  <div className="mt-auto pb-4">
                  <Button 
                    onClick={() => startSlot(slot)}
                      disabled={slot.completed || !isSlotAvailable(slot)}
                      className={`w-full h-10 text-sm font-medium ${
                        !isSlotAvailable(slot) && !slot.completed 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                      size="sm"
                    >
                    {slot.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('copy.slot.cta.completed', currentLanguage)}
                      </>
                    ) : !isSlotAvailable(slot) ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        {currentLanguage === 'ru' ? 'Не время' : 
                         currentLanguage === 'en' ? 'Not time' : 'Nie czas'}
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {t('copy.slot.cta.start', currentLanguage)}
                      </>
                    )}
                  </Button>
                  </div>
                </div>
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
          </div>
          
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-mono mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatMinutes(currentSlot.duration)}
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
    <CardTitle>{t('copy.profile.overview', currentLanguage)}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center">
        <div className="text-3xl mb-2">{completedSlots}</div>
        <p className="text-sm text-muted-foreground">
          {t('copy.profile.completedSlots', currentLanguage)}
        </p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">{completionRate}%</div>
<p className="text-sm text-muted-foreground">
          {t('copy.profile.completionRate', currentLanguage)}
        </p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">{assessments.length}</div>
        <p className="text-sm text-muted-foreground">
          {t('copy.profile.ratingsMade', currentLanguage)}
        </p>
      </div>
    </div>

    {totalSlots > 0 && (
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>{t('copy.profile.progressLabel', currentLanguage)}</span>
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
    <CardTitle>{t('copy.profile.practiceStats', currentLanguage)}</CardTitle>
    <p className="text-sm text-muted-foreground">
      {t('copy.profile.practiceStatsSub', currentLanguage)}
    </p>
  </CardHeader>
  <CardContent className="p-0">
    <div className="max-h-[50vh] overflow-y-auto px-6 py-4 space-y-4 overscroll-contain thin-scrollbar">
      {practiceStats.map(practice => (
        <div key={practice.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="font-medium">{practice.name}</div>
              {!practice.selected && (
                <Badge variant="secondary" className="text-xs">
                  {t('copy.profile.inactive', currentLanguage)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {practice.description}
            </p>
<div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">
                {t('copy.profile.completedOf', currentLanguage)}: {practice.completedSlots}/{practice.totalSlots}
              </span>
              {practice.avgMood > 0 && (
                <span className="text-muted-foreground">
                  {t('copy.profile.avgMood', currentLanguage)}: {practice.avgMood}/10
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              {formatDuration(currentLanguage, practice.duration)}
            </Badge>
             {practice.totalSlots > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.round((practice.completedSlots / practice.totalSlots) * 100)}% {t('copy.profile.completedPercent', currentLanguage)}
              </div>
            )}
          </div>
        </div>
      ))}

      {practiceStats.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('copy.profile.noPractices', currentLanguage)}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCurrentScreen('practices')}
          >
            {t('copy.profile.choosePractices', currentLanguage)}
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
      <CardTitle>{t('copy.profile.recentRatings', currentLanguage)}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {assessments.slice(-5).reverse().map((assessment) => {
          const slot = slots.find(s => s.id === assessment.slotId);
          const practice = slot?.practiceId ? practices.find(p => p.id === slot.practiceId) : null;
          const date = new Date(assessment.timestamp);

          return (
             <div key={assessment.slotId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm font-medium">
                  {practice?.name || t('copy.common.neutralSlot', currentLanguage)}
                  </div>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString(locale)} {t('copy.common.at', currentLanguage)} {date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  {t('copy.rating.mood', currentLanguage)}: {assessment.mood}/10
                  </div>
                <div className="text-xs text-muted-foreground">
                  {t('copy.rating.ease', currentLanguage)}: {assessment.lightness}/10
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
    <CardTitle>{t('copy.profile.quickActions', currentLanguage)}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button
        variant="outline"
        onClick={() => setCurrentScreen('practices')}
        className="h-auto py-4 flex-col gap-2">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm">{t('copy.profile.choosePractices', currentLanguage)}</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => setCurrentScreen('plan')}
        className="h-auto py-4 flex-col gap-2"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-sm">{t('copy.profile.dayPlan', currentLanguage)}</span>
      </Button>
      <Button
        variant="outline"
        onClick={() => setCurrentScreen('dashboard')}
        className="h-auto py-4 flex-col gap-2"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-sm">{t('copy.nav.dashboard', currentLanguage)}</span>
      </Button>
      <Button
        variant="outline" onClick={() => setCurrentScreen('settings')}
        className="h-auto py-4 flex-col gap-2"
      >
        <SettingsIcon className="w-5 h-5" />
        <span className="text-sm">{t('copy.nav.settings', currentLanguage)}</span>
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
    const getTimeOfDayText = (timeOfDay: string) => {
      switch (timeOfDay) {
        case 'morning': return t('copy.slot.meta.morning', currentLanguage);
        case 'day': return t('copy.slot.meta.afternoon', currentLanguage);
        case 'evening': return t('copy.slot.meta.evening', currentLanguage);
        default: return timeOfDay;
      }
    };

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

    const buildChartData = () => {
  // группируем оценки по timeOfDay слота
  const buckets: Record<'morning'|'day'|'evening', any[]> = { morning: [], day: [], evening: [] };
  assessments.forEach(a => {
    const slot = slots.find(s => s.id === a.slotId);
    if (!slot) return;
    buckets[slot.timeOfDay].push(a);
  });
  const avg = (arr: any[], key: 'mood'|'ease'|'satisfaction'|'nervousness') =>
    arr.length ? Math.round((arr.reduce((s,x)=> s + Number(x[key] ?? 0), 0) / arr.length) * 10) / 10 : 0;

  const label = (key:'morning'|'day'|'evening') =>
    key === 'morning' ? (currentLanguage==='ru'?'Утро': currentLanguage==='pl'?'Rano':'Morning')
    : key === 'day'    ? (currentLanguage==='ru'?'День': currentLanguage==='pl'?'Dzień':'Day')
                       : (currentLanguage==='ru'?'Вечер': currentLanguage==='pl'?'Wieczór':'Evening');

  return (['morning','day','evening'] as const).map(k => ({
    timeOfDay: label(k),
    mood: avg(buckets[k], 'mood'),
    lightness: avg(buckets[k], 'ease'), // если где-то остался lightness — тоже подхватится
    satisfaction: avg(buckets[k], 'satisfaction'),
    nervousness: avg(buckets[k], 'nervousness'),
  }));
};

    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (dateStr === today.toISOString().slice(0, 10)) {
        return currentLanguage === 'ru' ? 'Сегодня' : 
               currentLanguage === 'en' ? 'Today' : 'Dzisiaj';
      } else if (dateStr === yesterday.toISOString().slice(0, 10)) {
        return currentLanguage === 'ru' ? 'Вчера' : 
               currentLanguage === 'en' ? 'Yesterday' : 'Wczoraj';
      } else {
        return date.toLocaleDateString(currentLanguage === 'ru' ? 'ru-RU' : 
                                      currentLanguage === 'en' ? 'en-US' : 'pl-PL');
      }
    };

    const getCompletionRate = (completed: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((completed / total) * 100);
    };
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
          <h2 className="mb-2">{t('copy.nav.dashboard', currentLanguage)}</h2>
          <p className="text-muted-foreground">
                {currentLanguage === 'ru' ? 'История ваших практик' : 
                 currentLanguage === 'en' ? 'Your practice history' : 'Historia twoich praktyk'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentScreen('practices')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentLanguage === 'ru' ? 'Выбрать практики' : 
                 currentLanguage === 'en' ? 'Choose Practices' : 'Wybierz Praktyki'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentScreen('plan')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {currentLanguage === 'ru' ? 'Сегодняшний план' : 
                 currentLanguage === 'en' ? 'Today\'s Plan' : 'Dzisiejszy Plan'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Manual history refresh triggered');
                  refreshHistoryFromSlots();
                }}
                className="flex items-center gap-2"
              >
                🔄
                {currentLanguage === 'ru' ? 'Обновить историю' : 
                 currentLanguage === 'en' ? 'Refresh History' : 'Odśwież historię'}
              </Button>
            </div>
          </div>
        </div>
        
        {historyData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="mb-2">
                {currentLanguage === 'ru' ? 'Нет истории' : 
                 currentLanguage === 'en' ? 'No History' : 'Brak historii'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {currentLanguage === 'ru' ? 'Создайте свой первый план дня' : 
                 currentLanguage === 'en' ? 'Create your first day plan' : 'Utwórz swój pierwszy plan dnia'}
              </p>
              <Button onClick={() => setCurrentScreen('practices')}>
                {currentLanguage === 'ru' ? 'Начать' : 
                 currentLanguage === 'en' ? 'Get Started' : 'Rozpocznij'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {console.log('Rendering history data:', historyData)}
            {historyData.map((dayData, index) => (
              <Card key={dayData.date} className={index === 0 ? 'border-primary' : ''}>
                    <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {formatDate(dayData.date)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {dayData.slots.length} {currentLanguage === 'ru' ? 'практик' : 
                         currentLanguage === 'en' ? 'practices' : 'praktyk'}
                      </p>
              </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {getCompletionRate(dayData.completed, dayData.slots.length)}%
            </div>
                      <p className="text-sm text-muted-foreground">
                        {dayData.completed}/{dayData.slots.length} {currentLanguage === 'ru' ? 'завершено' : 
                         currentLanguage === 'en' ? 'completed' : 'ukończono'}
                      </p>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayData.slots.map((slot) => (
                      <div 
                        key={slot.id} 
                        className={`p-3 rounded-lg border ${
                          slot.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {practices.find(p => p.id === slot.practiceId)?.name || 'Unknown Practice'}
                          </h4>
                          {slot.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
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
                    {formatMinutes(practice.duration)}
                  </div>
                </div>
                <Switch 
                  checked={practice.selected}
                  onCheckedChange={async (checked: any) => {
                    try {
                      // Update backend
                      await apiUpdatePracticeTemplate(practice.id, { is_selected: checked });
                      
                      // Update local state
                    setPractices(prev => prev.map(p => 
                      p.id === practice.id ? { ...p, selected: checked } : p
                    ));
                      
                      // If unchecking, remove from daily plan
                      if (!checked) {
                        console.log(`Before removal - Current slots:`, slots.length);
                        setSlots(prev => {
                          const updatedSlots = prev.filter(slot => slot.practiceId !== practice.id);
                          console.log(`After removal - Updated slots:`, updatedSlots.length);
                          // Save updated slots to cookies
                          if (updatedSlots.length > 0) {
                            saveToCookies('dayPlanSlots', updatedSlots);
                          } else {
                            clearCookie('dayPlanSlots');
                          }
                          return updatedSlots;
                        });
                        
                        // Also remove from history data
                        setHistoryData(prev => prev.map(day => ({
                          ...day,
                          slots: day.slots.filter(slot => slot.practiceId !== practice.id)
                        })));
                        
                        console.log(`Removed practice "${practice.name}" from daily plan`);
                      } else {
                        console.log(`Added practice "${practice.name}" to daily plan`);
                      }
                    } catch (error) {
                      console.error('Failed to update practice selection:', error);
                      alert(currentLanguage === 'ru' ? 
                        'Ошибка при обновлении практики' :
                        currentLanguage === 'en' ? 
                        'Error updating practice' :
                        'Błąd podczas aktualizacji praktyki');
                    }
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle className="text-red-600">
              {currentLanguage === 'ru' ? 'Опасная зона' : 
               currentLanguage === 'en' ? 'Danger Zone' : 'Strefa niebezpieczna'}
            </CardTitle>
  </CardHeader>
          <CardContent className="space-y-4">
    <Button
              variant="destructive"
              onClick={resetUserData}
              className="w-full sm:w-auto"
            >
              {currentLanguage === 'ru' ? '🗑️ Удалить все данные' : 
               currentLanguage === 'en' ? '🗑️ Delete All Data' : '🗑️ Usuń wszystkie dane'}
    </Button>
            <p className="text-xs text-muted-foreground">
              {currentLanguage === 'ru' ? 
                'Удаляет все практики, планы, историю и оценки. Аккаунт остается нетронутым.' :
                currentLanguage === 'en' ? 
                'Deletes all practices, plans, history, and assessments. Account remains untouched.' :
                'Usuwa wszystkie praktyki, plany, historię i oceny. Konto pozostaje nietknięte.'}
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
    case 'login':
      return (
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
                      value={loginForm.email ?? ''}           // важно: всегда строка
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
                        placeholder={
                          currentLanguage === 'ru' ? 'Введите пароль' :
                          currentLanguage === 'en' ? 'Enter password' : 'Wprowadź hasło'
                        }
                        value={loginForm.password ?? ''}        // важно: всегда строка
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={!!loginForm.rememberMe}
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
                  {authLoading
                    ? (currentLanguage === 'ru' ? 'Вход...' :
                       currentLanguage === 'en' ? 'Logging in...' : 'Logowanie...')
                    : t('copy.auth.loginLink', currentLanguage)}
                </Button>

                <div className="text-center space-y-2">
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

    case 'register': {
      // локальный helper прямо внутри case
      const pwdLen = registerForm.password?.length ?? 0;
      const getPasswordStrength = () => {
        if (pwdLen < 6) return currentLanguage === 'ru' ? 'Слабый' : currentLanguage === 'en' ? 'Weak' : 'Słaby';
        if (pwdLen < 8) return currentLanguage === 'ru' ? 'Средний' : currentLanguage === 'en' ? 'Medium' : 'Średni';
        if (pwdLen < 10) return currentLanguage === 'ru' ? 'Хороший' : currentLanguage === 'en' ? 'Good' : 'Dobry';
        return currentLanguage === 'ru' ? 'Сильный' : currentLanguage === 'en' ? 'Strong' : 'Silny';
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
                        value={registerForm.firstName ?? ''}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={authLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('copy.auth.lastName', currentLanguage)}</Label>
                      <Input
                        id="lastName"
                        placeholder={t('copy.auth.lastName', currentLanguage)}
                        value={registerForm.lastName ?? ''}
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
                      value={registerForm.email ?? ''}
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
                        placeholder={
                          currentLanguage === 'ru' ? 'Минимум 8 символов' :
                          currentLanguage === 'en' ? 'Minimum 8 characters' : 'Minimum 8 znaków'
                        }
                        value={registerForm.password ?? ''}
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {registerForm.password && (
                      <div className="space-y-1">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((segment) => (
                            <div
                              key={segment}
                              className={`h-1 flex-1 rounded-full ${
                                pwdLen >= segment * 2
                                  ? pwdLen < 6
                                    ? 'bg-red-400'
                                    : pwdLen < 8
                                    ? 'bg-orange-400'
                                    : pwdLen < 10
                                    ? 'bg-green-400'
                                    : 'bg-blue-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{getPasswordStrength()}</p>
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
                        placeholder={
                          currentLanguage === 'ru' ? 'Повторите пароль' :
                          currentLanguage === 'en' ? 'Repeat password' : 'Powtórz hasło'
                        }
                        value={registerForm.confirmPassword ?? ''}
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
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={!!registerForm.agreeToTerms}
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
                  disabled={
                    authLoading ||
                    !registerForm.email ||
                    !registerForm.password ||
                    !registerForm.confirmPassword ||
                    !registerForm.agreeToTerms
                  }
                >
                  {authLoading
                    ? (currentLanguage === 'ru' ? 'Создание...' :
                       currentLanguage === 'en' ? 'Creating...' : 'Tworzenie...')
                    : t('copy.auth.register', currentLanguage)}
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
    }

    case 'practices':  return <PracticeSelection />;
    case 'plan':       return <DayPlan />;
    case 'slot':       return <SlotTimer />;
    case 'dashboard':  return <Dashboard />;
    case 'settings':   return <Settings />;
    case 'profile':    return <ProfileScreen />;
    default:           return isAuthenticated ? <PracticeSelection /> : (
      // по умолчанию показываем логин
      // (можно продублировать login JSX, но лучше переключить currentScreen='login' при маунте)
      <div />
    );
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
