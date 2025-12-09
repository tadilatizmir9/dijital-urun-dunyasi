-- Add featured column to products table
ALTER TABLE public.products ADD COLUMN featured boolean NOT NULL DEFAULT false;