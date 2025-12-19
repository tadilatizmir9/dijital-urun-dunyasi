-- Click events tablosu
CREATE TABLE IF NOT EXISTS public.redirect_click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redirect_id UUID NOT NULL REFERENCES public.redirects(id) ON DELETE CASCADE,
  product_id UUID NULL REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_redirect_click_events_redirect_id ON public.redirect_click_events(redirect_id);
CREATE INDEX IF NOT EXISTS idx_redirect_click_events_created_at ON public.redirect_click_events(created_at);
CREATE INDEX IF NOT EXISTS idx_redirect_click_events_product_id ON public.redirect_click_events(product_id);

-- Redirects tablosuna link health alanları ekle
ALTER TABLE public.redirects
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS last_status_code INTEGER NULL,
  ADD COLUMN IF NOT EXISTS last_error TEXT NULL;

-- RLS politikaları
ALTER TABLE public.redirect_click_events ENABLE ROW LEVEL SECURITY;

-- Herkes click events okuyabilir (analytics için)
CREATE POLICY "Herkes click events görüntüleyebilir"
  ON public.redirect_click_events FOR SELECT
  USING (true);

-- Service role ile insert yapılacak (edge function'dan)
-- Anonim insert için policy (edge function service role kullanıyorsa gerekmez)
-- Ama güvenlik için sadece service role insert yapabilir şekilde bırakıyoruz

