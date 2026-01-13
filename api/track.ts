import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[track] Missing required environment variables');
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Helper to get client IP from headers
function getClientIp(req: any): string | null {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (typeof forwardedFor === 'string') {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  return null;
}

// Sanitize and validate input
function sanitizeString(value: string | undefined, maxLength: number = 500): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) return trimmed.substring(0, maxLength);
  return trimmed;
}

// Validate path
function validatePath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/')) return false;
  if (path.length > 500) return false;
  return true;
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Supabase is configured
  if (!supabase) {
    console.error('[track] Supabase not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Parse and validate request body
    const body = req.body;
    
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const path = body.path;
    if (!validatePath(path)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Sanitize inputs
    const referrer = sanitizeString(body.referrer);
    const source = sanitizeString(body.source, 100);
    const campaign = sanitizeString(body.campaign, 200);
    const sessionId = sanitizeString(body.session_id, 100);
    const userAgent = sanitizeString(body.user_agent, 500);
    const title = sanitizeString(body.title, 500);
    
    if (!sessionId) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    // Handle visitor_id: validate UUID v4 format, set to null if invalid or missing
    let visitorId: string | null = null;
    const rawVisitorId = sanitizeString(body.visitor_id, 100);
    if (rawVisitorId) {
      // Validate UUID v4 format
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidV4Regex.test(rawVisitorId)) {
        visitorId = rawVisitorId;
      } else {
        // Invalid format, set to null (don't fail the request)
        console.warn('[track] Invalid visitor_id format, setting to null:', rawVisitorId);
      }
    }

    // Get client IP
    const ip = getClientIp(req);

    // Insert into page_views table
    const { error: insertError } = await supabase
      .from('page_views')
      .insert({
        path,
        referrer,
        source,
        campaign,
        session_id: sessionId,
        visitor_id: visitorId,
        user_agent: userAgent,
        title,
        ip,
      });

    if (insertError) {
      console.error('[track] Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to track page view' });
    }

    // Return 204 No Content on success
    return res.status(204).end();
} catch (error: any) {
    console.error("TRACK ERROR:", error);
    return res.status(500).json({
      error: "Failed to track page view",
      details: error?.message || error
    });
  }
}
