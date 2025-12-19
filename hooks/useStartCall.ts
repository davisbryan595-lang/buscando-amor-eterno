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
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 5)

      // Clean up any existing pending/active invitations for this caller-recipient pair
      // This prevents duplicate key constraint violations
      try {
        await supabase
          .from('call_invitations')
          .delete()
          .eq('caller_id', user.id)
          .eq('recipient_id', recipientId)
          .neq('status', 'ended')
      } catch (cleanupError) {
        console.warn('Failed to cleanup old invitations:', cleanupError)
        // Don't fail the call if cleanup fails
      }

      // Create call invitation in database
      const { data: invitation, error: invitationError } = await supabase
        .from('call_invitations')
        .insert({
          caller_id: user.id,
          recipient_id: recipientId,
          call_type: callType,
          room_name: roomName,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (invitationError) {
        console.error('Failed to create call invitation:', invitationError)

        // Handle duplicate key constraint error specifically
        if (invitationError.code === '23505') {
          toast.error('A call is already in progress. Please try again in a moment.')
        } else {
          toast.error('Failed to initiate call. Please try again.')
        }
        return
      }

      // Navigate to video call page as the caller
      router.push(
        `/video-date?partner=${recipientId}&type=${callType}&callId=${invitation?.id}&mode=outgoing`
      )
    } catch (err: any) {
      console.error('Error starting call:', err)
      toast.error(err.message || 'Failed to start call')
    }
  }

  return { startCall }
}
