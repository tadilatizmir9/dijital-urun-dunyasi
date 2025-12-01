CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.products ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL;

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_subcategories_parent ON public.subcategories(parent_category_id);
CREATE INDEX idx_products_subcategory ON public.products(subcategory_id);