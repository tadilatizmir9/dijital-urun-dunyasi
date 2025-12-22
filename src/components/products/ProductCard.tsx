import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardMedia } from "@/components/ui/card-media";
import { ArrowRight, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface ProductCardProps {
  id: string;
  slug?: string | null;
  title: string;
  description?: string;
  image_url?: string;
  tags?: string[];
  category?: string;
}

export const ProductCard = ({
  id,
  slug,
  title,
  description,
  image_url,
  tags,
  category,
}: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  const productPath = `/urun/${slug && slug.trim() ? slug : id}`;

  return (
    <div className="group block relative h-full">
      <Link 
        to={productPath}
        className="block h-full"
      >
        <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple/50 min-h-[360px]">
          {/* Image with CardMedia */}
          <CardMedia
            src={image_url}
            alt={title}
            heightClass="h-[180px] md:h-[220px]"
            roundedClass="rounded-t-2xl"
            fallbackText="📦"
          >
            {/* Favorite Button Overlay */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 pointer-events-auto bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white hover:scale-110 transition-all duration-200 group/fav"
              aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            >
              <Heart 
                className={`h-5 w-5 transition-all duration-200 ${
                  favorite 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-muted-foreground group-hover/fav:text-red-500'
                }`}
              />
            </button>
          </CardMedia>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          <div className="space-y-3">
            {/* Category */}
            {category && (
              <p className="text-xs font-semibold text-purple uppercase tracking-wider">{category}</p>
            )}

            {/* Title - max 2 satır */}
            <h3 className="font-semibold text-[17px] text-foreground line-clamp-2 group-hover:text-purple transition-colors duration-200 leading-tight">
              {title}
            </h3>

            {/* Description - max 2 satır */}
            {description && (
              <p className="text-[14px] text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}

            {/* Tags - tek satır, overflow */}
            {tags && tags.length > 0 && (
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap pt-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="shrink-0 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="shrink-0 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Button - mt-auto ile alta sabit */}
          <div className="mt-auto pt-4">
            <Button 
              className="w-full rounded-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 group/btn" 
              size="sm"
            >
              İncele
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
        </div>
      </Link>
    </div>
  );
};
