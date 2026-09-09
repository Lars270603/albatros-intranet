# Albatros Intranet — Design System

> **v3 (Redesign)** — vollständige visuelle Neugestaltung, Funktionalität unverändert. Dieses
> Dokument beschreibt den tatsächlich gebauten Stand (dokumentiert aus dem fertigen Code, nicht
> vorab entworfen).

## Referenz-Ästhetik

Linear.app als Qualitätsmaßstab (nicht kopiert, sondern übersetzt): präzise, technisch, ruhig.
Hierarchie entsteht aus Typografie, Spacing und Radius-Abstufung — nicht aus Schatten oder
Farbflächen. Eine dominante Akzentfarbe (Rot), sonst konsequent neutral. Internes Werkzeug für den
Arbeitsalltag: Klarheit schlägt Dekoration.

## Farben — OKLCH

```css
:root {
  --bg:            oklch(100% 0 0);
  --surface:       oklch(98% 0.002 264);
  --surface-2:     oklch(96% 0.003 264);
  --border:        oklch(90% 0.004 264);
  --border-strong: oklch(84% 0.006 264);
  --text:          oklch(15% 0.01 264);
  --text-sub:      oklch(45% 0.01 264);
  --text-muted:    oklch(65% 0.008 264);

  --accent:        oklch(50% 0.22 27);
  --accent-hover:  oklch(44% 0.22 27);
  --accent-light:  oklch(96% 0.04 27);

  --success:       oklch(52% 0.18 145);
  --success-light: oklch(96% 0.04 145);
  --warning:       oklch(68% 0.18 65);
  --warning-light: oklch(96% 0.045 65);

  /* Kategorische Datenfarben (Dateitypen) — keine UI-Akzente */
  --info:          oklch(55% 0.18 258);
  --violet:        oklch(55% 0.18 300);
}
```

Eine Akzentfarbe (Rot) für alle interaktiven/CTA-Zustände. `--info`/`--violet` sind reine
Datenkategorie-Farben (Dateityp-Icons), keine zweite Marken-Akzentfarbe. Marken- und
Abteilungs-Badges tragen eigene feste Farbpaare als CSS-Variablen (`--brand-*-bg/-fg`,
`--dept-*-bg/-fg`, in `src/index.css`) — Content-Kategorisierung, kein UI-Chrome.

## Typografie

Font-Import (index.html): Plus Jakarta Sans (400/500/700/800), Geist (400/500), JetBrains Mono.

- **Headlines** (Begrüßung, große Display-Texte): Plus Jakarta Sans 800, tracking `-0.04em`
- **Sub-Headlines** (H2/H3, Card-Titel, Seitentitel): Plus Jakarta Sans 700, tracking `-0.02em`
- **UI-Labels/Navigation**: Geist 500, tracking `0`
- **Body**: Geist 400, line-height 1.65
- **Micro-Labels**: Klasse `.label-micro` — Geist 500, 11px, tracking `0.06em`, uppercase
- **Code/Specs**: JetBrains Mono 400

Skala (große Sprünge, keine Zwischenstufen): Seitentitel 32px · Card-Titel 18px · Body 14px ·
Caption 12px · Micro-Label 11px. Content-Display-Texte (Home-Begrüßung ~36–40px,
Produkt-Detail-H1 ~26px) sind bewusste, benannte Ausnahmen über der Skala.

## Karten

```css
border: 1px solid var(--border);
border-radius: 10px;
background: var(--bg);
transition: border-color 150ms ease, transform 150ms ease;
```

Hover: `border-color: var(--border-strong)` + `translateY(-1px)`. Das ist der einzige Tiefeneffekt
— kein box-shadow, kein scale, kein glow.

## Buttons

Primary: `background: var(--accent)`, `color: white`, `border-radius: 7px`,
`padding: 7px 14px`, `font: 500 13px Geist`, tracking `0.01em`. Hover: `var(--accent-hover)`.
Secondary/Outline: `background: var(--bg)`, `border: 1px solid var(--border)`. Hover: Border wird
`var(--border-strong)` (kein Hintergrundwechsel). Ghost: transparent, `color: var(--text-sub)`.
Kein Gradient, kein Shadow, keine Pill-Form als Primary-CTA.

## Inputs

`border: 1px solid var(--border)`, `border-radius: 7px`, `padding: 8px 11px`,
`font: 400 14px Geist`. Focus: `border-color: var(--accent)` +
`box-shadow: 0 0 0 3px var(--accent-light)`.

## Badges/Tags

Eckig, kein Pill-Shape: `border-radius: 4px`, `padding: 2px 6px`, `font-size: 11px`,
`font-weight: 500`. Hintergründe gedämpft, Vordergrundfarbe hält mind. 4.5:1 Kontrast.

## Navigation — Linke Sidebar

