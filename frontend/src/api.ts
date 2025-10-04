// src/api.ts
export type Language = 'ru' | 'en' | 'pl';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000/api';

type Tokens = { access: string; refresh: string };
let tokens: Tokens | null = null;

export function setTokens(next: Tokens | null) {
  tokens = next;
  if (next) {
    localStorage.setItem('access', next.access);
    localStorage.setItem('refresh', next.refresh);
  } else {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }
}
export function loadTokensFromStorage() {
  const access = localStorage.getItem('access');
  const refresh = localStorage.getItem('refresh');
  if (access && refresh) tokens = { access, refresh };
}

async function refreshAccessToken() {
  if (!tokens?.refresh) throw new Error('No refresh token');
  const r = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh })
  });
  if (!r.ok) throw new Error('refresh_failed');
  const data = await r.json();
  tokens = { access: data.access, refresh: tokens.refresh };
  localStorage.setItem('access', data.access);
}

async function request(path: string, init: RequestInit = {}, retry = true) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  if (tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry && tokens?.refresh) {
    // try refresh
    try {
      await refreshAccessToken();
      return request(path, init, false);
    } catch {
      setTokens(null);
    }
  }
  return res;
}

/** AUTH */
export async function apiRegister({ email, password }: { email: string; password: string; firstName?: string; lastName?: string; }) {
  // backend ждёт username+email+password; используем email как username
  const r = await request(`/users/registration/`, {
    method: 'POST',
    body: JSON.stringify({ username: email, email, password })
  });
  if (!r.ok) throw new Error((await r.json()).error || 'register_failed');
  return r.json(); // { message: string }
} // :contentReference[oaicite:9]{index=9}

export async function apiLogin({ email, password }: { email: string; password: string; }) {
  const r = await request(`/users/login/`, {
    method: 'POST',
    body: JSON.stringify({ username: email, password })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'login_failed');
  setTokens({ access: data.access, refresh: data.refresh });
  return data; // {message, access, refresh}
} // :contentReference[oaicite:10]{index=10}

export function apiLogout() {
  setTokens(null);
}

/** PRACTICES */
export type PracticeTemplate = {
  id: string; title: string; description: string; default_duration_sec: number;
};
export async function apiGetPracticeTemplates(): Promise<PracticeTemplate[]> {
  const r = await request(`/practices/`, { method: 'GET' });
  if (!r.ok) throw new Error('get_practices_failed');
  return r.json();
} // :contentReference[oaicite:11]{index=11}

export type UserPractice = { id: string; template: string; is_active: boolean };
export async function apiGetUserPractices(): Promise<UserPractice[]> {
  const r = await request(`/user_practices/`, { method: 'GET' });
  if (!r.ok) throw new Error('get_user_practices_failed');
  return r.json();
} // :contentReference[oaicite:12]{index=12}

export async function apiAddUserPracticeFromTemplate(template_id: string): Promise<UserPractice> {
  const r = await request(`/user_practices/from-template/`, {
    method: 'POST',
    body: JSON.stringify({ template_id })
  });
  if (!r.ok) throw new Error('add_user_practice_failed');
  return r.json();
} // :contentReference[oaicite:13]{index=13}

export async function apiDeleteUserPractice(user_practice_id: string) {
  const r = await request(`/user_practices/${user_practice_id}/`, { method: 'DELETE' });
  if (!r.ok) throw new Error('delete_user_practice_failed');
}

/** DAY PLAN + SLOTS */
export type DayPlan = { id: string; local_date: string; timezone: string };
export async function apiCreateDayPlan(local_date: string, timezone: string): Promise<DayPlan> {
  // NB: в твоём бекенде create сейчас только для admin — см. комментарий выше
  const r = await request(`/day_plan/`, {
    method: 'POST',
    body: JSON.stringify({ local_date, timezone })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.detail || 'create_day_plan_failed');
  return data;
} // :contentReference[oaicite:14]{index=14}

export type SlotCreate = {
  day_plan: string;
  user_practice?: string | null;
  variant: 'DO' | 'CONTROL';
  status: 'PLANNED' | 'IN_PROGRESS' | 'DONE';
  time_of_day: 'MORNING' | 'AFTERNOON' | 'EVENING';
  scheduled_at_utc: string;
  duration_sec_snapshot: number;
  display_payload?: Record<string, any>;
};
export type Slot = SlotCreate & { id: string };
export async function apiCreateSlot(payload: SlotCreate): Promise<Slot> {
  const r = await request(`/slots/`, { method: 'POST', body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('create_slot_failed');
  return r.json();
} // :contentReference[oaicite:15]{index=15}

export async function apiStartSlot(slotId: string) {
  const r = await request(`/slots/${slotId}/start/`, { method: 'PATCH' });
  if (!r.ok) throw new Error('start_slot_failed');
  return r.json();
} // :contentReference[oaicite:16]{index=16}

export async function apiFinishSlot(slotId: string) {
  const r = await request(`/slots/${slotId}/finish/`, { method: 'PATCH' });
  if (!r.ok) throw new Error('finish_slot_failed');
  return r.json();
} // :contentReference[oaicite:17]{index=17}

/** RATINGS */
export async function apiCreateRating(payload: {
  slot: string; mood: number; ease: number; satisfaction: number; nervousness: number;
}) {
  const r = await request(`/ratings/`, { method: 'POST', body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('create_rating_failed');
  return r.json();
} // :contentReference[oaicite:18]{index=18}
