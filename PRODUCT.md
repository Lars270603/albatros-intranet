# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Festangestellte Mitarbeiter der Albatros International GmbH, alle vier Abteilungen (Vertrieb,
Einkauf, Kundenservice, Geschäftsführung). Kein externer Zugriff, keine Werkstudenten/Praktikanten
als gesonderte Zielgruppe. Rollen: `admin` | `member`. Account-Status-Workflow: `pending` →
`active` → optional `rejected` (Admin schaltet neue Registrierungen manuell frei).

## Product Purpose

Internes Intranet als zentraler Ort für Unternehmenskommunikation und -organisation: Neuigkeiten
je Abteilung, Dokumentenarchiv, Produktkatalog (neue Marken-Produkte), Team-Verzeichnis,
Onboarding-Material, Ideen-Board mit Voting und Umfragen. Erfolg heißt: Mitarbeiter nutzen es
täglich als verlässliche Quelle statt E-Mail/Zuruf, und es wirkt so hochwertig wie ein
professionelles SaaS-Produkt.

## Positioning

Kein Konkurrenzvergleich nötig (internes Tool ohne externen Markt). Abgrenzung ist intern: ersetzt
verstreute Kommunikation (E-Mail-Verteiler, Zuruf, lose Dateien) durch einen einzigen,
rollenbasierten Ort mit Realtime-Updates (News-Feed, F&A-Threads) und klaren
Abteilungs-/Rollen-Berechtigungen.

## Operating Context

- Primär Desktop-Nutzung während der Arbeitszeit (bestätigt: kein Mobile-First-Anlass, Mobile
  bleibt funktional/responsiv, aber nicht der Polish-Schwerpunkt).
- Anlass des aktuellen Redesigns: interner Qualitätsanspruch, kein externer Showcase (kein
  Kunden-/Investoren-/Bewerbungskontext) — Polish-Investment darf sich auf Desktop konzentrieren.
- Deploy: GitHub Pages (statisches Hosting) via GitHub Actions, HashRouter zwingend (`base:
  /albatros-intranet/`).
- Backend: Supabase (Auth, Postgres, Storage, Realtime). Alle Datenzugriffe clientseitig via
  `@supabase/supabase-js`, RLS-gesichert.
- Sprache: ausschließlich Deutsch (UI-Texte, Fehlermeldungen, Kommentare im Code).

## Capabilities and Constraints

- Bestehende Funktionalität, Datenmodell, Routen und Supabase-Schema bleiben unverändert — dieses
  Redesign ist rein visuell (Refinement/Redesign der Optik, keine Feature-Änderung).
- Berechtigungen: Produkte anlegen (`vertrieb`/`geschaeftsfuehrung`/`admin`), Admin-Panel (`admin`
  only), alles andere für alle aktiven Nutzer.
- Tech-Stack fest vorgegeben (siehe DESIGN.md „Projekt-Setup"): React 18 + Vite, Tailwind CSS v3,
  shadcn/ui, React Router v6 (HashRouter), Supabase JS v2, Lucide React, Motion.
- Undecided: ob das Farbsystem von Hex auf OKLCH migriert wird, ist eine visuelle
  Design-System-Entscheidung — gehört in New-Work/DESIGN.md, nicht in dieses Dokument.

## Brand Commitments

- Name: „Albatros Intranet", Unternehmen: Albatros International GmbH.
- Bestätigt: CLAUDE.md + DESIGN.md sind die alleinige und vollständige Marken-Autorität — kein
  externes Corporate-Design-Dokument existiert, das zusätzlich zu beachten wäre.
- Bestehendes Logo (`src/assets/albatros-logo.png`), Akzentfarbe „Albatros Rot" bereits etabliert.
- Marken im Produktkatalog (mit festen Badge-Farben in DESIGN.md): Arensberger, Sommertal,
  Albatros, Ravino, Burggraf, Stahlmann.

## Evidence on Hand

- Reales Firmenlogo liegt im Repo vor (`src/assets/albatros-logo.png`), keine Platzhalter-Logos
  verwenden.
- Für Produktbilder ohne echtes Foto: `picsum.photos`-Platzhalter bereits als Konvention in
  DESIGN.md festgelegt — künftige echte Fotos ersetzen diese, keine erfundenen Produktfotos oder
  Testimonials fabrizieren.

## Product Principles

1. Funktionalität und Inhalte sind unantastbar — jede Redesign-Entscheidung dient ausschließlich
   der visuellen Qualität, niemals einer Verhaltensänderung.
2. Hierarchie entsteht aus Typographie und Spacing, nicht aus Boxen/Schatten (bestehendes Prinzip
   aus CLAUDE.md/DESIGN.md, wird im Redesign verschärft, nicht aufgeweicht).
3. Ein Werkzeug für den Arbeitsalltag: Klarheit und Schnelligkeit schlagen Dekoration — Polish
   zeigt sich in Präzision (Spacing, Typografie, Zustände), nicht in Spektakel.
4. Deutsch durchgängig, Empty States und Loading States nie als Rückschritt fühlen lassen, sondern
   als bewusst gestalteter Teil des Produkts.
5. Rot bleibt die einzige Akzentfarbe — Zurückhaltung ist Teil der Markenidentität, nicht ihr
   Gegenteil.

## Accessibility & Inclusion

Kein gesondertes, über Standard-Webzugänglichkeit hinausgehendes Nutzerbedürfnis bekannt. WCAG AA
Kontrast (mind. 4.5:1) für Text und Badges gilt als Mindeststandard, wie in den neuen
Design-Direktiven für Badges explizit gefordert.
