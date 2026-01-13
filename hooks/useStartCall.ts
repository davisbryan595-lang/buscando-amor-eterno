import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function useStartCall() {
  const router = useRouter()
  const { user } = useAuth()

  const startCall = async (
    recipientId: string,
    recipientName: string,
    callType: 'audio' | 'video'
  ) => {
    if (!user) {
      toast.error('You must be logged in to make calls')
      return
    }

    if (!recipientId) {
      toast.error('Invalid recipient')
      return
    }

    try {
      // Generate room name (sorted IDs ensure consistency)
      const roomName = [user.id, recipientId].sort().join('-')
      const callId = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 5)

      // Create call log entry with 'ongoing' status
      const { data: callLog, error: callLogError } = await supabase
        .from('call_logs')
        .insert({
          caller_id: user.id,
          receiver_id: recipientId,
          call_type: callType,
          status: 'ongoing',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (callLogError) {
        console.error('Failed to create call log:', callLogError)
        toast.error('Failed to initiate call. Please try again.')
        return
      }

      // Use upsert to handle existing call invitations gracefully
      // If a call invitation with the same (caller_id, recipient_id, room_name) exists,
      // update it instead of failing with a unique constraint violation (409)
      const { data: invitation, error: invitationError } = await supabase
        .from('call_invitations')
        .upsert(
          {
            caller_id: user.id,
            recipient_id: recipientId,
            call_type: callType,
            room_name: roomName,
            call_id: callLog.id, // Use call_logs id as the call identifier
            status: 'pending',
            expires_at: expiresAt.toISOString(),
          },
          {
            onConflict: 'caller_id,recipient_id,room_name',
          }
        )
        .select()
        .single()

      if (invitationError) {
        console.error('Failed to create call invitation:', invitationError)
        toast.error('Failed to initiate call. Please try again.')
        return
      }

      // Navigate to video call page as the caller
      router.push(
        `/video-date?partner=${recipientId}&type=${callType}&callId=${invitation?.id}&mode=outgoing&logId=${callLog.id}`
      )
    } catch (err: any) {
      console.error('Error starting call:', err)
      toast.error(err.message || 'Failed to start call')
    }
  }

  return { startCall }
}
