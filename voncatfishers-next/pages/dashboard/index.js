import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

function Sidebar({ role, onLogout, setTab }) {
  return (
    <aside className="w-64 p-4 bg-[#071235] rounded-xl h-full">
      <h3 className="text-lg font-semibold">VonCatfishers</h3>
      <nav className="mt-6 flex flex-col gap-2">
        <button className="text-left p-2 rounded hover:bg-white/5" onClick={()=>setTab('home')}>Home</button>
        <button className="text-left p-2 rounded hover:bg-white/5" onClick={()=>setTab('content')}>Content</button>
        <button className="text-left p-2 rounded hover:bg-white/5" onClick={()=>setTab('support')}>Support</button>
        <button className="text-left p-2 rounded hover:bg-white/5" onClick={()=>setTab('payments')}>Payments</button>
        <div className="mt-4 border-t pt-4">
          <button className="text-left p-2 rounded hover:bg-white/5 text-red-400" onClick={onLogout}>Logout</button>
        </div>
      </nav>
    </aside>
  )
}

export default function DashboardPage(){
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('home')
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const raw = localStorage.getItem('vc_user')
    if (!raw) { router.push('/'); return }
    setUser(JSON.parse(raw))
    setLoading(false)
  }, [])

  async function logout(){
    localStorage.removeItem('vc_user')
    router.push('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#07070a] to-[#020214]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="md:col-span-1">
          <Sidebar role={user.role} onLogout={logout} setTab={setTab}/>
        </div>
        <div className="md:col-span-5 space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Dashboard</h2>
              <p className="text-sm text-gray-300">{user.email} • {user.role}</p>
            </div>
          </header>

          <main>
            {tab === 'home' && <Home user={user} />}
            {tab === 'content' && <ContentTab user={user} />}
            {tab === 'support' && <SupportTab user={user} />}
            {tab === 'payments' && <PaymentsTab user={user} />}
          </main>
        </div>
      </div>
      <footer className="mt-8 text-center text-sm text-gray-400">In order to send your content, please host it using <a href="https://mega.nz" target="_blank" rel="noreferrer" className="underline">MEGA</a> or <a href="https://mediafire.com" target="_blank" rel="noreferrer" className="underline">MediaFire</a> and enter the link here!</footer>
    </div>
  )
}

/* Components (Home, ContentTab, etc.) included below for single-file simplicity */

function Home({ user }) {
  const [stats, setStats] = useState(null)
  useEffect(()=> {
    async function load(){
      const { data: contents } = await supabase.from('contents').select('*')
      const { data: users } = await supabase.from('users').select('*')
      setStats({ contents: contents?.length || 0, users: users?.length || 0 })
    }
    load()
  }, [])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <h4 className="font-semibold">Role</h4>
        <p className="mt-2">{user.role}</p>
      </div>
      <div className="card">
        <h4 className="font-semibold">Users</h4>
        <p className="mt-2">{stats ? stats.users : '...'}</p>
      </div>
      <div className="card">
        <h4 className="font-semibold">Content submissions</h4>
        <p className="mt-2">{stats ? stats.contents : '...'}</p>
      </div>
    </div>
  )
}

function ContentTab({ user }){
  if (user.role === 'admin') return <AdminContent />
  return <ModelContent user={user} />
}

