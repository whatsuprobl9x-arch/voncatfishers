import { CONFIG } from './config.js';
const { createClient } = supabase;
const supa = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

window.model_init = async function model_init(user){
  // show home
  const home = document.getElementById('homeTab');
  const { data: profile } = await supa.from('users').select('*').eq('id', user.id).single();
  home.innerHTML = `<h3>Welcome, ${profile.email}</h3><p>Balance: $${(profile.balance||0).toFixed(2)}</p>`;

  // content tab UI
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <h4>Submit Content</h4>
    <label>Content URL (REQUIRED)
      <input id="contentUrl" placeholder="https://mega.nz/..." />
    </label>
    <button class="btn" onclick="model_submitContent()">Send to admins</button>
    <hr/>
    <h4>Your submissions</h4>
    <div id="yourSubs">Loading...</div>
  `;
  await renderYourSubs(user.id);

  // support UI
  const supportArea = document.getElementById('supportArea');
  supportArea.innerHTML = `
    <h4>Send Support Message</h4>
    <input id="supportSubject" placeholder="Subject" /><br/><br/>
    <textarea id="supportMessage" placeholder="Message" rows="4"></textarea><br/>
    <button class="btn" onclick="model_sendSupport()">Send</button>
    <h4 style="margin-top:12px">Messages / Replies</h4>
    <div id="yourMessages">Loading...</div>
  `;
  await renderYourMessages(user.id);

  // payments tab
  const paymentsArea = document.getElementById('paymentsArea');
  paymentsArea.innerHTML = `
    <p>Balance: $${(profile.balance||0).toFixed(2)}</p>
    <button class="btn" onclick="model_requestPayout()">Request payout (monthly on 25th)</button>
    <div id="payoutStatus"></div>
  `;
};

window.model_submitContent = async function model_submitContent(){
  const u = await currentUser();
  const url = document.getElementById('contentUrl').value.trim();
  if (!url) return alert('Content URL is REQUIRED.');
  await supa.from('contents').insert([{user_id:u.id, url, status:'pending'}]);
  alert('Submitted. Admins will see it.');
  await renderYourSubs(u.id);
};

async function renderYourSubs(user_id){
  const { data } = await supa.from('contents').select('*').eq('user_id', user_id).order('created_at',{ascending:false});
  const el = document.getElementById('yourSubs');
  if (!data || data.length===0) return el.innerText = 'No submissions yet.';
  const rows = ['<table class="table"><tr><th>URL</th><th>Date</th><th>Status</th></tr>'];
  for (const r of data) rows.push(`<tr><td><a href="${r.url}" target="_blank">${r.url}</a></td><td>${r.created_at}</td><td>${r.status}</td></tr>`);
  rows.push('</table>');
  el.innerHTML = rows.join('');
}

window.model_sendSupport = async function model_sendSupport(){
  const u = await currentUser();
  const subject = document.getElementById('supportSubject').value.trim();
  const message = document.getElementById('supportMessage').value.trim();
  if (!subject || !message) return alert('Provide subject and message');
  await supa.from('support_messages').insert([{user_id:u.id, subject, message}]);
  alert('Support message sent.');
  await renderYourMessages(u.id);
};

async function renderYourMessages(user_id){
  const { data } = await supa.from('support_messages').select('*').eq('user_id', user_id).order('created_at',{ascending:false});
  const el = document.getElementById('yourMessages');
  if (!data || data.length===0) return el.innerText = 'No messages yet.';
  const rows = ['<table class="table"><tr><th>Subject</th><th>Message</th><th>Reply</th></tr>'];
  for (const r of data) rows.push(`<tr><td>${r.subject}</td><td>${r.message}</td><td>${r.reply||''}</td></tr>`);
  rows.push('</table>');
  el.innerHTML = rows.join('');
}

window.model_requestPayout = async function model_requestPayout(){
  const today = new Date();
  if (today.getDate() !== 25) return alert('Payouts can only be requested on the 25th of the month.');
  const u = await currentUser();
  await supa.from('payout_requests').insert([{user_id:u.id, amount: (u.balance||0)}]);
  alert('Payout requested. Admins will review.');
}
