import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useHomeStats() {
  const [stats, setStats] = useState({ activeEmployees: 0, products: 0, openIdeas: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [employees, products, ideas] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('status', 'offen'),
        ])
        if (employees.error) throw employees.error
        if (products.error) throw products.error
        if (ideas.error) throw ideas.error

        setStats({
          activeEmployees: employees.count || 0,
          products: products.count || 0,
          openIdeas: ideas.count || 0,
        })
      } catch (err) {
        console.error('Statistiken konnten nicht geladen werden:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, loading }
}
