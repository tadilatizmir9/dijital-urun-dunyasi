-- Add title column to page_views table
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Update get_pageview_top_pages function to include title
CREATE OR REPLACE FUNCTION public.get_pageview_top_pages(days INTEGER DEFAULT 7, page_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  path TEXT,
  views BIGINT,
  last_seen TIMESTAMPTZ,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Check if user is authenticated and is admin
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  -- TODO: Add explicit admin role check if needed
  -- IF NOT public.has_role('admin', auth.uid()) THEN
  --   RAISE EXCEPTION 'Unauthorized: Admin access required';
  -- END IF;
  
  cutoff_date := NOW() - (days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    pv.path,
    COUNT(*)::BIGINT as views,
    MAX(pv.created_at) as last_seen,
    (SELECT pv2.title 
     FROM public.page_views pv2 
     WHERE pv2.path = pv.path 
       AND pv2.created_at >= cutoff_date
       AND pv2.title IS NOT NULL
     ORDER BY pv2.created_at DESC 
     LIMIT 1) as title
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT page_limit;
END;
$$;
