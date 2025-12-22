import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardMedia } from "@/components/ui/card-media";

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
    <div className="group h-full flex flex-col overflow-hidden rounded-3xl bg-card border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1 min-h-[360px]">
      {/* Image with CardMedia */}
      <Link to={`/blog/${slug}`} className="block">
        <CardMedia
          src={cover_image}
          alt={title}
          heightClass="h-[180px] md:h-[220px]"
          roundedClass="rounded-t-3xl"
          fallbackText="📝"
        >
          {/* Category Badge Overlay */}
          {category && (
            <div className="absolute top-3 left-3 pointer-events-auto">
              <Badge className="bg-primary text-primary-foreground">
                {category}
              </Badge>
            </div>
          )}
        </CardMedia>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-3">
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

        {/* Title - max 2 satır */}
        <Link to={`/blog/${slug}`}>
          <h3 className="font-bold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Excerpt - max 2 satır */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Tags - tek satır, overflow */}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs shrink-0">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs shrink-0">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Button - mt-auto ile alta sabit */}
        <div className="mt-auto">
          <Link to={`/blog/${slug}`}>
            <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent text-primary font-semibold group-hover:translate-x-1 transition-transform duration-200">
              Devamını oku →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
