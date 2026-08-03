import { useRef, useState } from 'react'
import { Lock, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/upload'
import { DEPARTMENTS } from '@/components/shared/DepartmentBadge'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const avatarInputRef = useRef(null)

  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [birthday, setBirthday] = useState(profile?.birthday || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleAvatarChange(file) {
    if (!file) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const avatarUrl = await uploadFile('avatars', file, `${user.id}.${ext}`)
      const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast({ title: 'Profilbild aktualisiert' })
    } catch (err) {
      console.error('Profilbild konnte nicht hochgeladen werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Upload fehlgeschlagen.' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          bio: bio || null,
          birthday: birthday || null,
        })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast({ title: 'Profil gespeichert' })
    } catch (err) {
      console.error('Profil konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Speichern fehlgeschlagen.' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein.')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      toast({ title: 'Passwort geändert' })
    } catch (err) {
      console.error('Passwort konnte nicht geändert werden:', err)
      setPasswordError('Passwort konnte nicht geändert werden.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-[560px] space-y-6">
      <h1 className="font-display text-[28px] font-extrabold tracking-tight text-text">Profil</h1>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="group relative"
              disabled={uploadingAvatar}
            >
              <InitialsAvatar
                firstName={profile?.first_name}
                lastName={profile?.last_name}
                avatarUrl={profile?.avatar_url}
                size={80}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              {uploadingAvatar ? 'Wird hochgeladen…' : 'Foto ändern'}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarChange(e.target.files?.[0])}
            />
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Vorname</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nachname</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Abteilung</Label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[15px] text-text-sub">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                {DEPARTMENTS[profile?.department]?.label}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                maxLength={120}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-right text-[12px] text-text-muted">{bio.length} / 120</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birthday">Geburtstag</Label>
              <Input id="birthday" type="date" value={birthday || ''} onChange={(e) => setBirthday(e.target.value)} />
              <p className="text-[12px] text-text-muted">
                Nur Tag und Monat werden im Team-Widget angezeigt
              </p>
            </div>

            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Wird gespeichert…' : 'Speichern'}
            </Button>
          </form>

          <Separator />

          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-[13px] font-medium uppercase tracking-wide text-text-sub">Passwort ändern</p>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Bestätigung</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && (
              <p className="rounded-md border border-primary bg-primary-light px-3 py-2 text-[13px] text-primary">
                {passwordError}
              </p>
            )}
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword ? 'Wird geändert…' : 'Passwort ändern'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