Breite 220px, `background: var(--surface)`. Logo-Bereich 48px Höhe, kompakt. Nav-Item Höhe 36px,
Icon 18px (strokeWidth 1.5). Aktiv: **kein** Hintergrundfarbblock — nur `border-left: 2px solid
var(--accent)` + `font-weight: 700`, Label-Farbe bleibt `var(--text)` (nicht rot; Rot lebt
ausschließlich im Balken). Inaktiv: `color: var(--text-muted)`, kein Hintergrund. Hover: nur
`color: var(--text)`, keine Hintergrundfarbe. User-Bereich unten: Avatar 28px + „Name · Abteilung"
in einer Zeile, kompakt, `border-top: 1px solid var(--border)`.

## Spacing

Striktes 4px-Grid. Page-Padding 40px · Card-Padding 20px innen · Gap zwischen Karten 16px ·
Section-Trennung 48px.

## Tabellen (Admin, Dokumente)

Zeilenhöhe ~48px, Hover `background: var(--surface)`, Trennung nur `border-bottom: 1px solid
var(--surface-2)` (kein Border pro Zelle). Tabellenkopf: label-micro-artige Beschriftung +
`border-bottom: 1px solid var(--border)`.

## Empty States

Linksbündige Karte (`bg-surface`, `border border-border`, radius 10px): kleines Icon in
neutralem 36px-Quadrat, Überschrift, kurzer Satz, optionaler CTA-Button. Kein zentriertes
Riesen-Icon, fühlt sich wie Content an, nicht wie eine Fehlermeldung.

## Skeleton Loader

Nur `background: var(--surface-2)`-Rechtecke mit `animation: pulse 1.5s ease-in-out infinite`.
Kein Spinner, nirgends.

## Animationen — genau zwei, sonst keine

1. **Page-Transition** (`Layout.jsx`): `opacity 0→1` + `translateY(8px→0)`, 110ms ease-out.
2. **Karten-/Listen-Eintritt beim Laden**: gestaffelt, ~35ms Delay je Element, `opacity 0→1` +
   `translateY(6px→0)`, 100ms. Umgesetzt via `motion/react`.

Nichts anderes, nichts über 150ms. `prefers-reduced-motion` wird global respektiert
(`src/index.css`).

## Icons

Lucide, `strokeWidth: 1.5` überall. 18px in der Navigation, 16px in Karten/Tabellen, 20px als
Stand-alone-Element.

## Layout-Fingerprints je Seite

- **Home**: asymmetrisch — Begrüßung volle Breite (typografisch, kein Bild), 3 kartenlose
  Stat-Kennzahlen mit dünnen Trennlinien, darunter 65/35-Grid (Feed links, Widgets rechts).
- **News**: einspaltiger Feed, max. Lesebreite 720px, Tabs oben (Rot = aktiv, keine Pills).
- **Neue Produkte**: Masonry-artiges Grid (CSS `columns`, `break-inside-avoid`), keine
  gleichförmigen 3 Spalten. Eckige Marken-Filter-Chips.
- **Archiv (Dokumente)**: 200px Kategorie-Sidebar + Tabellen-Dateiliste (kein Karten-Grid).
- **Team**: umschaltbar Grid ↔ kompakte Listenansicht.
- **Admin**: 4 Tabs, durchgängig echte Tabellen statt Karten.
- **Login/Register**: Split-Screen (Markenfläche links, Formular rechts) — kein zentrierter
  Formular-Block.

## Anti-Patterns (explizit verboten und durchgesetzt)

Gradient irgendwo · box-shadow auf Karten · zweite Akzentfarbe · Inter/Roboto/System-UI ·
gleichförmiges 3-Karten-Grid als Seiten-Einstieg · zentrierter Text-Block als Hero ·
Pill-Buttons als Primary-CTA · Glassmorphism · Animationen >150ms · Emojis als UI-Labels
(funktionale Reaktions-Emojis 👍🎉👀 im Datenmodell ausgenommen) · Inline-Hex-Farben im Code ·
dicker farbiger `border-left`/`border-right` (>1px) auf Content-Karten — Ausnahme: der 2px
Sidebar-Aktiv-Indikator auf Nav-Zeilen (bewusste, benannte Ausnahme, kein Card-Pattern).

## Projekt-Setup

Repo: github.com/Lars270603/albatros-intranet · Deploy: GitHub Pages via GitHub Actions ·
Base URL: `/albatros-intranet/`.

Tech-Stack: React 18 + Vite · Tailwind CSS v3 · shadcn/ui · React Router v6 (HashRouter) ·
Supabase JS v2 · Lucide React · Motion (`motion/react`).

## Datei-Struktur (Design-relevant)

```
src/
  index.css                        ← OKLCH-Tokens, Typografie-Basis, Animations-Keyframes
  tailwind.config.js (Projekt-Root) ← Radius-/Farb-/Animation-Mapping auf CSS-Variablen
  components/
    ui/            ← shadcn-Primitive, alle auf das neue System umgestellt
    shared/        ← BrandBadge, DepartmentBadge, InitialsAvatar, EmptyState, SkeletonCard
    layout/        ← Sidebar, Layout (Page-Transition)
```

Funktionalität, Datenmodell, Supabase-Schema und Routing sind gegenüber dem Vorgänger-Stand
unverändert — dieses Dokument beschreibt ausschließlich die visuelle Schicht.
