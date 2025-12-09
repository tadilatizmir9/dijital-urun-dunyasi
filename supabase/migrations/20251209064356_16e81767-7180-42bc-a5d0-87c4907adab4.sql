-- Add show_on_homepage column to categories table
ALTER TABLE public.categories
ADD COLUMN show_on_homepage boolean NOT NULL DEFAULT false;