import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog'
import albatrosLogo from '@/assets/albatros-logo.png'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profileError) throw profileError

      if (profile.status !== 'active') {
        await supabase.auth.signOut()
        setError('Dein Account wurde noch nicht freigeschaltet.')
        setSubmitting(false)
        return
      }

      await refreshProfile()
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login fehlgeschlagen:', err)
      setError('E-Mail oder Passwort ist falsch.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-surface border-r border-border p-12 lg:flex">
        <div className="flex items-center gap-2">
          <img src={albatrosLogo} alt="Albatros" className="h-8 w-8 shrink-0 rounded-md" />
          <span className="font-display text-[15px] font-bold text-text">Albatros Intranet</span>
        </div>
        <div>
          <p className="font-display text-2xl font-extrabold leading-tight text-text">
            Alles, was das Team braucht — an einem Ort.
          </p>
          <p className="mt-3 text-[15px] text-text-sub">
            News, Archiv, Produkte und dein Team-Verzeichnis.
          </p>
        </div>
        <p className="text-[13px] text-text-muted">Albatros International GmbH</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[360px] space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold text-text">Anmelden</h1>
            <p className="text-[14px] text-text-sub">Melde dich mit deinem Albatros-Account an.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@albatros-international.de"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-[13px] font-medium text-primary hover:underline"
                >
                  Passwort vergessen?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-md border border-primary bg-primary-light px-3 py-2 text-[13px] text-primary">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Wird angemeldet…' : 'Anmelden'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-sub">
            Noch kein Account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Registrieren
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </div>
  )
}
