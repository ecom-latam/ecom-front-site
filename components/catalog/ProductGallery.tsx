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
    <div className="zoui-product__gallery" data-testid="product-gallery">
      {selectedImage ? (
        <button
          type="button"
          className="zoui-product__image"
          onClick={() => setLightboxOpen(true)}
          data-testid="product-gallery-main-image-button"
        >
          <Image
            key={selectedImage.publicId}
            src={selectedImage.url}
            alt={selectedImage.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            data-testid="product-gallery-main-image"
          />
        </button>
      ) : (
        <div className="zoui-product__image zoui-product__image--empty">□</div>
      )}

      {images.length > 1 && (
        <div className="zoui-product__thumbs">
          {images.map((img, i) => (
            <button
              key={img.publicId}
              type="button"
              className={`zoui-product__thumb${img.publicId === selectedImage?.publicId ? ' zoui-product__thumb--active' : ''}`}
              data-testid="product-gallery-thumbnail"
              aria-current={img.publicId === selectedImage?.publicId}
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="72px"
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
            <ImageMagnifier src={selectedImage.url} alt={selectedImage.alt || productName} />
          </div>
        </Modal>
      )}
    </div>
  );
}
