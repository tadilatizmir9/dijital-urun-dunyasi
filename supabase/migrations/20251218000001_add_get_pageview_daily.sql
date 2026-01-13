-- RPC Function: Get daily page view statistics
CREATE OR REPLACE FUNCTION public.get_pageview_daily(days INTEGER DEFAULT 7)
RETURNS TABLE (
  day DATE,
  views BIGINT,
  sessions BIGINT,
  visitors BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  cutoff_date := NOW() - make_interval(days => days);
  
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', pv.created_at)::DATE as day,
    COUNT(*)::BIGINT as views,
    COUNT(DISTINCT pv.session_id)::BIGINT as sessions,
    COUNT(DISTINCT pv.visitor_id) FILTER (WHERE pv.visitor_id IS NOT NULL)::BIGINT as visitors
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
  GROUP BY DATE_TRUNC('day', pv.created_at)::DATE
  ORDER BY day ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_pageview_daily(INTEGER) TO authenticated;
