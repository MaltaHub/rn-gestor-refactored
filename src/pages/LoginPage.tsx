import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { user } = useAuthStore()

  if (user) return <Navigate to="/" replace />

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return alert(error.message)

    return <Navigate to="/" replace />
  }

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" type="password" />
      <button disabled={loading} type="submit">Entrar</button>
    </form>
  )
}