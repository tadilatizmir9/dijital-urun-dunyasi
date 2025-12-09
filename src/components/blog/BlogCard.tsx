import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  created_at?: string;
  category?: string;
  tags?: string[];
}

export const BlogCard = ({
  slug,
  title,
  excerpt,
  cover_image,
  created_at,
  category,
  tags,
}: BlogCardProps) => {
  return (
    <div className="group overflow-hidden rounded-3xl bg-card border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/blog/${slug}`} className="block aspect-[16/9] overflow-hidden bg-muted relative">
        {cover_image ? (
          <img
            src={cover_image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <span className="text-5xl animate-float">📝</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground">
              {category}
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Date */}
        {created_at && (
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {new Date(created_at).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {/* Title */}
        <Link to={`/blog/${slug}`}>
          <h3 className="font-bold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Button */}
        <Link to={`/blog/${slug}`}>
          <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent text-primary font-semibold group-hover:translate-x-1 transition-transform duration-200">
            Devamını oku →
          </Button>
        </Link>
      </div>
    </div>
  );
};
