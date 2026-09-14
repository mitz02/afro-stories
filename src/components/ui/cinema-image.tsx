"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CinemaImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  gradient?: string;
  priority?: boolean;
  sizes?: string;
  fallbackText?: string;
  quality?: number;
}

/**
 * Image with cinematic gradient overlay + graceful fallback.
 * If src is undefined or fails to load, renders the gradient/pattern treatment.
 */
export function CinemaImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  gradient,
  priority,
  sizes,
  fallbackText,
  quality = 80,
}: CinemaImageProps) {
  const [error, setError] = useState(false);
  const showImage = !!src && !error;
  const useFill = !!(fill || !width || !height);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-purple-deep via-charcoal-raised to-black",
        fill ? "h-full w-full" : "",
        className
      )}
    >
      {showImage && (
        <Image
          src={src as string}
          alt={alt}
          width={useFill ? undefined : width}
          height={useFill ? undefined : height}
          fill={useFill}
          className={cn(
            "object-cover",
            gradient && "[mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]"
          )}
          sizes={sizes}
          priority={priority}
          quality={quality}
          onError={() => setError(true)}
        />
      )}
      {gradient && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-b",
            gradient
          )}
        />
      )}
      {!showImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackText ? (
            <span className="font-display text-2xl font-bold text-white/20">
              {fallbackText}
            </span>
          ) : (
            <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-gold/60 animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}