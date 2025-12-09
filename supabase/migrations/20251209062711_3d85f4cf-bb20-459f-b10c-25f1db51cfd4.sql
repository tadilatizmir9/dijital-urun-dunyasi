-- Add meta fields to posts table
ALTER TABLE public.posts
ADD COLUMN meta_title text,
ADD COLUMN meta_description text;