import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://dijitalstok.com';

// Supabase configuration
// Note: For Vercel, set SUPABASE_SERVICE_ROLE_KEY in environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://wkqsvmvkobbybrrosvyv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client with service role key (bypasses RLS)
// If service role key is not available, this will fail gracefully
const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Format date to ISO 8601
function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

// Generate XML sitemap
function generateSitemap(urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>): string {
  const urlEntries = urls
    .map(
      (url) => `    <url>
      <loc>${escapeXml(url.loc)}</loc>
      <lastmod>${url.lastmod}</lastmod>
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: any, res: any) {
  try {
    if (!supabase) {
      res.status(500).json({ 
        error: 'Supabase service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.' 
      });
      return;
    }

    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    // Static pages
    urls.push({
      loc: `${BASE_URL}/`,
      lastmod: formatDate(new Date().toISOString()),
      changefreq: 'daily',
      priority: '1.0',
    });

    urls.push({
      loc: `${BASE_URL}/urunler`,
      lastmod: formatDate(new Date().toISOString()),
      changefreq: 'daily',
      priority: '0.8',
    });

    urls.push({
      loc: `${BASE_URL}/kategoriler`,
      lastmod: formatDate(new Date().toISOString()),
      changefreq: 'weekly',
      priority: '0.8',
    });

    urls.push({
      loc: `${BASE_URL}/blog`,
      lastmod: formatDate(new Date().toISOString()),
      changefreq: 'daily',
      priority: '0.8',
    });

    // Fetch blog posts (published only)
    try {
      const { data: blogPosts, error: blogError } = await supabase!
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .not('slug', 'is', null);

      if (!blogError && blogPosts) {
        blogPosts.forEach((post) => {
          if (post.slug) {
            urls.push({
              loc: `${BASE_URL}/blog/${post.slug}`,
              lastmod: formatDate(post.updated_at),
              changefreq: 'weekly',
              priority: '0.7',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Continue even if blog posts fail
    }

    // Fetch products
    try {
      const { data: products, error: productsError } = await supabase!
        .from('products')
        .select('slug, updated_at')
        .not('slug', 'is', null);

      if (!productsError && products) {
        products.forEach((product) => {
          if (product.slug) {
            urls.push({
              loc: `${BASE_URL}/urun/${product.slug}`,
              lastmod: formatDate(product.updated_at),
              changefreq: 'weekly',
              priority: '0.7',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Continue even if products fail
    }

    // Fetch categories
    try {
      const { data: categories, error: categoriesError } = await supabase!
        .from('categories')
        .select('slug, updated_at')
        .not('slug', 'is', null);

      if (!categoriesError && categories) {
        categories.forEach((category) => {
          if (category.slug) {
            urls.push({
              loc: `${BASE_URL}/kategori/${category.slug}`,
              lastmod: formatDate(category.updated_at),
              changefreq: 'weekly',
              priority: '0.8',
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Continue even if categories fail
    }

    // Generate XML
    const sitemap = generateSitemap(urls);

    // Set headers and return XML
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

