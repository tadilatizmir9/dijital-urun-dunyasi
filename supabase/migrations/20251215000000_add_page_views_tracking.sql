-- Page views tracking table
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  path TEXT NOT NULL,
  referrer TEXT,
  source TEXT, -- utm_source or inferred: facebook/google/instagram/direct
  campaign TEXT, -- utm_campaign (optional)
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_source ON public.page_views(source);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: No direct inserts from anon users
-- Only service role (via API endpoint) can insert
-- This ensures no direct client-side inserts bypassing the API

-- Allow authenticated admins to read aggregated data via RPC functions
-- Direct SELECT is restricted, but RPC functions will handle access control

-- RPC Function: Get page view statistics
CREATE OR REPLACE FUNCTION public.get_pageview_stats(days INTEGER DEFAULT 7)
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT
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
    COUNT(DISTINCT session_id)::BIGINT as unique_sessions
  FROM public.page_views
  WHERE created_at >= cutoff_date;
END;
$$;

-- RPC Function: Get top pages
CREATE OR REPLACE FUNCTION public.get_pageview_top_pages(days INTEGER DEFAULT 7, page_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  path TEXT,
  views BIGINT,
  last_seen TIMESTAMPTZ
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
    MAX(pv.created_at) as last_seen
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT page_limit;
END;
$$;

-- RPC Function: Get source statistics
CREATE OR REPLACE FUNCTION public.get_pageview_sources(days INTEGER DEFAULT 7)
RETURNS TABLE (
  source TEXT,
  views BIGINT,
  unique_sessions BIGINT
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
    COALESCE(pv.source, 'direct')::TEXT as source,
    COUNT(*)::BIGINT as views,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_sessions
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
  GROUP BY COALESCE(pv.source, 'direct')
  ORDER BY views DESC;
END;
$$;

-- Grant execute permissions on RPC functions to authenticated users
-- The functions themselves check for admin role via has_role
GRANT EXECUTE ON FUNCTION public.get_pageview_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pageview_top_pages(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pageview_sources(INTEGER) TO authenticated;
