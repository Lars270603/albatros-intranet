# Albatros Intranet — Design System

> **v2 (Redesign)** — visuelles Refinement, Funktionalität unverändert. Werte in diesem Dokument
> spiegeln den aktuell live geschalteten Stand wider.

## Referenz-Ästhetik
Vercel Dashboard + Stripe Dashboard.
Hell, präzise, technisch. Nicht generisch, nicht KI-generiert wirkend.
Hierarchie entsteht aus Typographie und Spacing — nicht aus Boxen und Borders.
Fast monochrom: Rot erscheint ausschließlich bei aktiven States, CTAs und Badges.

## Farben
```css
:root {
  --bg:           #FFFFFF;
  --surface:      #F8F9FA;
  --surface-2:    #F3F4F6;
  --border:       #E5E7EB;
  --border-strong:#D1D5DB;
  --text:         #111827;
  --text-sub:     #6B7280;
  --text-muted:   #9CA3AF;
  --accent:       #DC2626;
  --accent-hover: #B91C1C;
  --accent-light: #FEF2F2;
  --success:      #16A34A;
  --success-light:#F0FDF4;
  --warning:      #D97706;
  --warning-light:#FFFBEB;
}
```
Kein Beige, kein Cream, kein Warm-White. Maximal eine Akzentfarbe (#DC2626) —
Success/Warning/Destructive sind semantische Systemfarben, kein zweiter Brand-Akzent.

## Typographie
Font-Import (index.html):

Plus Jakarta Sans: weights 400, 500, 700, 800
Geist: weights 400, 500
JetBrains Mono: weight 400

Skala:
- H1 / Seitentitel: Plus Jakarta Sans 800, 32px, tracking -0.02em, color: var(--text)
- H2: Plus Jakarta Sans 700, 22px, tracking -0.01em
- H3: Plus Jakarta Sans 700, 18px
- Sub-Label: Geist 500, 12px, uppercase, tracking 0.08em, color: var(--text-sub)
- Body: Geist 400, 15px, line-height 1.6
- Caption: Geist 400, 13px, color: var(--text-muted)
- Code: JetBrains Mono 400, 13px

Gewichte extrem einsetzen — 800 für Haupttitel, 400 für Fließtext, nichts Halbes dazwischen.

## Karten
```css
border: 1px solid var(--border);
border-radius: 12px;
background: var(--bg);
/* KEIN box-shadow — Border ist der einzige Tiefeneffekt */
```
Hover:
```css
border-color: var(--border-strong);
transform: translateY(-1px);
transition: all 150ms ease;
```

## Buttons
Primary:
```css
background: var(--accent);
color: white;
border-radius: 8px;
padding: 8px 16px;
font: Geist 500 14px;
/* kein gradient, kein shadow */
```
Hover: `background: var(--accent-hover)`

Secondary:
```css
background: var(--bg);
border: 1px solid var(--border);
color: var(--text);
border-radius: 8px;
```

Ghost:
```css
background: transparent;
color: var(--text-sub);
/* kein border */
```

## Inputs
```css
border: 1px solid var(--border);
border-radius: 8px;
padding: 8px 12px;
font: Geist 400 15px;
background: var(--bg);
/* Pflicht: min 16px font-size um Mobile-Zoom zu verhindern */
```
Focus: `border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-light)`

## Navigation — Linke Sidebar
Breite: 240px, fixiert
Hintergrund: var(--surface)
Rechter Border: 1px solid var(--border)
Nav-Item Höhe: 44px

Nav-Item aktiv:
```css
background: var(--accent-light);
color: var(--accent);
border-left: 2px solid var(--accent);
font-weight: 500;
```

Nav-Item inaktiv: color: var(--text-sub), kein Hintergrund.

Nav-Item hover:
```css
background: var(--surface-2);
color: var(--text);
```

## Badges
Brand-Badges (Pill, klein):
- Arensberger: bg #DBEAFE, text #1E40AF
- Sommertal:   bg #FEF3C7, text #92400E
- Albatros:    bg #FEE2E2, text #991B1B
- Ravino:      bg #F3F4F6, text #374151
- Burggraf:    bg #FEF9C3, text #854D0E
- Stahlmann:   bg #1F2937, text #F9FAFB

Abteilungs-Badges:
- Vertrieb:          bg #EDE9FE, text #5B21B6
- Einkauf:           bg #CFFAFE, text #155E75
- Kundenservice:     bg #DCFCE7, text #166534
- Geschäftsführung:  bg #FFE4E6, text #9F1239

## InitialsAvatar
6 mögliche Hintergrundfarben (aus Name-Hash):
#EF4444 / #3B82F6 / #10B981 / #F59E0B / #8B5CF6 / #EC4899
Text: white, font: Plus Jakarta Sans 700

## Spacing
8px Grid: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 80 / 96
Page-Padding: 32px · Section-Gap: 40px · Card-Padding: 20px. Niemals ungerade Zahlen.

## Tabellen
Zeilen: 48px Höhe. Hover: background: var(--surface). Kein Border zwischen Zeilen —
nur ein subtiler border-bottom: 1px solid var(--surface-2).

## Empty States
Großes Lucide-Icon (text-gray-200), darunter Titel (color: var(--text-sub)),
darunter optionaler CTA. Niemals einfach leer.

## Skeleton Loader
Nur background: var(--surface-2) Rechtecke mit animate-pulse. Kein Spinner — nirgends.

## Animationen
Page Transition: opacity 0→1 + translateY 6px→0, duration: 120ms.
Card-Hover: 150ms ease (siehe oben).
Keine weiteren dekorativen Animationen (keine Loops, kein Parallax, nichts > 200ms).

## Bilder & Platzhalter
`https://picsum.photos` als Platzhalter, bis echte Fotos eingesetzt werden:
- Produktkarten ohne Bild: `picsum.photos/400/300?grayscale` + BrandBadge-Overlay oben links
Bilder sind Akzente, kein Vollbild-Hero, keine Stock-Foto-Wände, nichts überlappt Text.
Die Homepage-Begrüßung ist bewusst rein typographisch (kein Bild/Banner).

## Anti-Patterns (explizit verboten)
- Gradient Backgrounds
- Purple / Indigo als Akzentfarbe
- box-shadow als primäres Styling-Tool
- Equal-width three-column card heroes
- "Elevate your workflow"-Marketing-Copy
- Emoji als UI-Elemente (Ausnahme: funktionale Reaktions-Emojis 👍🎉👀, da Teil des Datenmodells)
- Lorem Ipsum
- Neon Glow Effects
- Custom Cursor
- Glassmorphism / Frosted Glass
- Rounded Pill Buttons als Primary CTA
- Animationen länger als 200ms

## Projekt-Setup

Repo: github.com/Lars270603/albatros-intranet
Deploy: GitHub Pages via GitHub Actions
Base URL: /albatros-intranet/

Tech-Stack:

- React 18 + Vite
- Tailwind CSS v3
- shadcn/ui (als primäre Komponentenbibliothek)
- React Router v6 — HashRouter (Pflicht für GitHub Pages)
- Supabase JS v2
- Lucide React (Icons, strokeWidth 1.5)
- Motion (ehemals Framer Motion) — nur für Page Transitions

Setup-Reihenfolge:

1. npm create vite@latest . -- --template react
2. Tailwind installieren + konfigurieren
3. npx shadcn@latest init — theme: Default, base color: Neutral
4. shadcn-Komponenten installieren: npx shadcn@latest add button input textarea select badge avatar dialog tabs dropdown-menu toast separator skeleton
5. Supabase JS installieren: npm install @supabase/supabase-js
6. Motion installieren: npm install motion
7. react-markdown installieren: npm install react-markdown

vite.config.js:
```js
export default {
  base: '/albatros-intranet/',
  plugins: [react()]
}
```

GitHub Actions — .github/workflows/deploy.yml:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Authentifizierung & Rollen

Provider: Supabase Auth (Email + Password)

Rollen: admin | member

Account-Status: pending → active → (optional) rejected

Abteilungen: vertrieb | einkauf | kundenservice | geschaeftsfuehrung

Registrierung:
```js
supabase.auth.signUp({
  email,
  password,
  options: {
    data: { first_name, last_name, department }
  }
})
```

Trigger legt profiles-Eintrag mit status: 'pending' an.

Nach Registrierung: Seite mit Meldung:
"Dein Account wird geprüft. Sobald er freigeschaltet wurde, kannst du dich einloggen."

Login-Flow:
1. signInWithPassword() aufrufen
2. profiles-Eintrag laden
3. Wenn status !== 'active' → ausloggen + Meldung: "Dein Account wurde noch nicht freigeschaltet."
4. Weiterleitung zu /

Berechtigungen:

- Produkte anlegen: department === 'vertrieb' || department === 'geschaeftsfuehrung' || role === 'admin'
- Admin-Panel: role === 'admin'
- Alles andere: alle aktiven User

## Routing
HashRouter (#/)

- /#/             → Home
- /#/login        → Login
- /#/register     → Registrierung
- /#/news         → News
- /#/documents    → Dokumente
- /#/products     → Neue Produkte (Liste)
- /#/products/new → Produkt anlegen
- /#/products/:id → Produkt-Detailseite
- /#/team         → Team-Verzeichnis
- /#/admin        → Admin-Panel (nur admin)
- /#/profile      → Eigenes Profil

ProtectedRoute: Redirect zu /#/login wenn kein aktiver User.
AdminRoute: Redirect zu /#/ wenn nicht admin.

## Seiten

### Layout-Wrapper

Sidebar links (240px, fix):
- Oben: Logo (Albatros-Rot Quadrat mit "A") + "Albatros Intranet" (Plus Jakarta Sans 700)
- Nav-Items mit Lucide-Icon (20px, strokeWidth 1.5) + Label: Home / News / Dokumente / Neue Produkte / Team / Admin (nur wenn admin)
- Unten: Bell-Icon mit Notification-Badge + Avatar + Name + Abteilung

Mobile (< 768px): Sidebar als Drawer, Hamburger oben links in fixierter Top-Bar

Page Transitions: Motion AnimatePresence + motion.div mit initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}

### Home (/)

Oben — Begrüßungsbereich (volle Breite, rein typographisch, kein Bild/Banner):
- Links: dynamische Tageszeit-Begrüßung ("Guten Morgen/Tag/Abend, {Vorname}"), Plus Jakarta Sans 800 40px, tracking -0.03em. Darunter Wochentag + Datum ausgeschrieben, Geist 400, text-sub.
- Rechts: 3 Stat-Karten (aktive Mitarbeiter / Produkte / offene Ideen) — große Zahl (Plus Jakarta Sans 800 32px) + Label (12px uppercase) darunter, keine Icons/Bilder.
- Motion: Begrüßung fade+translateY(12px→0) 150ms; Stat-Karten gestaffelt 60ms Delay je Karte.

Darunter — 2-Spalten-Grid: 65% links / 35% rechts. Gap: 32px.

Linke Spalte — Feed:

Gepinnter Post (falls vorhanden):
- shadcn Card mit border-l-4 border-l-[#DC2626] bg-[#FEF2F2]
- Badge "Angepinnt" (Pin-Icon statt Emoji) in Rot
- Titel, kurzer Body-Auszug, Autor

Feed darunter — News-Posts UND neue Produkte gemischt, sortiert nach created_at DESC:
- Scope (Posts): general + eigene Abteilung
- Supabase Realtime Subscription für Live-Updates (Posts)
- Skeleton-Loader beim initialen Load (3 Karten)
- Gestaffelte Eintritts-Animation, 40ms Delay je Karte

Post-Karte (PostCard, size="feature" auf Home — größer als auf /news):
- Header: Avatar (32px) + Name (Geist 500 14px) + DepartmentBadge + relativer Timestamp
- Titel: Plus Jakarta Sans 700 20px (17px auf /news)
- Body: Geist 400 15px, voller Text
- Bild (falls vorhanden): volle Kartenbreite, max-height 380px (320px auf /news), object-cover
- Kein Bild: gedämpfter Abteilungsfarb-Streifen (opacity 0.06) statt leerem Bereich
- Anhang (falls vorhanden): Datei-Icon + Name + "Herunterladen"-Button
- Footer: Reaktions-Buttons (👍 🎉 👀 + Zähler, funktionale Emoji) + Kommentar-Icon mit Anzahl-Badge (klappt Kommentarbereich auf/zu)
- Kommentarbereich (aufklappbar): chronologisch älteste oben, Avatar 32px + Name + Timestamp + Text, Löschen für eigene Kommentare + Admin, Textarea + "Kommentieren"-Button, Supabase Realtime
- Admin: Pin-Icon + Trash-Icon (ghost buttons, rechts)
- Card-Padding 24px, Hover: translateY(-2px) + border-color var(--border-strong), 150ms (stärker als der Standard-Karten-Hover von -1px)

Produkt-Feed-Karte (ProductFeedCard) — visuell klar von News-Posts unterscheidbar:
- Rotes Label "Neues Produkt" oben
- BrandBadge + Produktname (Plus Jakarta Sans 700 19px)
- Kurzbeschreibung 2 Zeilen (line-clamp-2) falls vorhanden
- Hauptbild volle Breite, max-height 280px, object-cover, falls vorhanden
- Footer: "Von {Name} · {Datum}" + "Zum Produkt →" Link

Rechte Spalte:

Team-Widget (shadcn Card): Titel-Label "TEAM" (Geist 500 12px uppercase tracking-[0.08em] text-muted)
- Geburtstags-Erinnerung (nächste 7 Tage, Tag+Monat verglichen, Jahr ignoriert): Avatar (40px) + 🎂 Name. Heute: rot hervorgehoben, eigener Hintergrund (bg-primary-light). In 1–7 Tagen: "Geburtstag in X Tagen". Sortiert nach Nähe. Abschnitt komplett ausgeblendet wenn niemand in den nächsten 7 Tagen Geburtstag hat.
- Separator
- Neue Kollegen (letzte 30 Tage): Avatar (40px) + Name + DepartmentBadge + "Neu"
- Falls beides leer: Card nicht rendern

Umfragen-Widget (shadcn Card): Nur rendern wenn aktive Poll vorhanden (nicht abgelaufen, Scope passend).
- Fragetext (Plus Jakarta Sans 700 16px)
- Antwortoptionen: shadcn Button variant="outline" volle Breite
- Nach Abstimmung: Fortschrittsbalken je Option. Eigene Stimme: Balken in Rot, andere in Grau. Prozentzahl rechts daneben
- "Endet in X Tagen" (Caption) + "Details"-Link zur Umfrage-Detailseite
- unique(poll_id, user_id) verhindert Doppelabstimmung

### News (/news)

shadcn Tabs oben: Allgemein | Vertrieb | Einkauf | Kundenservice | Geschäftsführung. Aktiver Tab: unterstrichen Rot, Text Rot

"+ Beitrag erstellen" Button: Nur anzeigen wenn activeTab === 'general' ODER activeTab === eigene Abteilung

Post erstellen — shadcn Dialog:
- shadcn Input: Titel (required)
- shadcn Textarea: Text (5 Zeilen, required)
- Bild-Upload: Drag & Drop Zone + File-Picker → Upload zu news-images/{uuid}, max 5MB, jpg/png/webp → Vorschau nach Upload, entfernbar
- Scope: automatisch = aktiver Tab (nicht anzeigen)
- shadcn Button "Veröffentlichen" / "Abbrechen"

Feed identisch wie auf Home-Seite, voller Text.

Admin-Aktionen:
- Pin togglen: UPDATE news_posts SET pinned = !pinned
- Löschen: shadcn AlertDialog zur Bestätigung

### Dokumente (/documents)

2-Spalten-Layout: 200px Sidebar links + Hauptbereich.

Sidebar-Filter: "Alle" + 7 Kategorien. Aktiv: bg-[#FEF2F2] text-[#DC2626] border-l-2 border-[#DC2626]

Header im Hauptbereich:
- shadcn Input (Suche, Lucide Search-Icon links)
- shadcn Button "+ Dokument hochladen"

Upload — shadcn Dialog:
- Drag & Drop Zone (gestrichelte Border, hover: Rot)
- Erlaubte Typen: PDF, XLSX, DOCX, PPTX, PNG, JPG, ZIP (max 50 MB)
- shadcn Select: Kategorie (required)
- shadcn Input: Beschreibung (optional)
- Upload zu documents/{uuid_filename}, URL + Metadaten in DB

Dateiliste (Tabellen-Layout): Icon | Name + Beschreibung | Kategorie | Uploader | Datum | Download | Löschen

Datei-Icons (Lucide, 20px):
- PDF: FileText (Rot #DC2626)
- XLSX: Table (Grün #16A34A)
- DOCX: FileText (Blau #2563EB)
- PPTX: Presentation (Orange #D97706)
- Bild: Image (Lila #7C3AED)
- ZIP/Rest: Archive (Grau)

Download: window.open(file_url, '_blank'). Löschen: nur Uploader + Admin, shadcn AlertDialog

Clientseitige Suche über name + description.

### Neue Produkte (/products)

Header: Titel + Filter-Chips (shadcn Badge, klickbar): Alle | Arensberger | Sommertal | Albatros | Ravino | Burggraf | Stahlmann. Aktiver Chip: filled, Markenfarbe. "+ Produkt anlegen" (rechts, nur Vertrieb/GF/Admin)

Grid: 3 Spalten Desktop / 2 Tablet / 1 Mobile, gap 20px

Produktkarte (shadcn Card):
- Bild: aspect-ratio 4/3, object-cover, rounded-t-xl. Kein Bild: Grauer Placeholder mit Lucide Package-Icon (zentriert, groß)
- Unten: BrandBadge + Produktname (Plus Jakarta Sans 700 15px) + "Eingestellt am X" (Caption) + Mini-Avatar + Name
- Hover: border-color: var(--border-strong), Cursor pointer
- Klick → /products/:id

### Produkt anlegen (/products/new)

Eigene Seite (kein Modal). Breadcrumb: Neue Produkte > Produkt anlegen

shadcn Card (max-width 720px, zentriert):
- shadcn Input: Produktname (required)
- shadcn Select: Marke (required)
- shadcn Textarea: Kurzbeschreibung (3 Zeilen)
- shadcn Textarea: Technische Daten (10 Zeilen). Hinweis darunter: "Markdown wird unterstützt (Tabellen, Listen, Fettschrift)"
- Bild-Upload: Grid 3x2 für bis zu 6 Bilder. Erste Zelle = Hauptbild (Badge "Hauptbild"). Hochgeladen: Vorschau + rotes X zum Entfernen. Upload zu product-images/{product_id}/{uuid}
- Buttons: "Produkt speichern" (Primary) + "Abbrechen" (Secondary, → /products)

### Produkt-Detailseite (/products/:id)

Breadcrumb: Neue Produkte > {Produktname}. Edit-Button rechts (nur Ersteller + Admin)

2-Spalten-Layout (50/50):

Links — Bildergalerie:
- Hauptbild: 100% Breite, aspect-ratio 1/1, object-contain, bg: var(--surface), Border, rounded-xl
- Thumbnails darunter: 60px × 60px, object-cover, rounded-lg. Aktives Thumbnail: roter Border ring-2 ring-[#DC2626]. Klick → wechselt Hauptbild (Motion AnimatePresence)

Rechts:
- BrandBadge + H1 (Produktname, Plus Jakarta Sans 800 26px)
- Kurzbeschreibung (Geist 400 15px)
- Separator
- Label "TECHNISCHE DATEN" (uppercase, tracking-wide, muted)
- react-markdown gerendered Specs: Tabellen mit border, code in JetBrains Mono
- Unten: Avatar + "Eingestellt von Name · Datum" (Caption)

F&A-Thread (volle Breite darunter):
- Separator + Titel "Fragen zum Produkt" + Badge mit Anzahl
- Neue Frage: shadcn Textarea (3 Zeilen) + shadcn Button "Frage stellen" (rechts). Supabase Realtime
- Fragen-Liste (neueste oben), Karte mit leichtem Hintergrund var(--surface):
  - Avatar (40px) + Name + DepartmentBadge + Timestamp
  - Fragetext (15px)
  - "Antworten"-Button → klappt Antwortfeld auf
- Antworten (eingerückt pl-8, Border-Left 2px var(--border)):
  - Avatar (32px) + Name + Timestamp
  - Antworttext
  - Trash-Icon: Antwortgeber + Admin
- Antwort schreiben (eingeklappt): shadcn Textarea (2 Zeilen) + "Antworten"-Button
- Löschen (Frage): Fragensteller + Admin, AlertDialog

### Team (/team)

Header: "Team" + "(X Mitglieder)" Badge

Grid: 4 / 3 / 2 / 1 Spalten (responsive)

Mitarbeiterkarte (shadcn Card, hover: border-strong):
- Avatar (64px, zentriert oben)
- Name (Plus Jakarta Sans 700 16px, zentriert)
- DepartmentBadge (zentriert)
- Admin-Badge wenn role === 'admin': kleines rotes Badge "Admin"
- Email: Lucide Mail Icon + klickbarer Link
- Telefon: Lucide Phone Icon + Link (falls vorhanden)
- Bio: Italic, max 2 Zeilen, line-clamp-2 (falls vorhanden)

Nur status === 'active' User.

### Admin-Panel (/admin)

Nur für role === 'admin'. Sonst Redirect zu /.

Sidebar-Badge: roter Zähler = pending User.

shadcn Tabs (4 Tabs):

Tab 1: Ausstehende Anfragen. Falls leer: Empty State (Lucide CheckCircle groß + "Keine ausstehenden Anfragen")
- shadcn Table: Name | E-Mail | Abteilung | Registriert am | Aktionen
- Aktionen: "Freischalten" (Success-Grün, outline) + "Ablehnen" (Destructive, outline). shadcn Toast nach Aktion.

Tab 2: Alle Mitarbeiter
- shadcn Table: Avatar + Name | E-Mail | Abteilung | Rolle | Status | Aktionen
- Status: grünes Badge "Aktiv" / gelbes Badge "Pending" / rotes Badge "Abgelehnt"
- Aktionen: Rolle ändern (Select), Sperren/Entsperren, Löschen (AlertDialog). Admin kann sich nicht selbst löschen.

Tab 3: Umfragen
- Liste: Frage | Zielgruppe | Erstellt von | Läuft bis | Stimmen | Löschen
- "+ Neue Umfrage" → Dialog: Frage, 2–4 Antwortoptionen (dynamisch), Zielgruppe (Select), Ablaufdatum (optional)

Tab 4: Beitrags-Moderation
- shadcn Table: Titel | Autor | Channel | Datum | Löschen

### Profil (/profile)

shadcn Card (max-width 560px, zentriert):

Avatar-Upload:
- Großer Avatar (80px) mit Hover-Overlay "Foto ändern"
- Klick → File-Picker → Upload zu avatars/{user_id} → URL updaten

Formular:
- shadcn Input: Vorname / Nachname
- Abteilung: reines Text-Label (nicht editierbar, mit Lucide Lock-Icon)
- shadcn Input: Telefon (optional, type="tel")
- shadcn Textarea: Bio (max 120 Zeichen, Zähler: "X / 120")
- shadcn Input: Geburtstag (type="date", optional). Hinweis: "Nur Tag und Monat werden im Team-Widget angezeigt"
- shadcn Button "Speichern" → UPDATE profiles

Passwort ändern:
- shadcn Input type="password": Neues Passwort
- shadcn Input type="password": Bestätigung
- shadcn Button "Passwort ändern" → supabase.auth.updateUser({ password: newPassword }). Validierung: min 8 Zeichen, beide Felder identisch

## Notifications

Glocken-Icon (Lucide Bell 20px) im Sidebar-Footer. Rotes Badge mit ungelesener Anzahl (max "9+").

shadcn Dropdown-Menu beim Klick:
- Header: "Benachrichtigungen" + "Alle lesen"-Link
- Liste der letzten 10 Notifications (scrollbar, max-height 360px)
- Je Eintrag: farbiges Icon je Type + Nachricht + relativer Timestamp. Ungelesen: leicht grauer Hintergrund. Klick: als gelesen markieren

Notification-Typen:
- new_product — Lucide Package + "Neues Produkt: {name}"
- new_post — Lucide FileText + "Neuer Beitrag in {Abteilung}: {Titel}"
- account_activated — Lucide CheckCircle + "Dein Account wurde freigeschaltet"
- new_answer — Lucide MessageCircle + "Deine Frage zu {Produkt} wurde beantwortet"

Notifications schreiben (clientseitig beim Erstellen):
- Neues Produkt → Notification für alle aktiven User
- Neuer Post in Abteilung → Notification für User dieser Abteilung
- Neue Antwort → Notification für Fragensteller

## Technische Pflichten

Supabase Client in src/lib/supabase.js:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

AuthContext (src/context/AuthContext.jsx): user, profile, loading, refreshProfile() — überall via useAuth() Hook.

Upload-Utility (src/lib/upload.js): Zentrale uploadFile(bucket, file, path) Funktion → gibt Public URL zurück.

Realtime: News-Feed und F&A-Thread per Supabase Realtime Subscription.

Datum: Alle Timestamps in de-DE Locale. Relative Timestamps (vor 2 Stunden, gestern) für Posts < 7 Tage. Absolutes Datum für älteres.

Mobile: Alle Grids responsive. Sidebar als Drawer < 768px.

Font-Loading in index.html:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Geist:wght@400;500&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

Fehlerbehandlung: Alle Supabase-Calls in try/catch. shadcn Toast für Erfolg und Fehler. Alle Texte Deutsch.

Skeleton-Loader: Für Feed, Produktliste, Team-Grid.

Empty States: Für jede Liste — Lucide-Icon (groß, text-gray-200) + Text + optionaler CTA.

## Datei-Struktur

```
src/
  components/
    ui/            ← shadcn generiert diese automatisch
    shared/
      InitialsAvatar.jsx
      BrandBadge.jsx
      DepartmentBadge.jsx
      SkeletonCard.jsx
      EmptyState.jsx
      RelativeTime.jsx
    layout/
      Sidebar.jsx
      Layout.jsx
      ProtectedRoute.jsx
      AdminRoute.jsx
  pages/
    Home.jsx
    Login.jsx
    Register.jsx
    News.jsx
    Documents.jsx
    Products.jsx
    ProductDetail.jsx
    ProductNew.jsx
    Team.jsx
    Admin.jsx
    Profile.jsx
  context/
    AuthContext.jsx
  lib/
    supabase.js
    upload.js
    dateUtils.js
  hooks/
    useAuth.js
    useNotifications.js
supabase/
  schema.sql
CLAUDE.md
DESIGN.md
```
