// src/api.ts
export type Language = 'ru' | 'en' | 'pl';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://13.61.151.254:8000/api';

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

export async function apiLogout() {
  try {
    
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    if (refresh) {
      await fetch(`${API_URL}/users/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',...(access ? { Authorization: `Bearer ${access}` } : {}) },
        body: JSON.stringify({ refresh })
      });
    }
  } catch (_) {
  } finally {
    setTokens(null);
  }
}

/** PRACTICES */
export type PracticeTemplate = {
  id: string; title: string; description: string; default_duration_sec: number; is_selected: boolean;
};
export async function apiGetPracticeTemplates(): Promise<PracticeTemplate[]> {
  const r = await request(`/practices/`, { method: 'GET' });
  if (!r.ok) throw new Error('get_practices_failed');
  return r.json();
} // :contentReference[oaicite:11]{index=11}

export async function apiUpdatePracticeTemplate(
  id: string,
  patch: Partial<{ is_selected: boolean; duration_sec: number }>
): Promise<PracticeTemplate> {
  const r = await request(`/practices/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('update_practice_failed');
  return r.json();
}

export type DayPlan = { id: string; local_date: string; timezone: string };

export async function apiGetDayPlanByDate(local_date: string): Promise<DayPlan | null> {
  const r = await request(`/day_plan/?local_date=${encodeURIComponent(local_date)}`, { method: 'GET' });
  if (!r.ok) return null;
  const list = await r.json();
  return Array.isArray(list) && list.length ? list[0] : null;
}

export async function apiCreateDayPlan(local_date: string, timezone: string): Promise<DayPlan> {
  const existing = await apiGetDayPlanByDate(local_date);
  if (existing) return existing;

  const r = await request(`/day_plan/`, {
    method: 'POST',
    body: JSON.stringify({ local_date, timezone })
  });

  if (r.ok) return r.json();

  let data: any = null;
  try { data = await r.json(); } catch {}
  const msg = String(data?.detail || '');
  if (r.status === 400 || r.status === 409 || /exist|already/i.test(msg)) {
    const after = await apiGetDayPlanByDate(local_date);
    if (after) return after;
  }

  throw new Error(data?.detail || 'create_day_plan_failed');
}

export type SlotCreate = {
  day_plan: string;
  practice_template?: string | null;
  variant: 'DO' | 'CONTROL';
  status: 'PLANNED' | 'IN_PROGRESS' | 'DONE';
  time_of_day: 'MORNING' | 'AFTERNOON' | 'EVENING';
  scheduled_at_utc: string;
  duration_sec_snapshot: number;
  display_payload?: Record<string, any>;
};
export type Slot = SlotCreate & { id: string };
export async function apiListSlots(params?: { day_plan?: string }) : Promise<Slot[]> {
  const qs = params?.day_plan ? `?day_plan=${encodeURIComponent(params.day_plan)}` : '';
  const r = await request(`/slots/${qs}`, { method: 'GET' });
  if (!r.ok) throw new Error('list_slots_failed');
  return r.json();
}

export async function apiGenerateSlotsForPlan(dayPlanId: string) {
  const r = await request(`/slots/`, {
    method: 'POST',
    body: JSON.stringify({ day_plan: dayPlanId }),
  });
  if (!r.ok) throw new Error('generate_slots_failed');
  // тело может быть пустым/одним объектом — нам всё равно, мы потом делаем GET
  try { return await r.json(); } catch { return null; }
}

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
