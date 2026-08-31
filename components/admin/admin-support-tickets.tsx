'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Loader2, Mail, Save } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { getAdminAuthHeaders } from '@/context/admin-auth-context'
import { AdminProtectedRoute } from '@/components/admin/admin-protected-route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface SupportTicket {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  admin_notes: string | null
  response_draft: string | null
  responded_at: string | null
  responded_by: string | null
  created_at: string
  updated_at: string
}

interface TicketDraft {
  status: string
  adminNotes: string
  responseDraft: string
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

function statusVariant(status: string) {
  if (status === 'resolved' || status === 'closed') return 'secondary' as const
  if (status === 'in_progress') return 'outline' as const
  return 'default' as const
}

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [drafts, setDrafts] = useState<Record<string, TicketDraft>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await fetch('/api/admin/support', { headers: getAdminAuthHeaders() })
        if (!response.ok) throw new Error('Failed to load support tickets')
        const data = await response.json()
        const loadedTickets = data.tickets || []
        setTickets(loadedTickets)
        setDrafts(Object.fromEntries(loadedTickets.map((ticket: SupportTicket) => [ticket.id, {
          status: ticket.status,
          adminNotes: ticket.admin_notes || '',
          responseDraft: ticket.response_draft || '',
        }])))
      } catch {
        toast.error('Failed to load support messages')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  const updateDraft = (ticketId: string, changes: Partial<TicketDraft>) => {
    setDrafts((current) => ({
      ...current,
      [ticketId]: { ...current[ticketId], ...changes },
    }))
  }

  const saveTicket = async (ticket: SupportTicket) => {
    const draft = drafts[ticket.id]
    if (!draft) return

    setSavingId(ticket.id)
    try {
      const response = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { ...getAdminAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          status: draft.status,
          adminNotes: draft.adminNotes,
          responseDraft: draft.responseDraft,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save support ticket')
      }

      const savedAt = draft.responseDraft.trim() ? new Date().toISOString() : null
      setTickets((current) => current.map((item) => item.id === ticket.id ? {
        ...item,
        status: draft.status,
        admin_notes: draft.adminNotes.trim() || null,
        response_draft: draft.responseDraft.trim() || null,
        responded_at: savedAt,
      } : item))
      toast.success('Support ticket updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save support ticket')
    } finally {
      setSavingId(null)
    }
  }

  const openEmail = (ticket: SupportTicket) => {
    const draft = drafts[ticket.id]?.responseDraft || ''
    const subject = `Re: ${ticket.subject}`
    const query = new URLSearchParams({ subject, body: draft })
    window.location.href = `mailto:${ticket.email}?${query.toString()}`
  }

  return (
    <AdminProtectedRoute>
      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Support Messages</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review every contact-form submission, record the action taken, and prepare a reply.
            </p>
          </div>
          <Badge variant="outline">{tickets.length} total</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : tickets.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No support messages yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const draft = drafts[ticket.id]
              const expanded = expandedId === ticket.id
              return (
                <div key={ticket.id} className="rounded-xl border border-border bg-background">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    onClick={() => setExpandedId(expanded ? null : ticket.id)}
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        <Badge variant={statusVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{ticket.name} · {ticket.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {expanded ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
                  </button>

                  {expanded && draft && (
                    <div className="space-y-5 border-t border-border p-4">
                      <div className="rounded-lg bg-muted/50 p-4 text-sm text-foreground whitespace-pre-wrap">{ticket.message}</div>

                      <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                          <label htmlFor={`status-${ticket.id}`} className="mb-2 block text-sm font-medium">Status</label>
                          <select
                            id={`status-${ticket.id}`}
                            value={draft.status}
                            onChange={(event) => updateDraft(ticket.id, { status: event.target.value })}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`notes-${ticket.id}`} className="mb-2 block text-sm font-medium">Internal notes / solution</label>
                          <Textarea
                            id={`notes-${ticket.id}`}
                            value={draft.adminNotes}
                            onChange={(event) => updateDraft(ticket.id, { adminNotes: event.target.value })}
                            placeholder="Record the action taken or follow-up needed"
                            rows={4}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`response-${ticket.id}`} className="mb-2 block text-sm font-medium">Response draft</label>
                        <Textarea
                          id={`response-${ticket.id}`}
                          value={draft.responseDraft}
                          onChange={(event) => updateDraft(ticket.id, { responseDraft: event.target.value })}
                          placeholder="Write the response you want to send to this customer"
                          rows={6}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          This saves the draft. Use “Open email” to send it from your configured mail app.
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => openEmail(ticket)} disabled={!draft.responseDraft.trim()}>
                          <Mail className="h-4 w-4" />
                          Open email
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button type="button" onClick={() => saveTicket(ticket)} disabled={savingId === ticket.id}>
                          {savingId === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save changes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </AdminProtectedRoute>
  )
}
