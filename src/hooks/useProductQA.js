import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { notifyUser } from '@/lib/notifications'

export function useProductQA(productId, productName) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('product_questions')
        .select('*, asker:profiles(*), product_answers(*, answerer:profiles(*))')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error

      const sorted = (data || []).map((q) => ({
        ...q,
        product_answers: [...(q.product_answers || [])].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ),
      }))
      setQuestions(sorted)
    } catch (err) {
      console.error('Fragen konnten nicht geladen werden:', err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const channel = supabase
      .channel(`product-qa-${productId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_questions', filter: `product_id=eq.${productId}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_answers' }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, load])

  const askQuestion = useCallback(
    async (body) => {
      const { error } = await supabase
        .from('product_questions')
        .insert({ product_id: productId, body, asked_by: user.id })
      if (error) throw error
      await load()
    },
    [productId, user, load]
  )

  const answerQuestion = useCallback(
    async (question, body) => {
      const { error } = await supabase
        .from('product_answers')
        .insert({ question_id: question.id, body, answered_by: user.id })
      if (error) throw error

      if (question.asked_by !== user.id) {
        await notifyUser(
          question.asked_by,
          'new_answer',
          `Deine Frage zu ${productName} wurde beantwortet`,
          productId
        )
      }
      await load()
    },
    [user, productName, productId, load]
  )

  const deleteQuestion = useCallback(async (id) => {
    const { error } = await supabase.from('product_questions').delete().eq('id', id)
    if (error) throw error
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const deleteAnswer = useCallback(async (id) => {
    const { error } = await supabase.from('product_answers').delete().eq('id', id)
    if (error) throw error
    setQuestions((prev) =>
      prev.map((q) => ({ ...q, product_answers: q.product_answers.filter((a) => a.id !== id) }))
    )
  }, [])

  return { questions, loading, askQuestion, answerQuestion, deleteQuestion, deleteAnswer }
}
