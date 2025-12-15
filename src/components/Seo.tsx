import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
}

const BASE_URL = "https://dijitalstok.com";
const DEFAULT_TITLE = "Dijital Stok | Dijital Ürünler & Stok Kaynaklar";
const DEFAULT_DESCRIPTION = "Envato ve benzeri platformlardan dijital stok ürünleri keşfedin.";

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogTitle,
  ogDescription,
  ogUrl,
}: SeoProps) {
  const location = useLocation();
  
  // Build canonical URL
  const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;
  
  // Use provided OG values or fall back to title/description
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalOgUrl = ogUrl || canonicalUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:url" content={finalOgUrl} />
    </Helmet>
  );
}

