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
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-card to-primary/5 border border-border p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary hover:-translate-y-2">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-300" />
        
        {/* Icon */}
        <div className="relative mb-6 text-5xl animate-float group-hover:scale-110 transition-transform duration-300">
          {icon || "📁"}
        </div>

        {/* Name */}
        <h3 className="relative font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors duration-200 leading-tight">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="relative text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Hover arrow */}
        <div className="relative mt-4 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
          Keşfet →
        </div>
      </div>
    </Link>
  );
};
