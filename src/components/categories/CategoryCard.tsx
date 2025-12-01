import { Link } from "react-router-dom";
import { 
  Palette, 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  Wand2, 
  Layers,
  Package,
  Zap
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

const iconMap: Record<string, any> = {
  "🎨": Palette,
  "✨": Sparkles,
  "🖼️": ImageIcon,
  "📝": FileText,
  "🪄": Wand2,
  "📦": Package,
  "⚡": Zap,
  "🎭": Layers,
};

const getIconComponent = (icon?: string) => {
  if (!icon) return Package;
  return iconMap[icon] || Package;
};

export const CategoryCard = ({
  name,
  slug,
  icon,
  description,
}: CategoryCardProps) => {
  const IconComponent = getIconComponent(icon);
  
  return (
    <Link to={`/kategori/${slug}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border p-8 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        {/* Icon */}
        <div className="relative mb-5 inline-flex p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <IconComponent className="h-7 w-7" strokeWidth={2.5} />
        </div>

        {/* Name */}
        <h3 className="relative font-black text-xl text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="relative text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Hover indicator */}
        <div className="relative mt-5 flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          Keşfet
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
