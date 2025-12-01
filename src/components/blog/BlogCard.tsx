import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
  created_at?: string;
}

export const BlogCard = ({
  slug,
  title,
  excerpt,
  cover_image,
  created_at,
}: BlogCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card border border-border transition-all hover:shadow-lg hover:border-primary/50">
      {/* Image */}
      <Link to={`/blog/${slug}`} className="block aspect-[16/9] overflow-hidden bg-muted">
        {cover_image ? (
          <img
            src={cover_image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Date */}
        {created_at && (
          <p className="text-xs font-medium text-muted-foreground">
            {new Date(created_at).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {/* Title */}
        <Link to={`/blog/${slug}`}>
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Button */}
        <Link to={`/blog/${slug}`}>
          <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent hover:text-primary">
            Devamını oku →
          </Button>
        </Link>
      </div>
    </div>
  );
};
