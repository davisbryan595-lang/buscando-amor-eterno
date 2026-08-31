import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminEmailFromRequest } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const

type TicketStatus = (typeof statuses)[number]

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === 'string' && statuses.includes(value as TicketStatus)
}

export async function GET(request: NextRequest) {
  if (!getAdminEmailFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('support_tickets')
    .select('id, name, email, subject, message, status, admin_notes, response_draft, responded_at, responded_by, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 })
  }

  return NextResponse.json({ tickets: data || [] })
}

export async function PATCH(request: NextRequest) {
  const adminEmail = getAdminEmailFromRequest(request)
  if (!adminEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { ticketId, status, adminNotes, responseDraft } = body

    if (typeof ticketId !== 'string' || !ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })
    }
    if (!isTicketStatus(status)) {
      return NextResponse.json({ error: 'Invalid ticket status' }, { status: 400 })
    }
    if (typeof adminNotes !== 'string' || typeof responseDraft !== 'string') {
      return NextResponse.json({ error: 'Invalid ticket update' }, { status: 400 })
    }
    if (adminNotes.length > 5000 || responseDraft.length > 5000) {
      return NextResponse.json({ error: 'Ticket update is too long' }, { status: 400 })
    }

    const trimmedNotes = adminNotes.trim()
    const trimmedDraft = responseDraft.trim()
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status,
        admin_notes: trimmedNotes || null,
        response_draft: trimmedDraft || null,
        responded_at: trimmedDraft ? new Date().toISOString() : null,
        responded_by: trimmedDraft ? adminEmail : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    if (error) {
      console.error('Error updating support ticket:', error)
      return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error parsing support ticket update:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
