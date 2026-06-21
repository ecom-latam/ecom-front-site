'use client';

import Image from 'next/image';

interface GalleryImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const mainImage = images.find((img) => img.isMain) ?? images[0];
  const secondaryImages = images.filter((img) => img !== mainImage);

  return (
    <div className="flex flex-col gap-3" data-testid="product-gallery">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'var(--color-bg-subtle)',
          aspectRatio: '4 / 5',
          position: 'relative',
        }}
      >
        {mainImage ? (
          <Image
            key={mainImage.publicId}
            src={mainImage.url}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            data-testid="product-gallery-main-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl" style={{ color: 'var(--color-fg-disabled)' }}>
            □
          </div>
        )}
      </div>

      {secondaryImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {secondaryImages.map((img, i) => (
            <div
              key={img.publicId}
              className="flex-shrink-0 rounded-md overflow-hidden"
              style={{
                width: '72px',
                height: '90px',
                background: 'var(--color-bg-subtle)',
                position: 'relative',
              }}
            >
              <Image
                src={img.url}
                alt={`${productName} ${i + 2}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
