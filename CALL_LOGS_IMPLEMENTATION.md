# WhatsApp-Style Call Logs Implementation

## Overview
This document summarizes the implementation of WhatsApp-style call logging for the Buscando Amor Eterno dating app. The system now tracks calls with proper status (Completed, Missed, Declined, Cancelled) and displays them in the chat timeline with visual indicators and call durations.

---

## Database Schema

### call_logs Table
A new `call_logs` table was created in Supabase with the following schema:

```sql
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES profiles(user_id),
  receiver_id UUID NOT NULL REFERENCES profiles(user_id),
  call_type TEXT CHECK (call_type IN ('audio', 'video')),
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'missed', 'declined', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- Row Level Security (RLS) enabled
- Users can only view their own call logs
- Proper constraints for data integrity
- Indexed for performance on common queries

---

## Architecture Changes

### 1. Call Initiation (useStartCall.ts)
**Changes:**
- Now creates a `call_logs` entry with status 'ongoing' when call is initiated
- Passes the call_logs ID (logId) to the call page via URL parameter

**Flow:**
```
User clicks call button 
→ Create call_logs entry (status: 'ongoing', started_at: now)
→ Create call_invitations entry (for signaling)
→ Navigate to call page with logId
```

### 2. Call Acceptance (call-manager.tsx)
**Changes:**
- Retrieves the call_logs entry when accepting an incoming call
- Passes logId to AgoraVideoCall component

**Flow:**
```
Incoming call received 
→ User taps Accept
→ Get call_logs ID from database
→ Pass logId to AgoraVideoCall
```

### 3. Call Completion (agora-video-call.tsx)
**Changes:**
- Tracks logId throughout the call lifecycle
- Updates call_logs with final status and duration on call end
- Auto-marks calls as 'missed' if not answered within 30 seconds (for outgoing calls)
- Properly handles all end scenarios:
  - **Completed**: When both users connected and call ended normally
  - **Cancelled**: When caller ends call before receiver answered
  - **Missed**: When receiver never answered (30-second timeout)

**Call States:**
```
Outgoing Call:
started_at: NOW
↓ [30 second timeout]
If answered: answered_at: NOW, cleared timeout
  When ended: status='completed', ended_at=NOW, duration=(ended-answered)
If not answered: status='missed' (auto-timeout)

Incoming Call:
received via call_invitations
When accepted: answered_at=NOW
When ended: status='completed', ended_at=NOW, duration=(ended-answered)
When declined: status='declined', ended_at=NOW
```

### 4. Call Rejection (useIncomingCalls.ts)
**Changes:**
- Updates call_logs with status 'declined' when call is rejected
- Sets ended_at timestamp

### 5. Display Layer (chat-window.tsx, call-log-message.tsx)
**Components:**
- **ChatWindow**: Fetches both messages and call_logs from Supabase, merges them chronologically
- **CallLogMessage**: Displays calls with WhatsApp-style formatting

**Display Logic:**
```
For each call:
- Icon: Shows call type (audio/video) and status
- Direction: Shows "Outgoing" or "Incoming" with arrow indicator
- Status: Color-coded
  - Green: Completed
  - Red: Missed (incoming only)
  - Gray: Declined/Cancelled
