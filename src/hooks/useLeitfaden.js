import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useLeitfaden() {
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [{ data: cats, error: catError }, { data: arts, error: artError }] = await Promise.all([
        supabase.from('leitfaden_categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('leitfaden_articles').select('*').order('sort_order', { ascending: true }),
      ])
      if (catError) throw catError
      if (artError) throw artError
      setCategories(cats || [])
      setArticles(arts || [])
    } catch (err) {
      console.error('Leitfaden konnte nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createCategory({ name, icon }) {
    const sortOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0
    const { error } = await supabase.from('leitfaden_categories').insert({ name, icon, sort_order: sortOrder })
    if (error) throw error
    await load()
  }

  async function updateCategory(id, { name, icon }) {
    const { error } = await supabase.from('leitfaden_categories').update({ name, icon }).eq('id', id)
    if (error) throw error
    await load()
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('leitfaden_categories').delete().eq('id', id)
    if (error) throw error
    await load()
  }

  async function moveCategory(id, direction) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    const index = sorted.findIndex((c) => c.id === id)
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= sorted.length) return
    const a = sorted[index]
    const b = sorted[swapIndex]
    const { error } = await supabase.from('leitfaden_categories').update({ sort_order: b.sort_order }).eq('id', a.id)
    if (error) throw error
    const { error: error2 } = await supabase.from('leitfaden_categories').update({ sort_order: a.sort_order }).eq('id', b.id)
    if (error2) throw error2
    await load()
  }

  async function createArticle(categoryId, payload, userId) {
    const inCategory = articles.filter((a) => a.category_id === categoryId)
    const sortOrder = inCategory.length > 0 ? Math.max(...inCategory.map((a) => a.sort_order)) + 1 : 0
    const { error } = await supabase.from('leitfaden_articles').insert({
      category_id: categoryId,
      ...payload,
      sort_order: sortOrder,
      created_by: userId,
    })
    if (error) throw error
    await load()
  }

  async function updateArticle(id, payload) {
    const { error } = await supabase
      .from('leitfaden_articles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  async function deleteArticle(id) {
    const { error } = await supabase.from('leitfaden_articles').delete().eq('id', id)
    if (error) throw error
    await load()
  }

  async function moveArticle(id, direction) {
    const article = articles.find((a) => a.id === id)
    if (!article) return
    const sorted = articles
      .filter((a) => a.category_id === article.category_id)
      .sort((a, b) => a.sort_order - b.sort_order)
    const index = sorted.findIndex((a) => a.id === id)
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= sorted.length) return
    const a = sorted[index]
    const b = sorted[swapIndex]
    const { error } = await supabase.from('leitfaden_articles').update({ sort_order: b.sort_order }).eq('id', a.id)
    if (error) throw error
    const { error: error2 } = await supabase.from('leitfaden_articles').update({ sort_order: a.sort_order }).eq('id', b.id)
    if (error2) throw error2
    await load()
  }

  return {
    categories,
    articles,
    loading,
    reload: load,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    createArticle,
    updateArticle,
    deleteArticle,
    moveArticle,
  }
}
