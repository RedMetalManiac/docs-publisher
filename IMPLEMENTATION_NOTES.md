# Implementation Notes: Comments, Search, and Tags

This document describes the implementation of three new features added to the Docs Publisher project:
1. Collapsible comments sidebar
2. Search functionality
3. Article tags

## Database Changes

### New Tables

#### `comments` Table
- `id` (TEXT, PRIMARY KEY, UUID)
- `post_id` (TEXT, NOT NULL, foreign key to posts.id)
- `author_name` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### `tags` Table
- `id` (TEXT, PRIMARY KEY, UUID)
- `name` (TEXT, NOT NULL, UNIQUE)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

#### `post_tags` Junction Table (Many-to-Many)
- `post_id` (TEXT, NOT NULL, foreign key to posts.id)
- `tag_id` (TEXT, NOT NULL, foreign key to tags.id)
- PRIMARY KEY (post_id, tag_id)

### Migration File
Location: `supabase/migrations/add_comments_tags.sql`

To apply the migration:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/migrations/add_comments_tags.sql`

## Created Files

### Comments Feature
- `src/lib/comments/actions.ts` - Server Actions for adding and fetching comments
- `components/comments/comments-sidebar.tsx` - Collapsible sidebar component

### Tags Feature
- `src/lib/tags/actions.ts` - Server Actions for tag management
- `app/tag/[slug]/page.tsx` - Tag filtering page

### Search Feature
- `src/lib/search/actions.ts` - Server Action for searching posts
- `app/search/page.tsx` - Search results page

### Type Definitions
- `types/article.ts` - Updated with Tag type and ArticleListItem tags field

## Modified Files

### Database Types
- `src/lib/supabase/client.ts` - Added comments, tags, and post_tags table types

### Comments Integration
- `app/article/[slug]/page.tsx` - Added CommentsSidebar component

### Tags Integration
- `app/submit/actions.ts` - Updated to handle tags during submission
- `components/submit/submit-form.tsx` - Added tags input field
- `src/lib/posts/queries.ts` - Updated to fetch tags with posts
- `app/admin/admin-dashboard.tsx` - Added tags editing in post edit modal
- `app/admin/posts-actions.ts` - Updated to handle tags in post updates
- `types/article.ts` - Added Tag type and updated ArticleListItem

### Search Integration
- `components/layout/site-header.tsx` - Added search bar (client component)

### Tag Filtering
- `app/page.tsx` - Added tag filtering to homepage
- `app/search/page.tsx` - Added tag filtering to search results

## Environment Variables

No new environment variables are required for these features. The existing Supabase configuration is sufficient.

## Dependencies

The implementation uses the following existing dependencies:
- `@supabase/ssr` - Supabase client for Next.js
- `next` - Next.js framework
- `react` - React library
- `sanitize-html` - For sanitizing comment content (already in use)
- `slugify` - For creating tag slugs (may need to be installed)

If `slugify` is not installed, add it:
```bash
npm install slugify
npm install --save-dev @types/slugify
```

## Testing Instructions

### 1. Apply Database Migration
Before testing, apply the SQL migration to your Supabase project:
1. Open Supabase dashboard
2. Go to SQL Editor
3. Run the SQL from `supabase/migrations/add_comments_tags.sql`

### 2. Test Comments Feature
1. Navigate to any article page (e.g., `/article/[slug]`)
2. Click the "Comments" button on the right side of the page
3. The sidebar should slide in from the right
4. Enter a name and comment
5. Submit the comment
6. Verify the comment appears in the list
7. Test closing the sidebar by clicking "Close" or the "×" button
8. Test on mobile - sidebar should take full width

### 3. Test Tags Feature
#### Submission Flow
1. Go to `/submit`
2. Enter a Google Doc URL
3. Enter tags in the tags field (comma-separated, e.g., "design, writing, technology")
4. Submit the form
5. Navigate to the article page
6. Verify tags are displayed under the title
7. Click on a tag - should navigate to `/tag/[slug]`

#### Admin Dashboard
1. Go to `/admin` and log in
2. Click "Edit" on any post
3. Verify tags are loaded in the tags field
4. Modify the tags
5. Save the changes
6. Verify the changes on the article page

#### Tag Filtering
1. Go to homepage
2. Click on any tag in the "Filter by tag" section
3. Verify only articles with that tag are shown
4. Click "Clear filter" to show all articles
5. Go to `/search?q=test`
6. Filter by tag using the tag buttons
7. Verify results are filtered by both search query and tag

### 4. Test Search Feature
1. Go to any page
2. Use the search bar in the header (desktop only)
3. Enter a search term
4. Press Enter or click the search button
5. Verify search results page shows matching articles
6. Test searching by:
   - Title
   - Excerpt
   - Author name
   - Tag names
7. Test empty search results
8. Test tag filtering on search results

### 5. Test Tag Pages
1. Click on any tag from an article or homepage
2. Verify the tag page shows all articles with that tag
3. Verify the page title shows the tag name

## Design Notes

### Comments Sidebar
- Minimalist design matching the site's typography-focused aesthetic
- Smooth slide-in animation from the right
- Overlay on mobile for better UX
- Toggle button visible on all screen sizes
- Comments displayed chronologically with author name and timestamp
- Basic spam protection via HTML sanitization and character limits

### Tags
- Minimalist pill-shaped tags with subtle borders
- Hover effects for interactivity
- Consistent styling across article pages, homepage cards, and search results
- Tag filtering uses URL parameters for shareable links

### Search
- Minimalist search bar integrated into header
- Only visible on desktop to preserve mobile UX
- Search results page uses existing ArticleCard component
- Tag filtering integrated into search results

## Known Limitations

1. **Comments**: No rate limiting or advanced spam protection beyond basic sanitization
2. **Search**: Full-text search is basic (ILIKE queries) - consider adding full-text search for large datasets
3. **Tags**: No tag management UI (create/edit/delete tags) - tags are created automatically as needed
4. **Search Bar**: Only visible on desktop - mobile search could be added in future iteration

## Future Enhancements

1. Add rate limiting for comments
2. Implement full-text search with Supabase's full-text search capabilities
3. Add tag management UI in admin dashboard
4. Add mobile search interface
5. Add comment moderation in admin dashboard
6. Add email notifications for new comments
