import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState(false)
  const router = useRouter()

  async function handleLogin(e){
    e?.preventDefault()
    if(!email || !password) return alert('Enter email and password')
    const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1).single()
    if (error || !data) return alert('Invalid credentials')
    if (data.password !== password) return alert('Invalid credentials')
    localStorage.setItem('vc_user', JSON.stringify({ id: data.id, email: data.email, role: data.role }))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="card">
          <h1 className="text-2xl font-semibold">VonCatfishers</h1>
          <p className="text-sm text-gray-300">Sign in — no account creation</p>
          <form className="mt-4" onSubmit={handleLogin}>
            <label className="block text-sm text-gray-300">Email
              <input className="w-full mt-1 p-2 rounded-md bg-transparent border border-white/5" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.xyz"/>
            </label>
            <label className="block text-sm text-gray-300 mt-3">Password
              <input type="password" className="w-full mt-1 p-2 rounded-md bg-transparent border border-white/5" value={password} onChange={e=>setPassword(e.target.value)}/>
            </label>
            <div className="flex items-center justify-between mt-4">
              <button className="btn" type="submit">Sign in</button>
              <button type="button" className="text-sm text-gray-300" onClick={()=>setModal(true)}>Forgot?</button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Accounts are managed centrally. No create account option.</p>
          </form>
        </div>

        {modal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60">
            <div className="card max-w-sm">
              <p>Please contact <strong>@o_.block</strong> on Discord to reset your password (only for employees).</p>
              <div className="flex justify-end mt-4">
                <button className="small btn" onClick={()=>setModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
