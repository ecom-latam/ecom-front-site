'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import styles from './ImageMagnifier.module.scss';

const LENS_SIZE = 180;
const ZOOM = 2.5;

interface ImageMagnifierProps {
  src: string;
  alt: string;
}

export function ImageMagnifier({ src, alt }: ImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  let lensStyle: React.CSSProperties | undefined;
  const rect = containerRef.current?.getBoundingClientRect();

  if (cursor && rect && naturalSize) {
    // La imagen visible usa object-fit: contain (se ve completa, "maximizada",
    // sin recortar) -- por eso puede quedar con barras vacías a los costados o
    // arriba/abajo si el contenedor no tiene la misma proporción que la foto.
    // Hay que descontar esas barras para que la lupa apunte al pixel correcto
    // de la foto real, no del contenedor.
    const scale = Math.min(rect.width / naturalSize.w, rect.height / naturalSize.h);
    const displayedW = naturalSize.w * scale;
    const displayedH = naturalSize.h * scale;
    const offsetX = (rect.width - displayedW) / 2;
    const offsetY = (rect.height - displayedH) / 2;

    const imgRelX = cursor.x - offsetX;
    const imgRelY = cursor.y - offsetY;
    const overImage = imgRelX >= 0 && imgRelX <= displayedW && imgRelY >= 0 && imgRelY <= displayedH;

    if (overImage) {
      lensStyle = {
        left: cursor.x - LENS_SIZE / 2,
        top: cursor.y - LENS_SIZE / 2,
        width: LENS_SIZE,
        height: LENS_SIZE,
        backgroundImage: `url(${src})`,
        backgroundSize: `${displayedW * ZOOM}px ${displayedH * ZOOM}px`,
        backgroundPosition: `${LENS_SIZE / 2 - imgRelX * ZOOM}px ${LENS_SIZE / 2 - imgRelY * ZOOM}px`,
      };
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.root}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursor(null)}
      data-testid="image-magnifier"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="90vw"
        style={{ objectFit: 'contain' }}
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />

      {lensStyle && (
        <div className={styles.lens} data-testid="image-magnifier-lens" style={lensStyle} />
      )}
    </div>
  );
}