function AdminContent(){
  const [rows, setRows] = useState([])
  useEffect(()=> { load(); }, [])
  async function load(){
    const { data } = await supabase.from('contents').select('*').order('created_at', { ascending: false })
    setRows(data || [])
  }
  async function view(id){
    const { data } = await supabase.from('contents').select('*').eq('id', id).single()
    const u = await supabase.from('users').select('email').eq('id', data.user_id).single()
    alert('Content by '+ (u.data?.email || 'unknown') + '\n' + data.url)
  }
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">All submissions</h3>
      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead className="text-left text-sm text-gray-400">
            <tr><th className="p-2">User</th><th className="p-2">URL</th><th className="p-2">Date</th><th className="p-2">Status</th><th className="p-2">Action</th></tr>
          </thead>
          <tbody>
            {rows.map(r=> <tr key={r.id} className="border-t"><td className="p-2">{r.user_id}</td><td className="p-2"><a href={r.url} target="_blank" rel="noreferrer" className="underline">{r.url}</a></td><td className="p-2">{new Date(r.created_at).toLocaleString()}</td><td className="p-2">{r.status}</td><td className="p-2"><button className="small btn" onClick={()=>view(r.id)}>View</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ModelContent({ user }){
  const [url, setUrl] = useState('')
  const [subs, setSubs] = useState([])
  useEffect(()=> { load(); }, [])
  async function load(){
    const { data } = await supabase.from('contents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setSubs(data || [])
  }
  async function submit(){
    if (!url) return alert('Content URL is REQUIRED.')
    await supabase.from('contents').insert([{ user_id: user.id, url, status: 'pending' }])
    setUrl('')
    alert('Submitted.')
    load()
  }
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold">Submit Content</h3>
        <p className="text-sm text-gray-400 mt-2">Content URL (REQUIRED)</p>
        <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="https://mega.nz/..." value={url} onChange={e=>setUrl(e.target.value)}/>
        <div className="mt-3"><button className="btn" onClick={submit}>Send to admins</button></div>
      </div>

      <div className="card">
        <h4 className="font-semibold">Your submissions</h4>
        <div className="mt-2">
          {subs.length===0 ? <p className="text-sm text-gray-400">No submissions yet.</p> : (
            <ul className="space-y-2">{subs.map(s=> <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer" className="underline">{s.url}</a> — {new Date(s.created_at).toLocaleString()} — {s.status}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SupportTab({ user }){
  if (user.role === 'admin') return <AdminSupport />
  return <ModelSupport user={user} />
}

function AdminSupport(){
  const [msgs, setMsgs] = useState([])
  useEffect(()=> { load(); }, [])
  async function load(){
    const { data } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false })
    setMsgs(data || [])
  }
  async function reply(id){
    const r = prompt('Type reply:')
    if (!r) return
    await supabase.from('support_messages').update({ reply: r }).eq('id', id)
    load()
    alert('Replied.')
  }
  return (
    <div>
      <h3 className="font-semibold">Support messages</h3>
      <div className="mt-3 space-y-3">
        {msgs.length===0 ? <p className="text-sm text-gray-400">No messages.</p> : msgs.map(m=> (
          <div key={m.id} className="card">
            <p className="text-sm">User: {m.user_id}</p>
            <p className="mt-2 font-semibold">{m.subject}</p>
            <p className="mt-1 text-sm text-gray-300">{m.message}</p>
            <p className="mt-2 text-sm text-green-300">Reply: {m.reply || '-'}</p>
            <div className="mt-3"><button className="small btn" onClick={()=>reply(m.id)}>Reply</button></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelSupport({ user }){
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [msgs, setMsgs] = useState([])
  useEffect(()=> { load(); }, [])
  async function load(){
    const { data } = await supabase.from('support_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setMsgs(data || [])
  }
  async function send(){
    if (!subject || !message) return alert('Provide subject and message')
    await supabase.from('support_messages').insert([{ user_id: user.id, subject, message }])
    setSubject(''); setMessage('')
    load()
    alert('Sent.')
  }
  return (
    <div>
      <div className="card">
        <h4 className="font-semibold">Send Support Message</h4>
        <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)}/>
        <textarea className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" rows={4} placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)}></textarea>
        <div className="mt-2"><button className="btn" onClick={send}>Send</button></div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Messages / Replies</h4>
        {msgs.length===0 ? <p className="text-sm text-gray-400">No messages yet.</p> : msgs.map(m=> <div key={m.id} className="card mb-2"><p className="font-semibold">{m.subject}</p><p className="text-sm mt-1">{m.message}</p><p className="text-sm text-green-300 mt-2">Reply: {m.reply || '-'}</p></div>)}
      </div>
    </div>
  )
}

function PaymentsTab({ user }){
  if (user.role === 'admin') return <AdminPayments />
  return <ModelPayments user={user} />
}

function AdminPayments(){
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [giftEmail, setGiftEmail] = useState('')
  const [giftCode, setGiftCode] = useState('')

  async function sendCredit(){
    if (!email || !amount) return alert('Provide recipient and amount')
    const { data: u } = await supabase.from('users').select('*').eq('email', email).single()
    if (!u) return alert('User not found')
    const newBal = (u.balance || 0) + parseFloat(amount)
    await supabase.from('users').update({ balance: newBal }).eq('id', u.id)
    await supabase.from('transactions').insert([{ user_id: u.id, amount: parseFloat(amount), note: 'Admin credit' }])
    alert('Sent $' + amount)
  }

  async function sendGift(){
    if (!giftEmail || !giftCode) return alert('Provide gift recipient and code')
    const { data: u } = await supabase.from('users').select('*').eq('email', giftEmail).single()
    if (!u) return alert('User not found')
    await supabase.from('giftcards').insert([{ user_id: u.id, code: giftCode, created_by: 'admin' }])
    alert('Gift code stored for ' + giftEmail)
  }

  return (
    <div>
      <h3 className="font-semibold">Payments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="card">
          <h4 className="font-semibold">Send USD credit</h4>
          <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="recipient email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="amount" value={amount} onChange={e=>setAmount(e.target.value)}/>
          <div className="mt-2"><button className="btn" onClick={sendCredit}>Send</button></div>
        </div>

        <div className="card">
          <h4 className="font-semibold">Send giftcard code</h4>
          <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="recipient email" value={giftEmail} onChange={e=>setGiftEmail(e.target.value)}/>
          <input className="w-full mt-2 p-2 rounded-md bg-transparent border border-white/5" placeholder="gift code" value={giftCode} onChange={e=>setGiftCode(e.target.value)}/>
          <div className="mt-2"><button className="btn" onClick={sendGift}>Send Gift</button></div>
        </div>
      </div>
    </div>
  )
}

function ModelPayments({ user }){
  const [profile, setProfile] = useState(null)
  useEffect(()=> { load(); }, [])
  async function load(){
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    setProfile(data)
  }
  async function requestPayout(){
    const today = new Date()
    if (today.getDate() !== 25) return alert('Payouts can only be requested on the 25th of the month.')
    await supabase.from('payout_requests').insert([{ user_id: user.id, amount: profile.balance }])
    alert('Payout requested.')
  }
  return (
    <div>
      <h3 className="font-semibold">Payments</h3>
      <div className="card mt-3">
        <p>Balance: ${profile ? Number(profile.balance).toFixed(2) : '...'}</p>
        <div className="mt-3"><button className="btn" onClick={requestPayout}>Request payout (25th)</button></div>
      </div>
    </div>
  )
}
