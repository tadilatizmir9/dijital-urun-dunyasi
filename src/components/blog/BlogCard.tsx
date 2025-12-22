import { Link } from "react-router-dom";
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
    <div className="group h-full flex flex-col rounded-3xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image - 16:9 aspect ratio, object-contain, no overflow */}
      <Link to={`/blog/${slug}`} className="block">
        <div className="relative aspect-video bg-[#f3f4f6] rounded-t-3xl flex items-center justify-center">
          {cover_image ? (
            <img
              src={cover_image}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-5xl animate-float">📝</span>
          )}
          
          {/* Category Badge Overlay */}
          {category && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground text-xs">
                {category}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-3">
        {/* Category & Date */}
        <div className="flex items-center gap-2 flex-wrap">
          {category && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {category}
            </p>
          )}
          {created_at && (
            <>
              {category && <span className="text-muted-foreground">•</span>}
              <p className="text-xs text-muted-foreground">
                {new Date(created_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </>
          )}
        </div>

        {/* Title - max 2 satır */}
        <Link to={`/blog/${slug}`}>
          <h3 className="font-bold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors duration-200 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Excerpt - max 3 satır */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
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

        {/* CTA Link - mt-auto ile alta sabit */}
        <div className="mt-auto pt-2">
          <Link 
            to={`/blog/${slug}`}
            className="inline-flex items-center text-sm font-semibold text-[#22c55e] hover:text-[#16a34a] transition-colors duration-200 group-hover:translate-x-1 transition-transform duration-200"
          >
            Devamını oku →
          </Link>
        </div>
      </div>
    </div>
  );
};
