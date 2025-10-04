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

import { Skeleton } from "./components/ui/skeleton";
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
  ArrowLeft
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

// Initial data
const initialPractices: Practice[] = [
  {
    id: '1',
    name: 'Дыхание 4-7-8',
    duration: 2,
    description: 'Техника глубокого дыхания для расслабления',
    active: true
  },
  {
    id: '2', 
    name: '10 приседаний',
    duration: 1,
    description: 'Лёгкая физическая активность',
    active: true
  },
  {
    id: '3',
    name: '30 сек солнечного света',
    duration: 0.5,
    description: 'Естественное освещение для бодрости',
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
  const [currentScreen, setCurrentScreen] = useState<'practices' | 'plan' | 'slot' | 'dashboard' | 'settings' | 'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [practices, setPractices] = useState<Practice[]>(initialPractices);
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
    let interval: NodeJS.Timeout;
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

  // Generate daily plan
  const generateDayPlan = () => {
    const activePractices = practices.filter(p => p.active);
    const today = new Date().toISOString().split('T')[0];
    const timeSlots: ('morning' | 'day' | 'evening')[] = ['morning', 'day', 'evening'];
    
    const newSlots: Slot[] = [];
    for (let i = 0; i < 6; i++) {
      const isPlacebo = Math.random() < 0.3; // 30% chance for placebo
      const practiceId = isPlacebo ? null : activePractices[Math.floor(Math.random() * activePractices.length)]?.id || null;
      const timeOfDay = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      newSlots.push({
        id: `slot-${Date.now()}-${i}`,
        practiceId,
        timeOfDay,
        duration: practiceId ? practices.find(p => p.id === practiceId)?.duration || 2 : 2,
        completed: false,
        date: today,
        instruction: 'Следуйте таймеру. Дышите спокойно или сидите удобно.'
      });
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

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  // Get time of day icon
  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return <Sunrise className="w-4 h-4" />;
      case 'day': return <Sun className="w-4 h-4" />;
      case 'evening': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Navigation component
  const Navigation = () => {
    const isAuthScreen = currentScreen === 'login' || currentScreen === 'register';
    
    return (
      <nav className="border-b bg-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl tracking-tight">Placebo Coach</h1>
            {isAuthenticated && !isAuthScreen && (
              <div className="hidden md:flex space-x-6">
                <Button 
                  variant={currentScreen === 'plan' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('plan')}
                  className="h-9"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  План
                </Button>
                <Button 
                  variant={currentScreen === 'slot' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('slot')}
                  className="h-9"
                  disabled={!currentSlot}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Слот
                </Button>
                <Button 
                  variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('dashboard')}
                  className="h-9"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Дашборд
                </Button>
                <Button 
                  variant={currentScreen === 'settings' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('settings')}
                  className="h-9"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Настройки
                </Button>
              </div>
            )}
          </div>
          
          {isAuthenticated && !isAuthScreen ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                title="Выйти"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          ) : !isAuthScreen ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentScreen('login')}
              title="Войти"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Войти
            </Button>
          ) : null}
        </div>
      </nav>
    );
  };

  // Practice Selection Screen
  const PracticeSelection = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="mb-4">Выберите практики для эксперимента</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Отметьте практики, которые хотите протестировать. Слоты иногда будут "нейтральными" — 
          интерфейс специально не раскрывает какие. Это нужно для честного сравнения.
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
                    {practice.duration === 0.5 ? '30 сек' : `${practice.duration} мин`}
                  </Badge>
                </div>
                <Checkbox 
                  checked={practice.active}
                  onCheckedChange={(checked) => {
                    setPractices(prev => prev.map(p => 
                      p.id === practice.id ? { ...p, active: !!checked } : p
                    ));
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
          Составить план на сегодня
        </Button>
      </div>
    </div>
  );

  // Day Plan Screen
  const DayPlan = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2">План на сегодня</h2>
        <p className="text-muted-foreground">
          {slots.length} слотов готовы к выполнению
        </p>
      </div>
      
      {slots.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-4">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="mb-2">План не составлен</h3>
            <p className="text-muted-foreground mb-6">
              Вернитесь к выбору практик и создайте план на сегодня
            </p>
            <Button onClick={() => setCurrentScreen('practices')}>
              Составить план
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slots.map((slot, index) => (
            <Card key={slot.id} className={slot.completed ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">Слот #{index + 1}</CardTitle>
                  {slot.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {getTimeIcon(slot.timeOfDay)}
                  <span className="capitalize">{slot.timeOfDay === 'day' ? 'день' : slot.timeOfDay === 'morning' ? 'утро' : 'вечер'}</span>
                  <span>•</span>
                  <span>{slot.duration === 0.5 ? '30 сек' : `${slot.duration} мин`}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">сегодня</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {slot.instruction}
                </p>
                <Button 
                  onClick={() => startSlot(slot)}
                  disabled={slot.completed}
                  className="w-full"
                >
                  {slot.completed ? 'Завершён' : 'Старт'}
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Slot Timer Screen
  const SlotTimer = () => {
    if (!currentSlot) return null;
    
    const progress = currentSlot.duration > 0 ? ((currentSlot.duration * 60 - timeRemaining) / (currentSlot.duration * 60)) * 100 : 0;
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-8">
            <h2 className="mb-2">Слот в процессе</h2>
            <p className="text-muted-foreground">
              {currentSlot.instruction}
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
                    {currentSlot.duration === 0.5 ? '30 сек' : `${currentSlot.duration} мин`}
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
                Старт
              </Button>
            )}
            {timerState === 'running' && (
              <Button onClick={pauseTimer} variant="outline" size="lg">
                <Pause className="w-5 h-5 mr-2" />
                Пауза
              </Button>
            )}
            {timerState === 'paused' && (
              <Button onClick={startTimer} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Продолжить
              </Button>
            )}
            <Button onClick={completeTimer} variant="outline" size="lg">
              <Square className="w-5 h-5 mr-2" />
              Завершить
            </Button>
          </div>
        </div>
        
        {/* Assessment Modal */}
        {showAssessment && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-t-lg p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Как вы сейчас?</h3>
                <p className="text-sm text-muted-foreground">
                  Оценка нужна, чтобы увидеть, что реально помогает
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>Настроение</label>
                    <span className="text-sm text-muted-foreground">{assessment.mood[0]}</span>
                  </div>
                  <Slider
                    value={assessment.mood}
                    onValueChange={(value) => setAssessment(prev => ({ ...prev, mood: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>Чувство лёгкости</label>
                    <span className="text-sm text-muted-foreground">{assessment.lightness[0]}</span>
                  </div>
                  <Slider
                    value={assessment.lightness}
                    onValueChange={(value) => setAssessment(prev => ({ ...prev, lightness: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>Удовлетворённость</label>
                    <span className="text-sm text-muted-foreground">{assessment.satisfaction[0]}</span>
                  </div>
                  <Slider
                    value={assessment.satisfaction}
                    onValueChange={(value) => setAssessment(prev => ({ ...prev, satisfaction: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label>Нервозность</label>
                    <span className="text-sm text-muted-foreground">{assessment.nervousness[0]}</span>
                  </div>
                  <Slider
                    value={assessment.nervousness}
                    onValueChange={(value) => setAssessment(prev => ({ ...prev, nervousness: value }))}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <Button onClick={saveAssessment} className="w-full" size="lg">
                  Сохранить
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Вход</CardTitle>
          <p className="text-muted-foreground">
            Продолжим ваш N=1 эксперимент
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
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
                onCheckedChange={(checked) => setLoginForm(prev => ({ ...prev, rememberMe: !!checked }))}
                disabled={authLoading}
              />
              <Label htmlFor="remember" className="text-sm">
                Запомнить меня
              </Label>
            </div>
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full" 
            size="lg"
            disabled={authLoading || !loginForm.email || !loginForm.password}
          >
            {authLoading ? 'Вход...' : 'Войти'}
          </Button>
          
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Демо: test@example.com / password
            </div>
            <p className="text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <button
                onClick={() => setCurrentScreen('register')}
                className="text-primary hover:underline"
                disabled={authLoading}
              >
                Зарегистрироваться
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Это N=1 эксперимент, не медицинская рекомендация
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Register Screen
  const RegisterScreen = () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
          <p className="text-muted-foreground">
            Пара экранов — и можно к практике
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
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  placeholder="Имя"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={authLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Фамилия"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={authLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registerEmail">Email</Label>
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
              <Label htmlFor="registerPassword">Пароль</Label>
              <div className="relative">
                <Input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 8 символов"
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
                    {registerForm.password.length < 6
                      ? 'Слабый'
                      : registerForm.password.length < 8
                      ? 'Средний'
                      : registerForm.password.length < 10
                      ? 'Хороший'
                      : 'Сильный'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердить пароль</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Повторите пароль"
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
                onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, agreeToTerms: !!checked }))}
                disabled={authLoading}
              />
              <Label htmlFor="terms" className="text-sm">
                Согласен с условиями и политикой
              </Label>
            </div>
          </div>
          
          <Button 
            onClick={handleRegister} 
            className="w-full" 
            size="lg"
            disabled={authLoading || !registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.agreeToTerms}
          >
            {authLoading ? 'Создание...' : 'Создать аккаунт'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <button
                onClick={() => setCurrentScreen('login')}
                className="text-primary hover:underline"
                disabled={authLoading}
              >
                Войти
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Dashboard Screen
  const Dashboard = () => {
    const [selectedMetric, setSelectedMetric] = useState<'mood' | 'lightness' | 'satisfaction' | 'nervousness'>('mood');
    
    const metricLabels = {
      mood: 'Настроение',
      lightness: 'Лёгкость', 
      satisfaction: 'Удовлетворённость',
      nervousness: 'Нервозность'
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="mb-2">Дашборд</h2>
          <p className="text-muted-foreground">
            Анализ эффективности практик
          </p>
        </div>
        
        {assessments.length < 3 ? (
          <Card className="text-center py-12 mb-8">
            <CardContent>
              <h3 className="mb-2">Недостаточно данных</h3>
              <p className="text-muted-foreground">
                Сделайте ещё {3 - assessments.length} слота, чтобы появились первые выводы
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="mb-4">Итоги по практикам</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practices.filter(p => p.active).map(practice => (
                  <Card key={practice.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{practice.name}</CardTitle>
                      <div className="text-2xl mb-2">+0.7 к настроению</div>
                      <Badge variant="outline" className="w-fit">
                        уверенность: средняя
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Сравнение: слоты с практикой vs слоты "ничего не делать"
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>По времени суток</CardTitle>
                  <Tabs value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                    <TabsList>
                      <TabsTrigger value="mood">Настроение</TabsTrigger>
                      <TabsTrigger value="lightness">Лёгкость</TabsTrigger>
                      <TabsTrigger value="satisfaction">Удовлетворённость</TabsTrigger>
                      <TabsTrigger value="nervousness">Нервозность</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData}>
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
        <h2 className="mb-2">Настройки</h2>
        <p className="text-muted-foreground">
          Управление практиками и данными
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Практики</CardTitle>
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
                  onCheckedChange={(checked) => {
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
        >
          <Calendar className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'slot' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('slot')}
          size="sm"
          disabled={!currentSlot}
        >
          <Clock className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('dashboard')}
          size="sm"
        >
          <LayoutDashboard className="w-4 h-4" />
        </Button>
        <Button 
          variant={currentScreen === 'settings' ? 'default' : 'ghost'}
          onClick={() => setCurrentScreen('settings')}
          size="sm"
        >
          <SettingsIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          onClick={handleLogout}
          size="sm"
          title="Выйти"
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