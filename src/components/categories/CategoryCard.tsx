import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export const CategoryCard = ({
  name,
  slug,
  icon,
  description,
}: CategoryCardProps) => {
  return (
    <Link to={`/kategori/${slug}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 transition-all hover:shadow-lg hover:border-primary hover:-translate-y-1">
        {/* Icon */}
        <div className="mb-4 text-4xl">
          {icon || "📁"}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
};
