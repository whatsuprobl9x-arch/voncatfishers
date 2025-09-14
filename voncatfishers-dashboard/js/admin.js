import { CONFIG } from './config.js';
const { createClient } = supabase;
const supa = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

window.admin_init = async function admin_init(user){
  // render admin home stats
  const home = document.getElementById('homeTab');
  home.innerHTML = '<h3>Admin Dashboard</h3><div id="statsArea">Loading stats...</div>';
  await renderStats();

  // content tab: show submissions
  await renderSubmissions();

  // support tab: load messages
  await renderSupport();

  // payments tab: admin tools to send USD or giftcodes
  await renderPayments();
};

async function renderStats(){
  const { data: counts } = await supa
    .rpc('vc_count_stats'); // optional RPC if created, else do simple queries

  // simple counts
  const { data: contents } = await supa.from('contents').select('*');
  const { data: users } = await supa.from('users').select('*');
  document.getElementById('statsArea').innerHTML = '<p>Total users: '+(users?.length||0)+'</p><p>Total content submissions: '+(contents?.length||0)+'</p>';
}

async function renderSubmissions(){
  const { data, error } = await supa.from('contents').select('id, user_id, url, created_at, status').order('created_at', {ascending:false});
  const el = document.getElementById('contentArea');
  if (error) return el.innerText = 'Error loading: ' + error.message;
  if (!data.length) return el.innerText = 'No submissions yet.';
  const table = ['<table class="table"><tr><th>User</th><th>URL</th><th>Date</th><th>Status</th><th>Action</th></tr>'];
  for (const row of data){
    // fetch user email
    const u = await supa.from('users').select('email').eq('id', row.user_id).single();
    const email = u?.data?.email || 'unknown';
    table.push(`<tr><td>${email}</td><td><a href="${row.url}" target="_blank">${row.url}</a></td><td>${row.created_at}</td><td>${row.status}</td><td><button class="btn small" onclick="admin_viewContent('${row.id}')">View</button></td></tr>`);
  }
  table.push('</table>');
  el.innerHTML = table.join('');
}

window.admin_viewContent = async function admin_viewContent(id){
  const { data } = await supa.from('contents').select('*').eq('id', id).single();
  if (!data) return alert('Not found');
  const u = await supa.from('users').select('email').eq('id', data.user_id).single();
  alert('Content by '+(u.data?.email||'unknown')+'\nURL: '+data.url);
}

// payments / giftcards
async function renderPayments(){
  const el = document.getElementById('paymentsArea');
  el.innerHTML = `<h4>Send USD credit</h4>
    <div class="input-inline"><input id="payEmail" placeholder="recipient email" /> <input id="payAmount" placeholder="amount" /></div>
    <button class="btn" onclick="admin_sendCredit()">Send</button>
    <h4 style="margin-top:14px">Send giftcard code</h4>
    <div class="input-inline"><input id="giftEmail" placeholder="recipient email" /> <input id="giftCode" placeholder="gift code" /></div>
    <button class="btn" onclick="admin_sendGift()">Send gift</button>
  `;
}

window.admin_sendCredit = async function admin_sendCredit(){
  const email = document.getElementById('payEmail').value.trim();
  const amt = parseFloat(document.getElementById('payAmount').value);
  if (!email || !amt) return alert('Provide email and amount');
  const { data: u } = await supa.from('users').select('*').eq('email', email).single();
  if (!u) return alert('User not found');
  const newBal = (u.balance || 0) + amt;
  await supa.from('users').update({balance:newBal}).eq('id', u.id);
  await supa.from('transactions').insert([{user_id:u.id, amount:amt, note:'Admin credit'}]);
  alert('Sent $'+amt+' to '+email);
}

window.admin_sendGift = async function admin_sendGift(){
  const email = document.getElementById('giftEmail').value.trim();
  const code = document.getElementById('giftCode').value.trim();
  if (!email || !code) return alert('Provide email and code');
  const { data: u } = await supa.from('users').select('*').eq('email', email).single();
  if (!u) return alert('User not found');
  await supa.from('giftcards').insert([{user_id:u.id, code, created_by:'admin'}]);
  alert('Gift code sent to '+email);
}

// support functions
async function renderSupport(){
  const { data } = await supa.from('support_messages').select('id,user_id,subject,message,reply,created_at').order('created_at', {ascending:false});
  const el = document.getElementById('supportArea');
  if (!data || data.length===0) return el.innerText = 'No support messages.';
  const rows = ['<table class="table"><tr><th>User</th><th>Subject</th><th>Message</th><th>Reply</th><th>Action</th></tr>'];
  for (const msg of data){
    const u = await supa.from('users').select('email').eq('id', msg.user_id).single();
    const email = u?.data?.email || 'unknown';
    rows.push(`<tr><td>${email}</td><td>${msg.subject}</td><td>${msg.message}</td><td>${msg.reply||''}</td><td><button class="btn small" onclick="admin_reply('${msg.id}')">Reply</button></td></tr>`);
  }
  rows.push('</table>');
  el.innerHTML = rows.join('');
}

window.admin_reply = async function admin_reply(id){
  const reply = prompt('Type reply for support message ID '+id);
  if (!reply) return;
  await supa.from('support_messages').update({reply}).eq('id', id);
  alert('Replied.');
  await renderSupport();
}
