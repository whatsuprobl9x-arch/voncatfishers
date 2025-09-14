import { CONFIG } from './config.js';

// Minimal auth using Supabase public tables (NOT Supabase Auth).
// This assumes you created a `users` table with plaintext passwords (see supabase/init.sql).
const { createClient } = supabase;
const supa = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

window.login = async function login() {
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value || '';
  if (!email || !password) return alert('Please enter email and password.');

  // Query users table
  const { data, error } = await supa.from('users').select('*').eq('email', email).limit(1);
  if (error) return alert('Error querying users: ' + error.message);
  if (!data || data.length===0) return alert('Invalid credentials');
  const user = data[0];
  if (user.password !== password) return alert('Invalid credentials');

  // store session in localStorage (simple)
  localStorage.setItem('vc_user', JSON.stringify({id:user.id, email:user.email, role:user.role}));
  window.location.href = 'dashboard.html';
};

window.logout = async function logout() {
  localStorage.removeItem('vc_user');
  window.location.href = 'index.html';
};

window.currentUser = async function currentUser() {
  const raw = localStorage.getItem('vc_user');
  if (!raw) {
    return null;
  }
  return JSON.parse(raw);
};

window.ensureAuthRedirect = async function ensureAuthRedirect() {
  const u = await currentUser();
  if (!u) {
    window.location.href = 'index.html';
    throw new Error('Not authenticated');
  }
  return u;
};
