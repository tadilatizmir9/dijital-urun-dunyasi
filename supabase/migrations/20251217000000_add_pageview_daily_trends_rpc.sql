-- RPC Function: Get daily page view trends
CREATE OR REPLACE FUNCTION public.get_pageview_daily_trends(days INTEGER DEFAULT 7)
RETURNS TABLE (
  date DATE,
  total_views BIGINT,
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
  
  cutoff_date := NOW() - (days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    DATE(pv.created_at) as date,
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT pv.visitor_id)::BIGINT as unique_visitors
  FROM public.page_views pv
  WHERE pv.created_at >= cutoff_date
    AND pv.visitor_id IS NOT NULL
  GROUP BY DATE(pv.created_at)
  ORDER BY date ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_pageview_daily_trends(INTEGER) TO authenticated;
