/**
 * Visitor Analytics Tracker
 * 
 * Tracks page views and basic attribution (referrer + utm_source) on the public website.
 * Sends data to /api/track endpoint which writes to Supabase using service role key.
 * 
 * Usage:
 * - Call trackPageView() on route changes
 * - Automatically handles session_id persistence in localStorage
 * - Infers source from referrer if utm_source is not present
 * - Skips tracking for /admin and /go/ routes
 */

const SESSION_ID_KEY = 'visitor_analytics_session_id';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create a session ID from localStorage
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const [sessionId, timestamp] = stored.split('|');
      const now = Date.now();
      
      // Check if session is still valid (within 30 minutes)
      if (timestamp && now - parseInt(timestamp, 10) < SESSION_DURATION) {
        return sessionId;
      }
    }

    // Generate new session ID
    const newSessionId = generateUUID();
    const timestamp = Date.now().toString();
    localStorage.setItem(SESSION_ID_KEY, `${newSessionId}|${timestamp}`);
    return newSessionId;
  } catch (error) {
    console.warn('[visitorAnalytics] Failed to access localStorage:', error);
    // Fallback: generate a session ID that won't persist
    return generateUUID();
  }
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Infer source from referrer domain
 */
function inferSourceFromReferrer(referrer: string | null): string {
  if (!referrer) {
    return 'direct';
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return 'facebook';
    }
    if (hostname.includes('google.com') || hostname.includes('google.')) {
      return 'google';
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    }
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    }
    if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    }
    
    // If referrer exists but doesn't match known sources, return 'referral'
    return 'referral';
  } catch {
    return 'direct';
  }
}

/**
 * Track a page view
 * @param path - Full path including query string (e.g., "/urunler?page=2")
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Skip admin routes
  if (path.startsWith('/admin')) {
    return;
  }

  // Skip redirect routes
  if (path.startsWith('/go/')) {
    return;
  }

  // Get session ID
  const sessionId = getOrCreateSessionId();
  if (!sessionId) {
    console.warn('[visitorAnalytics] Failed to get session ID');
    return;
  }

  // Get referrer
  const referrer = document.referrer || null;

  // Parse UTM parameters from current URL
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmCampaign = urlParams.get('utm_campaign');

  // Determine source: utm_source > inferred from referrer > direct
  let source = 'direct';
  if (utmSource) {
    source = utmSource.toLowerCase();
  } else if (referrer) {
    source = inferSourceFromReferrer(referrer);
  }

  // Get user agent
  const userAgent = navigator.userAgent || null;

  // Prepare tracking data
  const trackingData = {
    path,
    referrer,
    source,
    campaign: utmCampaign || null,
    session_id: sessionId,
    user_agent: userAgent,
  };

  // Send tracking request (fire-and-forget)
  fetch('/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trackingData),
    keepalive: true, // Ensures request completes even if page unloads
  }).catch((error) => {
    // Silently fail - don't block user experience
    if (import.meta.env.DEV) {
      console.warn('[visitorAnalytics] Failed to track page view:', error);
    }
  });
}
