# צועדים Implementation Roadmap

## Phase 1: Foundation (Now) ✅ Mostly Complete
- [x] Project scaffolding & dependencies installed
- [x] Database schema defined (SQL files ready)
- [x] Supabase configuration in place (API keys in .env.local)
- [x] Database utilities (`lib/database.ts`) - all CRUD operations
- [x] Authentication utilities (`lib/auth.ts`) - signup, signin, Google OAuth
- [x] Auth screen component - fully styled
- [ ] Deploy schema & RLS to Supabase
- [ ] Create seed data for testing

**Next**: Run SQL setup guide to deploy schema to Supabase

---

## Phase 2: Core Functionality (Next Priority)
### 2A - Dashboard & Goal List Display
**File**: `components/dashboard-screen.tsx`
**Requirements**:
- Fetch user's active goals from Supabase
- Display goals in list format (card per goal)
- Show XP/points in header
- Show current streak card (prominent)
- Add "New Goal" button
- Real-time updates via Supabase listeners

**Key Code**:
```typescript
// In dashboard component:
const [user] = useState<Profile | null>(null);
const [goals, setGoals] = useState<Goal[]>([]);

useEffect(() => {
  const user = await getCurrentUser();
  if (user) {
    setUser(user);
    getGoals(user.id).then(setGoals);
    // Subscribe to real-time updates
    subscribeToGoals(user.id, setGoals);
  }
}, []);
```

### 2B - Goal Creation Form
**File**: `components/goal-form.tsx` (new)
**Requirements**:
- Dynamic form based on goal type selection
- Fields vary by type:
  - **Quantitative**: title, category, start_value, target_value, unit
  - **Streak**: title, category, frequency, target_per_week, duration_minutes (optional)
  - **Milestone**: title, category, due_date
- Form validation
- Submit creates goal in Supabase

### 2C - Goal Detail View
**File**: `app/goals/[id]/page.tsx`
**Requirements**:
- Fetch single goal + progress entries
- Display goal info card
- Graph showing progress over time (recharts)
- History table of all entries
- "Add progress" button
- Edit/delete goal buttons

---

## Phase 3: Premium Features
### 3A - Leaderboard
**File**: `components/leaderboard-screen.tsx` (new)
**Requirements**:
- Two modes: Global & Groups
- Dropdown to select group (if multiple groups)
- Ranked by total_points
- Show rank, name, points
- Highlight current user
- Premium-only feature (check subscription.status)

### 3B - Settings & Subscription
**File**: `app/settings/page.tsx`
**Requirements**:
- Profile editing
- Leaderboard opt-in toggle
- Group management (create/leave)
- Subscription status display
- Link to Stripe customer portal
- Sign out button

---

## Phase 4: Payment Integration
### 4A - Stripe Checkout
**File**: `lib/stripe.ts` (new) + API route
**Requirements**:
- Create checkout session via Stripe API
- Redirect to Stripe checkout
- Handle successful payment → webhook

### 4B - Stripe Webhook Handler
**File**: `app/api/webhooks/stripe/route.ts`
**Requirements**:
- Verify webhook signature
- Handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Update `subscriptions` table via service role
- Note: Service role operations require backend (not browser client)

---

## Phase 5: Background Jobs
### 5A - Streak Maintenance Trigger
**File**: `triggers/update_current_streak.sql` (new)
**Requirements**:
- Trigger on `progress_entries` INSERT/UPDATE
- Recalculate `current_streak` for parent goal
- Reset if gap detected

### 5B - Nightly Edge Function
**File**: `update_streaks_edge_function.ts` (reference file ready)
**Requirements**:
- Deploy to Supabase Edge Functions
- Runs daily (pg_cron schedule)
- Verifies all streaks, catches any reset logic misses
- Backup correctness check

---

## Quick Setup Instructions

