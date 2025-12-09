-- Add status column to posts table
ALTER TABLE public.posts
ADD COLUMN status text NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft', 'published'));