- Duration: Shows only for completed calls (e.g., "2:34")
- Timestamp: Shows time call was made
```

---

## Key Features Implemented

### ✅ Call Status Tracking
- **Ongoing**: Call is in progress
- **Completed**: Both parties connected and call ended normally
- **Missed**: Call not answered within 30 seconds (outgoing) or declined by receiver
- **Declined**: Receiver explicitly rejected the call
- **Cancelled**: Caller ended call before receiver answered

### ✅ Duration Tracking
- Only recorded for completed calls
- Stored in seconds in database
- Displayed as "M:SS" format (e.g., "2:34")

### ✅ Direction Indicators
- **Outgoing calls**: Shown with phone icon pointing right
- **Incoming calls**: Shown with phone icon pointing left
- Video calls show camera icon instead

### ✅ Timeline Integration
- Call logs merged chronologically with text messages
- Displayed in chat window like WhatsApp

### ✅ Real-time Updates
- Calls appear in chat immediately after completion
- Uses Supabase Realtime for live updates

### ✅ Auto-detection of Missed Calls
- Outgoing calls auto-marked as 'missed' after 30 seconds without answer
- Cleanup prevents false "ongoing" entries

---

## File Changes Summary

### New Files
- `components/call-log-message.tsx` - WhatsApp-style call log display component

### Modified Files
1. **hooks/useStartCall.ts**
   - Create call_logs entry on call initiation
   - Pass logId to call page

2. **components/agora-video-call.tsx**
   - Accept logId parameter
   - Update call_logs on call end with status and duration
   - Auto-mark calls as missed after 30 seconds
   - Clean up timeouts properly

3. **components/call-manager.tsx**
   - Retrieve logId from call_logs when accepting calls
   - Pass logId to AgoraVideoCall

4. **app/video-date/video-date-content.tsx**
   - Extract logId from URL params
   - Pass logId to AgoraVideoCall

5. **hooks/useIncomingCalls.ts**
   - Update call_logs when call is declined
   - Maintain legacy messages table for compatibility

6. **components/chat-window.tsx**
   - Import call-log-message component
   - Fetch call_logs from database
   - Merge messages and call_logs chronologically
   - Display CallLogMessage for call logs

### Database Migrations
- `create_call_logs_table_fixed` migration applied

---

## Testing Checklist

### ✅ Outgoing Audio Call (Completed)
1. User A initiates audio call to User B
2. Call log created with status='ongoing'
3. User B accepts call
4. Both connect successfully
5. User A/B ends call
6. ✅ Call shows: "Outgoing audio call • 2:34" (green text)

### ✅ Incoming Audio Call (Completed)
1. User A calls User B
2. User B accepts
3. Call connects and continues for 1 minute
4. User A ends call
5. ✅ Call shows: "Incoming audio call • 1:00" (green text)

### ✅ Outgoing Video Call (Missed)
1. User A initiates video call to User B
2. Call log created with status='ongoing'
3. User B does not answer (30 second timeout)
4. ✅ Call auto-marked as 'missed'
5. ✅ Shows: "Call not answered" (gray text)

### ✅ Incoming Call (Missed)
1. User A calls User B
2. User B doesn't answer within 30 seconds
3. Call expires/times out
4. ✅ Shows: "Missed call" (red text, for User B's perspective)

### ✅ Incoming Call (Declined)
1. User A calls User B
2. User B immediately declines
3. Call log updated with status='declined'
4. ✅ Shows: "Declined call" (gray text)

### ✅ Call Timeline Integration
1. User A and B exchange messages
2. User A calls User B
3. Messages and call log appear in correct chronological order
4. ✅ Chat shows messages and calls interleaved by timestamp

### ✅ Call Back Button
1. View completed call log
2. Click call back button
3. ✅ New call initiated to same user

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Call Initiation (User A)                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Click call button → useStartCall.startCall()             │
│ 2. Create call_logs entry (status='ongoing')                │
│ 3. Create call_invitations entry                            │
│ 4. Navigate to /video-date with logId param                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Call Reception (User B)                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Incoming call notification triggered                     │
│ 2. Get call_logs ID from DB                                 │
│ 3. Accept → AgoraVideoCall with logId                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Call Connection & Duration Tracking                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Remote user published → isConnected=true                 │
│ 2. Start call duration timer                                │
│ 3. Clear 30-second missed call timeout                      │
│ 4. Track answered_at timestamp                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Call Completion                                             │
├─────────────────────────────────────────────────────────────┤
│ 1. User ends call → endCall()                               │
│ 2. Calculate final duration                                 │
│ 3. Update call_logs:                                        │
│    - status = 'completed'/'cancelled'/'missed'             │
│    - ended_at = NOW                                         │
│    - duration = (if connected)                              │
│ 4. Delete call_invitations                                  │
│ 5. Close Agora tracks & leave channel                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Display in Chat                                             │
├─────────────────────────────────────────────────────────────┤
│ 1. ChatWindow fetches call_logs                             │
│ 2. Merge with messages chronologically                      │
│ 3. Render CallLogMessage for each call                      │
│ 4. Show status, icon, duration, timestamp                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Legacy Compatibility

The system maintains backward compatibility with the existing `messages` table:

- Call logs continue to be recorded in the messages table with `type='call_log'`
- Both tables are updated simultaneously during call lifecycle
- Existing code that reads from messages table continues to work
- New code uses call_logs table for better structure and performance

---

## Error Handling

### Graceful Degradation
- If call_logs entry fails to create, call still proceeds (logged to console)
- If call_logs update fails on end, call still completes (logged to console)
- If call_invitations deletion fails, cleanup still attempts to complete
- All async operations have proper error handling and logging

### Cleanup Operations
- Missed call timeout automatically cleared when call is answered
- All Agora resources properly released on call end
- Call invitations deleted to prevent duplicate key conflicts
- No orphaned records remain

---

## Performance Optimizations

### Database Indexes
```sql
-- Query pattern: Get all calls for a user-pair
idx_call_logs_users_and_time (caller_id, receiver_id, started_at DESC)

