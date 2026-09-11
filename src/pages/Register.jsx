import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import albatrosLogo from '@/assets/albatros-logo.png'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    setSubmitting(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      })
      if (signUpError) throw signUpError
      setRegistered(true)
    } catch (err) {
      console.error('Registrierung fehlgeschlagen:', err)
      setError(
        err.message?.includes('already registered')
          ? 'Diese E-Mail-Adresse ist bereits registriert.'
          : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="flex items-center justify-center gap-2">
            <img src={albatrosLogo} alt="Albatros" className="h-8 w-8 shrink-0 rounded-md" />
            <span className="font-display text-[15px] font-bold text-text">Albatros Intranet</span>
          </div>
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-success" strokeWidth={1.5} />
            <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-text">
              Registrierung eingegangen
            </h1>
            <p className="text-[14px] text-text-sub">
              Dein Account wird geprüft. Sobald er freigeschaltet wurde, kannst du dich einloggen.
            </p>
            <Link to="/login">
              <Button variant="outline" className="mt-2">
                Zur Anmeldung
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[420px] shrink-0 flex-col bg-surface border-r border-border p-12 lg:flex">
        <div className="flex items-center gap-2">
          <img src={albatrosLogo} alt="Albatros" className="h-8 w-8 shrink-0 rounded-md" />
          <span className="font-display text-[15px] font-bold text-text">Albatros Intranet</span>
        </div>
        <div className="mt-24">
          <p className="font-display text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-text">
            Alles, was das Team braucht — an einem Ort.
          </p>
          <p className="mt-3 text-[15px] text-text-sub">
            News, Archiv, Produkte und dein Team-Verzeichnis.
          </p>
        </div>
        <p className="mt-auto text-[13px] text-text-muted">Albatros International GmbH</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[360px] space-y-6">
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-text">Registrieren</h1>
            <p className="text-[14px] text-text-sub">Erstelle deinen Albatros-Intranet-Account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Vorname</Label>
                <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nachname</Label>
                <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

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
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mind. 8 Zeichen"
              />
            </div>

            {error && (
              <p className="rounded-md border border-primary bg-primary-light px-3 py-2 text-[13px] text-primary">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Wird registriert…' : 'Registrieren'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-sub">
            Bereits registriert?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
