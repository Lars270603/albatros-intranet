import { supabase } from '@/lib/supabase'

/**
 * Lädt eine Datei in einen Supabase-Storage-Bucket hoch und gibt die öffentliche URL zurück.
 * @param {string} bucket - Name des Storage-Buckets
 * @param {File} file - Die hochzuladende Datei
 * @param {string} path - Zielpfad innerhalb des Buckets (z.B. "{uuid}-{filename}")
 * @returns {Promise<string>} Öffentliche URL der hochgeladenen Datei
 */
export async function uploadFile(bucket, file, path) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}