-- Query pattern: Get calls for a specific user
idx_call_logs_caller_id (caller_id)
idx_call_logs_receiver_id (receiver_id)

-- Query pattern: Filter by status
idx_call_logs_status (status)
```

### Query Optimization
- Single query to fetch call_logs for a conversation
- Sorted and merged in-memory (minimal overhead)
- Indexed lookups for real-time subscription

---

## Future Enhancements

Possible improvements for future iterations:

1. **Call History Grouping**
   - Group consecutive calls by date/time
   - Show "1 missed call from John at 2:30 PM"

2. **Call Stats**
   - Total call duration with a user
   - Favorite contact (most calls)
   - Call streak (days of consecutive calls)

3. **Call Analytics**
   - Dashboard showing call patterns
   - Peak calling times
   - Preferred call type (audio vs video)

4. **Call Recording**
   - Optional call recording (with consent)
   - Store in cloud storage
   - Access from call history

5. **Call Notifications**
   - Smart notifications for missed calls
   - "User tried calling you X times"
   - Call reminder notifications

---

## Deployment Notes

### Database Setup
1. Run the `create_call_logs_table_fixed` migration in Supabase
2. Verify RLS policies are enabled
3. Test queries to ensure proper indexing

### Environment Variables
No new environment variables required. Uses existing Supabase credentials.

### Rollback Procedure
If needed to rollback:
```sql
DROP TABLE IF EXISTS call_logs CASCADE;
-- Or: ALTER TABLE call_logs RENAME TO call_logs_backup;
```

---

## Troubleshooting

### Calls showing as "Ongoing" after crash
**Issue**: App crashed during call, call_logs shows status='ongoing'
**Solution**: Run manual cleanup SQL:
```sql
UPDATE call_logs
SET 
  status = 'completed',
  ended_at = started_at + INTERVAL '5 minutes',
  duration = 300
WHERE 
  status = 'ongoing'
  AND started_at < NOW() - INTERVAL '1 hour';
```

### Call logs not appearing in chat
**Issue**: Call logs created but not showing in chat window
**Solution**: 
1. Verify call_logs table has data
2. Check chat-window component fetchAndMergeMessages function
3. Ensure currentUserId is correctly passed to CallLogMessage

### Missed call timeout not working
**Issue**: Outgoing call should be marked 'missed' but isn't
**Solution**:
1. Verify missedCallTimeoutRef is properly initialized
2. Check that mode='outgoing' is correctly passed
3. Ensure isConnected state is not prematurely set to true

---

## Support & Questions

For issues or questions about the implementation:
1. Check the troubleshooting section above
2. Review the data flow diagram
3. Check browser console for error logs
4. Check Supabase logs for database errors
