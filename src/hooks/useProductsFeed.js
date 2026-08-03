import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useProductsFeed() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, creator:profiles(*), product_images(*)')
          .order('created_at', { ascending: false })
        if (error) throw error
        const withSortedImages = (data || []).map((p) => ({
          ...p,
          product_images: [...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order),
        }))
        setProducts(withSortedImages)
      } catch (err) {
        console.error('Produkte konnten nicht geladen werden:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { products, loading }
}
