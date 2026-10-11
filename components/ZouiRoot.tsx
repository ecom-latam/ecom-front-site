'use client';

import type { ReactNode } from 'react';
import NextLink from 'next/link';
import NextImage from 'next/image';
import { ZouiProvider } from 'zoui';

export function ZouiRoot({ font, children }: { font: string; children: ReactNode }) {
  return <ZouiProvider linkComponent={NextLink} imageComponent={NextImage} font={font}>{children}</ZouiProvider>;
}
