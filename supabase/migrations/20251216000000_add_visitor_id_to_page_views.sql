-- Add visitor_id column to page_views table
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS visitor_id TEXT;

-- Add index on visitor_id for performance
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views(visitor_id);

-- Update get_pageview_stats function to include unique_visitors
CREATE OR REPLACE FUNCTION public.get_pageview_stats(days INTEGER DEFAULT 7)
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT,
  unique_visitors BIGINT
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
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions,
    COUNT(DISTINCT visitor_id)::BIGINT as unique_visitors
  FROM public.page_views
  WHERE created_at >= cutoff_date
    AND visitor_id IS NOT NULL;
END;
$$;
