import { useState, ReactNode } from "react";

interface CardMediaProps {
  src?: string | null;
  alt: string;
  heightClass?: string;
  roundedClass?: string;
  fallbackText?: string;
  children?: ReactNode;
  className?: string;
}

export const CardMedia = ({
  src,
  alt,
  heightClass = "h-[180px] md:h-[220px]",
  roundedClass = "rounded-t-2xl",
  fallbackText = "📦",
  children,
  className = "",
}: CardMediaProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTall, setIsTall] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      const ratio = img.naturalWidth / img.naturalHeight;
      // Eğer ratio < 0.6 ise çok dikey görsel, object-cover kullan
      setIsTall(ratio > 0 && ratio < 0.6);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-muted ${heightClass} ${roundedClass} ${className}`}
    >
      {src && !hasError ? (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse z-0" />
          )}

          {/* Background layer - blur backdrop */}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60 z-0"
          />

          {/* Foreground layer - dynamic based on aspect ratio */}
          <div className={`relative z-10 w-full h-full flex items-center justify-center ${isTall ? '' : 'p-2'}`}>
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className={
                isTall
                  ? "w-full h-full object-cover object-top drop-shadow-lg scale-[1.02]"
                  : "max-w-full max-h-full object-contain drop-shadow-lg"
              }
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        </>
      ) : (
        /* Fallback placeholder */
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple/5 to-secondary/5">
          <span className="text-5xl animate-float">{fallbackText}</span>
        </div>
      )}

      {/* Children overlay (for favorite button, badges, etc.) */}
      {children && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="relative w-full h-full">{children}</div>
        </div>
      )}

      {/* Hover gradient overlay - only show on parent group hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
    </div>
  );
};

