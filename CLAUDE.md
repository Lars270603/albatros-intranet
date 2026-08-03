# Albatros Intranet — Project Rules

## Project
Internal intranet for Albatros International GmbH.
React 18 + Vite + Tailwind CSS + shadcn/ui + Supabase.
Deploy: GitHub Pages (HashRouter, base: /albatros-intranet/).

## Frontend Aesthetics — PFLICHTREGELN

VERBOTENE FONTS (niemals verwenden):
Inter, Roboto, Open Sans, Lato, Arial, system-ui, sans-serif als Default.

ERLAUBTE FONTS:
- Headlines/Display: Plus Jakarta Sans (weight 700, 800)
- Body/UI: Geist (weight 400, 500)
- Code/Specs: JetBrains Mono (weight 400)
Alle via Google Fonts laden.

VERBOTENE PATTERNS (niemals bauen):
- Lila oder blau-lila Gradient irgendwo
- Drei gleichgroße Karten nebeneinander als Hero-Layout
- Box-Shadows als primäres Tiefenelement (stattdessen: Border)
- Gradient auf Buttons
- Glassmorphism
- Generic Tailwind-Starter-Template-Look
- Centered text block as hero
- Rounded pill buttons als primary CTA
- Spinner-Loader (immer Skeleton statt Spinner)
- Emojis als UI-Elemente (Ausnahme: funktionale Reaktions-Emojis im Datenmodell)
- Animationen länger als 200ms

KARTEN-HOVER (der einzige Tiefeneffekt):
`border-color: var(--border-strong) + transform: translateY(-1px)`, `transition: all 150ms ease`.

FARB-DISZIPLIN:
Eine dominante Akzentfarbe: #DC2626 (Albatros Rot).
Sonst: Weiß + ein Grau. Keine zweite Akzentfarbe.
Alle Farben als CSS-Variablen in index.css definieren.

SPACING:
Strikt 8px-Grid. Niemals willkürliche px-Werte.

KOMPONENTEN:
Immer shadcn/ui als Basis verwenden.
Kein eigenes Button/Input/Modal von Grund auf bauen wenn shadcn es hat.

NACH JEDER UI-ÄNDERUNG:
Screenshot machen und prüfen ob es noch nach AI-Slop aussieht.
Wenn ja: überarbeiten bis es distintiv und professionell wirkt.

## Code Rules
- Alle Texte auf Deutsch
- Fehlermeldungen auf Deutsch
- Kommentare auf Deutsch
- Supabase-Calls immer in try/catch
- Loading States für alle Datenabrufe
- Empty States für alle Listen/Feeds
