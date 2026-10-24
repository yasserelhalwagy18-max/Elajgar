import {
  Activity,
  Apple,
  BookOpen,
  Dumbbell,
  Droplet,
  HeartPulse,
  Leaf,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icons an admin can pick for an article or an exercise.
 *
 * The key is what gets stored in the database; the component is resolved in
 * the UI. Storing the key instead of the component reference is what makes
 * the content manageable from the admin panel - a component cannot be
 * serialized into a JSON column or selected from a `<select>`.
 */
export interface ContentIcon {
  icon: LucideIcon;
  /** Text colour of the icon. */
  color: string;
  /** Tinted background behind the icon. */
  bg: string;
}

export const CONTENT_ICONS: Record<string, ContentIcon> = {
  book: { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
  droplet: { icon: Droplet, color: 'text-primary', bg: 'bg-primary/10' },
  apple: { icon: Apple, color: 'text-error', bg: 'bg-error/10' },
  activity: { icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10' },
  'heart-pulse': { icon: HeartPulse, color: 'text-primary', bg: 'bg-primary/10' },
  dumbbell: { icon: Dumbbell, color: 'text-primary', bg: 'bg-primary/10' },
  sparkles: { icon: Sparkles, color: 'text-secondary', bg: 'bg-secondary/10' },
  leaf: { icon: Leaf, color: 'text-success', bg: 'bg-success/10' },
};

/** The icon keys, in the order they are offered in the admin panel. */
export const CONTENT_ICON_KEYS = Object.keys(CONTENT_ICONS);

/** The fallback used for an unknown or missing key. */
export const DEFAULT_CONTENT_ICON = CONTENT_ICONS.book!;

/**
 * Resolve an icon key to its component and colours.
 *
 * An unknown key falls back to the book icon instead of throwing: the value
 * comes from the database and a bad row must not take the whole education
 * section down.
 */
export function resolveContentIcon(key: string | null | undefined): ContentIcon {
  if (!key) return DEFAULT_CONTENT_ICON;
  return CONTENT_ICONS[key] ?? DEFAULT_CONTENT_ICON;
}
