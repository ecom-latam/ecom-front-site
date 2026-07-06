'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Modal } from 'zoui';
import { ImageMagnifier } from './ImageMagnifier';
import styles from './ProductGallery.module.scss';

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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | undefined>(mainImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // El array de imágenes cambia por completo al cambiar de variante
  // (ProductDetailSection pasa selectedVariant.images en vez de product.images) —
  // sin este reset, quedaría seleccionada una imagen de la variante anterior.
  useEffect(() => {
    setSelectedImage(images.find((img) => img.isMain) ?? images[0]);
  }, [images]);

  return (
    <div className={styles.root} data-testid="product-gallery">
      {selectedImage ? (
        <button
          type="button"
          className={styles.mainImage}
          style={{
            background: 'var(--color-bg-subtle)',
            aspectRatio: '4 / 5',
            position: 'relative',
            padding: 0,
            border: 0,
            cursor: 'zoom-in',
          }}
          onClick={() => setLightboxOpen(true)}
          data-testid="product-gallery-main-image-button"
        >
          <Image
            key={selectedImage.publicId}
            src={selectedImage.url}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
            priority
            data-testid="product-gallery-main-image"
          />
        </button>
      ) : (
        <div
          className={styles.mainImage}
          style={{
            background: 'var(--color-bg-subtle)',
            aspectRatio: '4 / 5',
            position: 'relative',
          }}
        >
          <div className={styles.emptyPlaceholder} style={{ color: 'var(--color-fg-disabled)' }}>
            □
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, i) => (
            <button
              key={img.publicId}
              type="button"
              className={styles.thumbnail}
              data-testid="product-gallery-thumbnail"
              aria-current={img.publicId === selectedImage?.publicId}
              onClick={() => setSelectedImage(img)}
              style={{
                width: '72px',
                height: '90px',
                background: 'var(--color-bg-subtle)',
                position: 'relative',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <Image
                src={img.url}
                alt={`${productName} ${i + 1}`}
                fill
                sizes="72px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      {selectedImage && (
        <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} className={styles.lightboxModal}>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
            data-testid="product-gallery-lightbox-close"
          >
            ✕
          </button>

          <div className={styles.lightboxImage}>
            <ImageMagnifier src={selectedImage.url} alt={productName} />
          </div>
        </Modal>
      )}
    </div>
  );
}
