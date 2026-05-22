# Engagement Features Implementation Notes

This document describes the implementation of engagement features added to the Docs Publisher project:
1. Comment counters
2. Like/dislike reactions
3. Reaction counters on article previews/cards

## Database Changes

### New Table: `reactions`

#### Schema
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `post_id` (UUID, NOT NULL, foreign key to posts.id ON DELETE CASCADE)
- `reaction_type` (TEXT, NOT NULL, CHECK: 'like' OR 'dislike')
- `user_identifier` (TEXT, NOT NULL) - localStorage-based unique identifier
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- UNIQUE constraint on (post_id, user_identifier, reaction_type)

#### Indexes
- `reactions_post_id_idx` on post_id
- `reactions_user_identifier_idx` on user_identifier
- `reactions_type_idx` on reaction_type

#### RLS Policies
- Public read access (for counting)
- Public insert (with app-level rate limiting)
- Public delete (for toggling reactions)

### Migration File
Location: `supabase/migrations/add_reactions.sql`

To apply the migration:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/migrations/add_reactions.sql`

## Created Files

### Reactions Feature
- `src/lib/reactions/actions.ts` - Server Actions for reactions (toggle, get counts, get user reaction)
- `src/lib/reactions/user-identifier.ts` - localStorage-based user identifier for anti-spam
- `components/reactions/reaction-buttons.tsx` - Like/dislike buttons component

### Comments Enhancement
- `src/lib/comments/actions.ts` - Added `getCommentCount` function

## Modified Files

### Database Types
- `src/lib/supabase/client.ts` - Added reactions table type definition

### Type Definitions
- `types/article.ts` - Extended ArticleListItem with commentCount, likeCount, dislikeCount

### Posts Queries
- `src/lib/posts/queries.ts` - Updated getRecentPosts to fetch comment and reaction counts

### Search
- `src/lib/search/actions.ts` - Updated searchPosts to fetch comment and reaction counts

### Article Pages
- `app/article/[slug]/page.tsx` - Added ReactionButtons component and comment count display

### Homepage Cards
- `components/home/article-card.tsx` - Added comment and like count display

### Admin Dashboard
- `app/admin/admin-dashboard.tsx` - Added comment, like, and dislike count columns

## Anti-Spam Implementation

### localStorage-Based User Identifier

The reaction system uses a localStorage-based user identifier to prevent spam reactions from the same user/device:

1. **User Identifier Generation**: When a user first interacts with reactions, a unique UUID is generated using `crypto.randomUUID()` and stored in localStorage under the key `docs_publisher_user_id`.

2. **Persistence**: The identifier persists across browser sessions, allowing the same user to maintain their reaction state.

3. **Uniqueness Constraint**: The database has a UNIQUE constraint on (post_id, user_identifier, reaction_type), preventing duplicate reactions from the same user.

4. **Toggle Behavior**: Users can toggle their reaction (add/remove) by clicking the same button again.

5. **Opposite Reaction Handling**: If a user has a "like" and clicks "dislike", the like is automatically removed before adding the dislike.

### Limitations

- localStorage is browser-specific. Users can clear their localStorage or use different browsers/devices to bypass the limit.
- This is a lightweight solution suitable for the current scope. A full authentication system would provide more robust protection.

## Testing Instructions

### 1. Apply Database Migration
Before testing, apply the SQL migration to your Supabase project:
1. Open Supabase dashboard
2. Go to SQL Editor
3. Run the SQL from `supabase/migrations/add_reactions.sql`

### 2. Test Comment Counters
1. Navigate to the homepage
2. Verify comment counts are displayed on article cards
3. Navigate to an article page
4. Verify comment count is displayed in the header
5. Add a comment via the comments sidebar
6. Verify the comment count updates

### 3. Test Like/Dislike Reactions
#### Article Page
1. Navigate to any article page
2. Click the "Like" button
3. Verify the like count increments
4. Verify the button shows active state (filled icon, accent color)
5. Click "Like" again
6. Verify the like count decrements and button returns to inactive state
7. Click "Dislike"
8. Verify dislike count increments
9. Click "Like" (while dislike is active)
10. Verify dislike is removed and like is added

#### Anti-Spam Test
1. Click "Like" multiple times rapidly
2. Verify the count only changes once per click (toggle behavior)
3. Clear browser localStorage
4. Reload the page
5. Verify a new user identifier is generated and you can react again

### 4. Test Counters on Homepage Cards
1. Navigate to the homepage
2. Verify comment counts are displayed
3. Verify like counts are displayed
4. Add a comment to an article
5. Refresh the homepage
6. Verify the comment count updated

### 5. Test Counters on Search Results
1. Navigate to the search page
2. Enter a search term
3. Verify comment and like counts are displayed on results
4. Add a reaction to a result
5. Refresh the search results
6. Verify the counts updated

### 6. Test Admin Dashboard
1. Navigate to `/admin` and log in
2. Verify comment, like, and dislike count columns are displayed
3. Verify counts match the actual counts in the database

## Design Notes

### Minimalist Aesthetic
- Reaction buttons use subtle pill-shaped design with thin borders
- Active state uses accent color with filled icon
- Inactive state uses muted color with outlined icon
- Counts are displayed in small, muted text matching existing metadata style

### Iconography
- Like: Thumbs-up icon
- Dislike: Thumbs-down icon
- Comments: Chat bubble icon

### Responsive Behavior
- Reaction buttons are horizontally stacked on desktop
- Maintain touch-friendly tap targets on mobile
- Counts are always visible regardless of screen size

## Environment Variables

No new environment variables are required for these features. The existing Supabase configuration is sufficient.

## Dependencies

The implementation uses the following existing dependencies:
- `@supabase/ssr` - Supabase client for Next.js
- `next` - Next.js framework
- `react` - React library
- `sanitize-html` - For sanitizing comment content (already in use)

No new dependencies were added.

## Known Limitations

1. **Anti-Spam**: localStorage-based identifier can be bypassed by clearing localStorage or using different browsers/devices. This is acceptable for the current scope but could be improved with full authentication.

2. **Real-time Updates**: Counts are updated via page refresh or navigation. Real-time updates would require WebSockets or polling.

3. **Reaction History**: Users cannot see a history of their reactions across all posts. This could be added in a future iteration.

4. **Admin Controls**: No admin controls for moderating or resetting reactions. This could be added if needed.

## Future Enhancements

1. Add real-time count updates using WebSockets or polling
2. Implement reaction history for logged-in users
3. Add admin controls for reaction moderation
4. Add reaction analytics dashboard
5. Implement more reaction types (love, laugh, etc.)
6. Add reaction notifications for authors
