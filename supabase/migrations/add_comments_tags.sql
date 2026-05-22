-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on post_id for faster queries
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);

-- Create post_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS post_tags_post_id_idx ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS post_tags_tag_id_idx ON post_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Comments: Allow anyone to read, allow anyone to insert (for now, since no auth system)
DROP POLICY IF EXISTS "Allow public read access on comments" ON comments;
CREATE POLICY "Allow public read access on comments" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on comments" ON comments;
CREATE POLICY "Allow public insert on comments" ON comments FOR INSERT WITH CHECK (true);

-- Tags: Allow anyone to read, allow anyone to insert (for now)
DROP POLICY IF EXISTS "Allow public read access on tags" ON tags;
CREATE POLICY "Allow public read access on tags" ON tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on tags" ON tags;
CREATE POLICY "Allow public insert on tags" ON tags FOR INSERT WITH CHECK (true);

-- Post_tags: Allow anyone to read and insert (for now)
DROP POLICY IF EXISTS "Allow public read access on post_tags" ON post_tags;
CREATE POLICY "Allow public read access on post_tags" ON post_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on post_tags" ON post_tags;
CREATE POLICY "Allow public insert on post_tags" ON post_tags FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete on post_tags" ON post_tags;
CREATE POLICY "Allow public delete on post_tags" ON post_tags FOR DELETE USING (true);
