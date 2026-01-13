-- Add full_path column to page_views table for storing original path with query/hash
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS full_path TEXT;

-- Create index on full_path for potential queries
CREATE INDEX IF NOT EXISTS idx_page_views_full_path ON public.page_views(full_path) WHERE full_path IS NOT NULL;

-- Update RPC functions to return full_path as well
-- Note: Existing rows will have full_path = NULL, which is fine for backward compatibility
-- The path column will continue to store the clean pathname (normalized)

-- Update get_pageview_top_pages to return full_path
CREATE OR REPLACE FUNCTION public.get_pageview_top_pages(days INTEGER DEFAULT 7, page_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  path TEXT,
  views BIGINT,
  last_seen TIMESTAMPTZ,
  title TEXT,
  full_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  cutoff_date := NOW() - (days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    pv.path,
    COUNT(*)::BIGINT as views,
    MAX(pv.created_at) as last_seen,
    (array_agg(pv.title ORDER BY pv.created_at DESC) FILTER (WHERE pv.title IS NOT NULL))[1] as title,
    (array_agg(pv.full_path ORDER BY pv.created_at DESC) FILTER (WHERE pv.full_path IS NOT NULL))[1] as full_path
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT page_limit;
END;
$$;

-- Update get_pageview_top_pages_range to return full_path
CREATE OR REPLACE FUNCTION public.get_pageview_top_pages_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE (
  path TEXT,
  views BIGINT,
  last_seen TIMESTAMPTZ,
  title TEXT,
  full_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    pv.path,
    COUNT(*)::BIGINT as views,
    MAX(pv.created_at) as last_seen,
    (array_agg(pv.title ORDER BY pv.created_at DESC) FILTER (WHERE pv.title IS NOT NULL))[1] as title,
    (array_agg(pv.full_path ORDER BY pv.created_at DESC) FILTER (WHERE pv.full_path IS NOT NULL))[1] as full_path
  FROM public.page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT 10;
END;
$$;
