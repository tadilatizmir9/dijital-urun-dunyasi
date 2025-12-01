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
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border transition-all hover:shadow-lg hover:border-primary/50">
      {/* Image */}
      <Link to={`/urun/${id}`} className="block aspect-[4/3] overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category */}
        {category && (
          <p className="text-xs font-medium text-muted-foreground">{category}</p>
        )}

        {/* Title */}
        <Link to={`/urun/${id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Button */}
        <Link to={`/urun/${id}`}>
          <Button className="w-full rounded-full" size="sm">
            İncele
          </Button>
        </Link>
      </div>
    </div>
  );
};
