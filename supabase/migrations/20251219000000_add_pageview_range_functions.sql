-- RPC Function: Get page view statistics for a date range
CREATE OR REPLACE FUNCTION public.get_pageview_stats_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT,
  unique_visitors BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_sessions,
    COUNT(DISTINCT pv.visitor_id) FILTER (WHERE pv.visitor_id IS NOT NULL)::BIGINT as unique_visitors
  FROM public.page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts;
END;
$$;

-- RPC Function: Get top pages for a date range
CREATE OR REPLACE FUNCTION public.get_pageview_top_pages_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
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
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    pv.path,
    COUNT(*)::BIGINT as views,
    MAX(pv.created_at) as last_seen,
    (array_agg(pv.title ORDER BY pv.created_at DESC) FILTER (WHERE pv.title IS NOT NULL))[1] as title
  FROM public.page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
  GROUP BY pv.path
  ORDER BY views DESC
  LIMIT 10;
END;
$$;

-- RPC Function: Get source statistics for a date range
CREATE OR REPLACE FUNCTION public.get_pageview_sources_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE (
  source TEXT,
  views BIGINT,
  unique_sessions BIGINT,
  unique_visitors BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    COALESCE(pv.source, 'direct')::TEXT as source,
    COUNT(*)::BIGINT as views,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_sessions,
    COUNT(DISTINCT pv.visitor_id) FILTER (WHERE pv.visitor_id IS NOT NULL)::BIGINT as unique_visitors
  FROM public.page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
  GROUP BY COALESCE(pv.source, 'direct')
  ORDER BY views DESC
  LIMIT 10;
END;
$$;

-- RPC Function: Get daily page view statistics for a date range
CREATE OR REPLACE FUNCTION public.get_pageview_daily_range(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE (
  day DATE,
  total_views BIGINT,
  unique_sessions BIGINT,
  unique_visitors BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', pv.created_at)::DATE as day,
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_sessions,
    COUNT(DISTINCT pv.visitor_id) FILTER (WHERE pv.visitor_id IS NOT NULL)::BIGINT as unique_visitors
  FROM public.page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
  GROUP BY DATE_TRUNC('day', pv.created_at)::DATE
  ORDER BY day ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_pageview_stats_range(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pageview_top_pages_range(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pageview_sources_range(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pageview_daily_range(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
