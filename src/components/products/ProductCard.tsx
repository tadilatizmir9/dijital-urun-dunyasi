import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
    <Link 
      to={`/urun/${id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple/50">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple/5 to-secondary/5">
              <span className="text-5xl animate-float">📦</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Category */}
          {category && (
            <p className="text-xs font-semibold text-purple uppercase tracking-wider">{category}</p>
          )}

          {/* Title - 1 satır */}
          <h3 className="font-semibold text-[17px] text-foreground line-clamp-1 group-hover:text-purple transition-colors duration-200 leading-tight">
            {title}
          </h3>

          {/* Description - 2 satır */}
          {description && (
            <p className="text-[14px] text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Tags - pill stil */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Button */}
          <div className="pt-2">
            <Button 
              className="w-full rounded-full font-semibold bg-purple hover:bg-purple/90 text-purple-foreground transition-all duration-300 group/btn" 
              size="sm"
            >
              İncele
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
