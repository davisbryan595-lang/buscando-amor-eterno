import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated (check Authorization header)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the special email from request body
    const body = await request.json()
    const premiumEmail = body.premiumEmail || 'davisbryan595@gmail.com'

    console.log(`[Reset Subscriptions] Starting subscription reset. Premium email: ${premiumEmail}`)

    // Step 1: Find the user with the special email
    let premiumUserId: string | null = null
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.listUsers()
      if (authError) throw authError

      const user = authUser.users.find((u) => u.email === premiumEmail)
      if (user) {
        premiumUserId = user.id
        console.log(`[Reset Subscriptions] Found premium user: ${premiumUserId}`)
      } else {
        console.warn(`[Reset Subscriptions] User with email ${premiumEmail} not found`)
      }
    } catch (err: any) {
      console.error('Error finding user:', err?.message)
    }

    // Step 2: Get all subscriptions
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id, plan, status')

    if (fetchError) throw fetchError

    console.log(`[Reset Subscriptions] Found ${subscriptions?.length || 0} total subscriptions`)

    // Step 3: Reset all to free except premium user
    let freeCount = 0
    let premiumCount = 0

    for (const sub of subscriptions || []) {
      if (premiumUserId && sub.user_id === premiumUserId) {
        // Keep this user as premium
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'premium',
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id)

        if (updateError) {
          console.error(`Error updating premium user ${sub.user_id}:`, updateError)
        } else {
          premiumCount++
        }
      } else {
        // Set all others to free
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'active',
            stripe_subscription_id: null,
            expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id)

        if (updateError) {
          console.error(`Error updating free user ${sub.user_id}:`, updateError)
        } else {
          freeCount++
        }
      }
    }

    console.log(
      `[Reset Subscriptions] Complete. Free: ${freeCount}, Premium: ${premiumCount}`
    )

    return NextResponse.json({
      success: true,
      message: `Reset complete. ${freeCount} users set to free, ${premiumCount} user(s) kept as premium.`,
      stats: {
        totalSubscriptions: subscriptions?.length || 0,
        freeUsers: freeCount,
        premiumUsers: premiumCount,
        premiumEmail,
        premiumUserId: premiumUserId || 'NOT FOUND',
      },
    })
  } catch (error: any) {
    console.error('[Reset Subscriptions] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset subscriptions', details: error?.message },
      { status: 500 }
    )
  }
}
