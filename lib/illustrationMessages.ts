export const ILLUSTRATION_MESSAGES = {
  'no-products': {
    image:       '/illustrations/products-loading.webp',
    title:       'Estamos cargando los productos',
    description: 'Volvé pronto, viene algo bueno.',
  },
  'under-construction': {
    image:       '/illustrations/construction-workers.webp',
    title:       'Estamos armando esta página',
    description: 'Volvé pronto, viene algo bueno.',
  },
} as const;

export type IllustrationMessageKey = keyof typeof ILLUSTRATION_MESSAGES;
