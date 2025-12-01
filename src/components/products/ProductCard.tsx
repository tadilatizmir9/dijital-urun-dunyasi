import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  tags?: string[];
  category?: string;
}

export const ProductCard = ({
  id,
  title,
  description,
  image_url,
  tags,
  category,
}: ProductCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/urun/${id}`} className="block aspect-[4/3] overflow-hidden bg-muted relative">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <span className="text-5xl animate-float">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Category */}
        {category && (
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">{category}</p>
        )}

        {/* Title */}
        <Link to={`/urun/${id}`}>
          <h3 className="font-bold text-lg text-foreground line-clamp-2 hover:text-primary transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="rounded-full text-xs font-medium">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Button */}
        <div className="pt-2">
          <Link to={`/urun/${id}`}>
            <Button className="w-full rounded-full font-semibold gradient-primary hover:shadow-glow transition-all duration-300" size="sm">
              İncele
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
