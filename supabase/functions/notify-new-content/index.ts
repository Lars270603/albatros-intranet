// Supabase Edge Function: notify-new-content
//
// Verschickt eine E-Mail an alle aktiven Mitarbeiter, sobald ein neuer
// News-Post oder ein neues Produkt im Albatros Intranet veröffentlicht wird.
//
// Aufruf (aus dem Frontend):
//   supabase.functions.invoke('notify-new-content', {
//     body: { type: 'news_post' | 'product', id: '<uuid>' }
//   })
//
// Benötigte Secrets (im Supabase Dashboard unter Edge Functions > Secrets):
//   IONOS_SMTP_USER      — die vollständige IONOS-Postfach-Adresse zum Login
//   IONOS_SMTP_PASSWORD  — das zugehörige Passwort
//
// SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY sind in Supabase Edge Functions
// automatisch als Umgebungsvariablen vorhanden, dafür ist keine eigene
// Secret-Konfiguration nötig.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const IONOS_SMTP_USER = Deno.env.get('IONOS_SMTP_USER')!
const IONOS_SMTP_PASSWORD = Deno.env.get('IONOS_SMTP_PASSWORD')!

const SENDER_EMAIL = 'intranet@albatros-international.eu'
const APP_BASE_URL = 'https://intranet.albatros-international.eu/#'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  let type: string | undefined
  let id: string | undefined

  try {
    const body = await req.json()
    type = body?.type
    id = body?.id
  } catch {
    return jsonResponse({ error: 'Ungültiger JSON-Body.' }, 400)
  }

  if (!id || (type !== 'news_post' && type !== 'product')) {
    return jsonResponse({ error: "type muss 'news_post' oder 'product' sein, id ist erforderlich." }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  let subject: string
  let link: string
  let bodyText: string

  try {
    if (type === 'news_post') {
      const { data: post, error } = await supabase
        .from('news_posts')
        .select('title, author:profiles(first_name, last_name)')
        .eq('id', id)
        .single()
      if (error || !post) throw error ?? new Error('News-Post nicht gefunden.')

      const authorName = [post.author?.first_name, post.author?.last_name].filter(Boolean).join(' ')
      subject = `Neu im Intranet: ${post.title}`
      link = `${APP_BASE_URL}/news`
      bodyText =
        `Es gibt einen neuen Beitrag im Albatros Intranet: "${post.title}"` +
        (authorName ? ` von ${authorName}.` : '.') +
        `\n\nJetzt ansehen: ${link}`
    } else {
      const { data: product, error } = await supabase
        .from('products')
        .select('name, creator:profiles(first_name, last_name)')
        .eq('id', id)
        .single()
      if (error || !product) throw error ?? new Error('Produkt nicht gefunden.')

      subject = `Neues Produkt im Intranet: ${product.name}`
      link = `${APP_BASE_URL}/products/${id}`
      bodyText = `Es gibt ein neues Produkt im Albatros Intranet: "${product.name}".\n\nJetzt ansehen: ${link}`
    }
  } catch (err) {
    console.error('notify-new-content: Eintrag konnte nicht geladen werden:', err)
    return jsonResponse({ error: 'Eintrag konnte nicht geladen werden.' }, 404)
  }

  const { data: activeProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email')
    .eq('status', 'active')
    .not('email', 'is', null)

  if (profilesError) {
    console.error('notify-new-content: Empfänger konnten nicht geladen werden:', profilesError)
    return jsonResponse({ error: 'Empfänger konnten nicht geladen werden.' }, 500)
  }

  const recipients = Array.from(
    new Set((activeProfiles ?? []).map((p) => p.email).filter((email): email is string => Boolean(email)))
  )

  if (recipients.length === 0) {
    return jsonResponse({ success: true, sent: 0, message: 'Keine aktiven Empfänger gefunden.' })
  }

  let sendError: unknown = null
  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.ionos.de',
      // Port 465 mit implizitem TLS statt 587+STARTTLS: STARTTLS-Verbindungen
      // lösen in Deno beim Socket-Upgrade einen bekannten, von den
      // denomailer-Maintainern als "wontfix" eingestuften Laufzeitfehler aus
      // (BadResource beim TLS-Handshake). IONOS unterstützt Port 465 mit
      // SSL/TLS als offiziell gleichwertige Alternative.
      port: 465,
      tls: true,
      auth: {
        username: IONOS_SMTP_USER,
        password: IONOS_SMTP_PASSWORD,
      },
    },
  })

  try {
    // Alle Empfänger per Bcc, damit niemand die Adressen der anderen sieht.
    await client.send({
      from: SENDER_EMAIL,
      to: SENDER_EMAIL,
      bcc: recipients,
      subject,
      content: bodyText,
      html: `<p>${bodyText.replace(/\n/g, '<br>')}</p>`,
    })
  } catch (err) {
    sendError = err
    console.error('notify-new-content: E-Mail-Versand fehlgeschlagen:', err)
  } finally {
    try {
      await client.close()
    } catch (closeErr) {
      console.error('notify-new-content: SMTP-Verbindung konnte nicht sauber geschlossen werden:', closeErr)
    }
  }

  // Die Function antwortet bewusst auch dann mit Erfolg, wenn der Mailversand
  // fehlschlägt — das Anlegen des Posts/Produkts im Frontend soll davon nicht
  // abhängen. Fehler stehen im Function-Log (Supabase Dashboard > Edge Functions > Logs).
  return jsonResponse({
    success: true,
    recipientCount: recipients.length,
    mailSendFailed: Boolean(sendError),
  })
})
