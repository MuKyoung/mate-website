'use client';

import { useState } from 'react';
import Image from 'next/image';
import ThumbFallback from '@/components/ThumbFallback';

interface SafeImageProps {
  src: string | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: React.ReactNode;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export default function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  placeholder,
  objectFit = 'cover',
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className={className}>
        {placeholder || <div className="relative w-full h-full"><ThumbFallback /></div>}
      </div>
    );
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-[var(--surface)] animate-pulse z-10" />
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={
            objectFit === 'cover' ? 'object-cover' :
            objectFit === 'contain' ? 'object-contain' :
            objectFit === 'fill' ? 'object-fill' :
            objectFit === 'none' ? 'object-none' :
            'object-scale-down'
          }
          style={{ objectFit }}
          unoptimized
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className={
            objectFit === 'cover' ? 'object-cover' :
            objectFit === 'contain' ? 'object-contain' :
            objectFit === 'fill' ? 'object-fill' :
            objectFit === 'none' ? 'object-none' :
            'object-scale-down'
          }
          style={{ objectFit }}
          unoptimized
          onError={() => setImageError(true)}
          onLoad={() => setImageLoading(false)}
        />
      )}
    </div>
  );
}

