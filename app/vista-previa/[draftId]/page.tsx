import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDraftBlocks } from '@/lib/api/storeClient';
import { DraftPreview } from '@/components/catalog/DraftPreview';

export const metadata: Metadata = { title: 'Vista previa', robots: { index: false, follow: false } };

interface Props {
  params: { draftId: string };
}

// Vista previa de unos bloques que todavia no son una pagina: los dibuja con el theme y el modo del sitio, sin menu ni
// pie, para que el asistente le saque una captura (ecom-render) y se la muestre al vendedor. Vive fuera de (catalog):
// no pasa por el modo mantenimiento ni dibuja la barra superior.
export default async function DraftPreviewRoute({ params }: Props) {
  const blocks = await getDraftBlocks(params.draftId);
  if (!blocks) notFound();
  return <DraftPreview blocks={blocks} />;
}