### 1. Deploy Database Schema
```bash
# Navigate to Supabase Dashboard → SQL Editor
# Copy content from: ../חומרים לאפליקציית מעקב אישי/schema.sql
# Paste and execute
# Then do the same with: ../חומרים לאפליקציית מעקב אישי/rls_policies.sql
```

### 2. Verify Auth Providers
Supabase Dashboard → Authentication → Providers:
- ✅ Email provider (should be enabled by default)
- ✅ Google OAuth (optional but recommended)

### 3. Test Auth Flow Locally
```bash
npm run dev
# Navigate to http://localhost:3000
# Click "התחילו עכשיו" or "התחברות"
# Try signup/signin (should redirect to /dashboard if successful)
```

### 4. Start Dashboard Implementation
```typescript
// Follow template in Phase 2A above
// Key: useEffect to fetch profile + goals on component load
```

---

## Key Code Patterns to Reuse

### Pattern 1: Fetch & Display Data
```typescript
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getGoals } from "@/lib/database";

export function MyComponent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (user) {
        const data = await getGoals(user.id);
        setGoals(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div>טוען...</div>;
  return <div>{goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}</div>;
}
```

### Pattern 2: Form Submission with Error Handling
```typescript
const [error, setError] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsSubmitting(true);
  
  try {
    const result = await createGoal(/* params */);
    if (!result) {
      setError("Create failed");
      return;
    }
    router.push("/dashboard");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Pattern 3: Real-time Updates
```typescript
useEffect(() => {
  const user = await getCurrentUser();
  if (!user) return;
  
  const unsubscribe = subscribeToGoals(user.id, (newGoals) => {
    setGoals(newGoals);
  });
  
  return unsubscribe; // Cleanup on unmount
}, []);
```

---

## Testing Checklist

- [ ] Auth signup creates profile & subscription record
- [ ] Auth signin retrieves existing user
- [ ] Dashboard loads goals for current user only (RLS working)
- [ ] Creating goal saves to Supabase
- [ ] Adding progress entry updates goal stats
- [ ] Streaks calculated correctly (real-time + nightly backup)
- [ ] Leaderboard shows opted-in users only (global) or group members (groups)
- [ ] Stripe checkout creates subscription record
- [ ] Premium features gated by subscription.status = "active" or "trial"
- [ ] All pages handle unauthenticated state (redirect to /auth)

---

## File Structure Summary
```
tsoadim/
  app/
    page.tsx                 (landing)
    layout.tsx              (with RTL dir="rtl")
    auth/page.tsx           (auth screen)
    dashboard/page.tsx      (dashboard screen)
    goals/
      new/page.tsx          (create goal)
      [id]/page.tsx         (goal detail)
    settings/page.tsx       (settings & subscription)
    leaderboard/page.tsx    (premium leaderboard)
  components/
    auth-screen.tsx         ✅ Done
    dashboard-screen.tsx    (next)
    goal-form.tsx           (next)
    goal-card.tsx           (new)
    leaderboard.tsx         (later)
  lib/
    supabase.ts             ✅ Client config
    database.ts             ✅ CRUD utilities
    auth.ts                 ✅ Auth utilities
    stripe.ts               (next - payment)
```

---

## Critical Success Factors
1. **RLS must be working** - test by fetching goals for wrong user ID (should error)
2. **Auth state persistence** - user stays logged in after refresh
3. **Real-time updates** - streaks update without page reload
4. **Error handling** - graceful fallback if Supabase down
5. **RTL correctness** - all text right-aligned, no visual glitches

---

## Common Gotchas
- ❌ Forgetting `dir="rtl"` on root element → Text looks wrong
- ❌ RLS not enabled on tables → Anyone can access anyone's data
- ❌ `subscriptions` table has client INSERT policy → Users can fake premium
- ❌ Not checking subscription status before showing premium features
- ❌ Forgetting `await` in async functions → Bugs with timing
- ❌ Real-time listeners not unsubscribed → Memory leaks
