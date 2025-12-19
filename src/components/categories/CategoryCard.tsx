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
    <Link to={`/kategori/${slug}`} className="block h-full">
      <div className="group h-full flex flex-col relative overflow-hidden rounded-2xl bg-card border-2 border-border p-6 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 min-h-[170px]">
        {/* Icon */}
        <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <IconComponent className="h-6 w-6" strokeWidth={2.5} />
        </div>

        {/* Name - max 1 satır */}
        <h3 className="relative font-black text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {name}
        </h3>

        {/* Description - max 2 satır */}
        {description && (
          <p className="relative text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Hover indicator - mt-auto ile alta sabit */}
        <div className="relative mt-auto pt-4 flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          Keşfet
          <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};
