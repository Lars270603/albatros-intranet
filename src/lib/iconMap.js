import {
  Rocket,
  Clock,
  ShoppingBag,
  Utensils,
  Palmtree,
  KeyRound,
  ShieldCheck,
  BookOpen,
  FileText,
  LogIn,
  Smartphone,
  BookOpenCheck,
  Info,
  HelpCircle,
  Users,
  Settings,
  Compass,
  Coffee,
  Car,
  Wifi,
  Lock,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react'

// Kuratierte Auswahl für Icon-Picker in Admin-Dialogen (Leitfaden-Kategorien/Artikel/Info-Kacheln).
// Gezielte Imports statt "import * as Icons" — verhindert, dass die komplette Lucide-Bibliothek
// ins Bundle gezogen wird (nur für dynamisches Icon-Lookup aus DB-Strings nötig).
const ICONS = {
  Rocket,
  Clock,
  ShoppingBag,
  Utensils,
  Palmtree,
  KeyRound,
  ShieldCheck,
  BookOpen,
  FileText,
  LogIn,
  Smartphone,
  BookOpenCheck,
  Info,
  HelpCircle,
  Users,
  Settings,
  Compass,
  Coffee,
  Car,
  Wifi,
  Lock,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  Mail,
}

export const ICON_OPTIONS = Object.keys(ICONS)

// Löst einen gespeicherten Icon-Namen (String) auf ein Lucide-Icon auf.
// Fällt auf FileText zurück, falls der Name unbekannt/ungültig ist (z.B. Tippfehler in der DB).
export function resolveIcon(name) {
  return ICONS[name] || FileText
}
