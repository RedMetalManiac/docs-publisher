-- Create reactions table for likes/dislikes
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  user_identifier TEXT NOT NULL, -- IP-based or localStorage-based identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_identifier, reaction_type)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS reactions_post_id_idx ON reactions(post_id);
CREATE INDEX IF NOT EXISTS reactions_user_identifier_idx ON reactions(user_identifier);
CREATE INDEX IF NOT EXISTS reactions_type_idx ON reactions(reaction_type);

-- Enable Row Level Security (RLS)
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access for counting reactions
DROP POLICY IF EXISTS "Allow public read access on reactions" ON reactions;
CREATE POLICY "Allow public read access on reactions" ON reactions FOR SELECT USING (true);

-- Allow public insert for reactions (with rate limiting handled in app)
DROP POLICY IF EXISTS "Allow public insert on reactions" ON reactions;
CREATE POLICY "Allow public insert on reactions" ON reactions FOR INSERT WITH CHECK (true);

-- Allow public delete for reactions (for toggling)
DROP POLICY IF EXISTS "Allow public delete on reactions" ON reactions;
CREATE POLICY "Allow public delete on reactions" ON reactions FOR DELETE USING (true);
