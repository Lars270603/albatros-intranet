import { useState } from 'react'
import { MessageCircle, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { DepartmentBadge } from '@/components/shared/DepartmentBadge'
import { RelativeTime } from '@/components/shared/RelativeTime'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { useProductQA } from '@/hooks/useProductQA'
import { useToast } from '@/components/ui/use-toast'

function AnswerRow({ answer, canDelete, onDelete }) {
  return (
    <div className="border-l border-border pl-4">
      <div className="flex items-center gap-2">
        <InitialsAvatar
          firstName={answer.answerer?.first_name}
          lastName={answer.answerer?.last_name}
          avatarUrl={answer.answerer?.avatar_url}
          size={32}
        />
        <span className="text-[13px] font-medium text-text">
          {answer.answerer?.first_name} {answer.answerer?.last_name}
        </span>
        <RelativeTime date={answer.created_at} className="text-[12px] text-text-muted" />
        {canDelete && (
          <button onClick={() => onDelete(answer.id)} className="ml-auto text-text-muted hover:text-primary">
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
      <p className="mt-1 text-[14px] text-text">{answer.body}</p>
    </div>
  )
}

function QuestionCard({ question, productId, productName, onAnswer, onDeleteQuestion, onDeleteAnswer }) {
  const { profile } = useAuth()
  const [answering, setAnswering] = useState(false)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canDeleteQuestion = profile?.role === 'admin' || question.asked_by === profile?.id

  async function handleAnswer(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onAnswer(question, answerText)
      setAnswerText('')
      setAnswering(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-[10px] bg-surface p-5">
      <div className="flex items-start gap-3">
        <InitialsAvatar
          firstName={question.asker?.first_name}
          lastName={question.asker?.last_name}
          avatarUrl={question.asker?.avatar_url}
          size={40}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-text">
              {question.asker?.first_name} {question.asker?.last_name}
            </span>
            <DepartmentBadge department={question.asker?.department} />
            <RelativeTime date={question.created_at} className="text-[12px] text-text-muted" />
          </div>
          <p className="text-[15px] text-text">{question.body}</p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setAnswering((v) => !v)}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              Antworten
            </button>
            {canDeleteQuestion && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-text-muted hover:text-primary">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Frage löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Die Frage und alle Antworten werden entfernt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteQuestion(question.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-red-700"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {question.product_answers.length > 0 && (
        <div className="space-y-3 pl-8">
          {question.product_answers.map((answer) => (
            <AnswerRow
              key={answer.id}
              answer={answer}
              canDelete={profile?.role === 'admin' || answer.answered_by === profile?.id}
              onDelete={onDeleteAnswer}
            />
          ))}
        </div>
      )}

      {answering && (
        <form onSubmit={handleAnswer} className="space-y-2 pl-8">
          <Textarea
            rows={2}
            required
            placeholder="Antwort schreiben…"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? 'Wird gesendet…' : 'Antworten'}
          </Button>
        </form>
      )}
    </div>
  )
}

export function ProductQA({ productId, productName }) {
  const { toast } = useToast()
  const { questions, askQuestion, answerQuestion, deleteQuestion, deleteAnswer } = useProductQA(
    productId,
    productName
  )
  const [newQuestion, setNewQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAsk(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await askQuestion(newQuestion)
      setNewQuestion('')
    } catch (err) {
      console.error('Frage konnte nicht gestellt werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Frage konnte nicht gestellt werden.' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAnswer(question, body) {
    try {
      await answerQuestion(question, body)
    } catch (err) {
      console.error('Antwort konnte nicht gespeichert werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Antwort konnte nicht gespeichert werden.' })
    }
  }

  async function handleDeleteQuestion(id) {
    try {
      await deleteQuestion(id)
    } catch (err) {
      console.error('Frage konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  async function handleDeleteAnswer(id) {
    try {
      await deleteAnswer(id)
    } catch (err) {
      console.error('Antwort konnte nicht gelöscht werden:', err)
      toast({ variant: 'destructive', title: 'Fehler', description: 'Löschen fehlgeschlagen.' })
    }
  }

  return (
    <div className="space-y-5">
      <Separator />
      <div className="flex items-center gap-2">
        <h2 className="font-display text-[18px] font-bold text-text">Fragen zum Produkt</h2>
        <Badge variant="secondary">{questions.length}</Badge>
      </div>

      <form onSubmit={handleAsk} className="space-y-2">
        <Textarea
          rows={3}
          required
          placeholder="Frage zum Produkt stellen…"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Wird gesendet…' : 'Frage stellen'}
          </Button>
        </div>
      </form>

      {questions.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Noch keine Fragen" description="Stelle die erste Frage zu diesem Produkt." />
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              productId={productId}
              productName={productName}
              onAnswer={handleAnswer}
              onDeleteQuestion={handleDeleteQuestion}
              onDeleteAnswer={handleDeleteAnswer}
            />
          ))}
        </div>
      )}
    </div>
  )
}
