import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { DEPARTMENTS } from '@/components/shared/DepartmentBadge'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!department) {
      setError('Bitte wähle deine Abteilung aus.')
      return
    }
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
          data: { first_name: firstName, last_name: lastName, department },
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
        <div className="w-full max-w-[400px] space-y-4 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" strokeWidth={1.5} />
          <h1 className="font-display text-xl font-bold text-text">Registrierung eingegangen</h1>
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
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold text-text">Registrieren</h1>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@albatros-international.de"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="department">Abteilung</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Abteilung wählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEPARTMENTS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
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
  )
}
