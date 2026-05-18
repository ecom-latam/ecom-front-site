export type TriggeredBy = 'auto' | 'buyer' | 'admin' | 'webhook';

export interface Step {
  status: string;
  label: string;
  triggeredBy: TriggeredBy;
}

export const STEPS = {
  NEW:        { status: 'new',        label: 'Pedido recibido',       triggeredBy: 'auto'  } as Step,
  NOTIFIED:   { status: 'notified',   label: 'Transferencia enviada', triggeredBy: 'buyer' } as Step,
  CONFIRMED:  { status: 'confirmed',  label: 'Pago confirmado',       triggeredBy: 'admin' } as Step,
  PROCESSING: { status: 'processing', label: 'En preparación',        triggeredBy: 'admin' } as Step,
  SHIPPED:    { status: 'shipped',    label: 'Enviado',               triggeredBy: 'admin' } as Step,
  READY:      { status: 'ready',      label: 'Listo para retirar',    triggeredBy: 'admin' } as Step,
  DELIVERED:  { status: 'delivered',  label: 'Entregado',             triggeredBy: 'admin' } as Step,
  PICKED_UP:  { status: 'delivered',  label: 'Retirado',              triggeredBy: 'admin' } as Step,
  // WEBHOOK_CONFIRMED: { status: 'confirmed', label: 'Pago confirmado', triggeredBy: 'webhook' } as Step,
};

export const WORKFLOWS: Record<string, Step[]> = {
  'transfer:delivery': [
    STEPS.NEW, STEPS.NOTIFIED, STEPS.CONFIRMED, STEPS.PROCESSING, STEPS.SHIPPED, STEPS.DELIVERED,
  ],
  'transfer:pickup': [
    STEPS.NEW, STEPS.NOTIFIED, STEPS.CONFIRMED, STEPS.READY, STEPS.PICKED_UP,
  ],
  // 'mercadopago:delivery': [STEPS.NEW, STEPS.WEBHOOK_CONFIRMED, STEPS.PROCESSING, STEPS.SHIPPED, STEPS.DELIVERED],
  // 'mercadopago:pickup': [STEPS.NEW, STEPS.WEBHOOK_CONFIRMED, STEPS.READY, STEPS.PICKED_UP],
};

export function getWorkflow(paymentMethod: string, shippingMethod: string): Step[] | null {
  return WORKFLOWS[`${paymentMethod}:${shippingMethod}`] ?? null;
}

export function getCurrentStep(paymentMethod: string, shippingMethod: string, currentStatus: string): Step | null {
  const workflow = getWorkflow(paymentMethod, shippingMethod);
  if (!workflow) return null;
  return workflow.find((s) => s.status === currentStatus) ?? null;
}

export function getAllowedNextStatuses(paymentMethod: string, shippingMethod: string, currentStatus: string): string[] {
  const workflow = getWorkflow(paymentMethod, shippingMethod);
  if (!workflow) return [];
  const idx = workflow.findIndex((s) => s.status === currentStatus);
  if (idx === -1 || idx === workflow.length - 1) return [];
  return [workflow[idx + 1].status];
}

export function getNextAdminStatuses(paymentMethod: string, shippingMethod: string, currentStatus: string): string[] {
  const workflow = getWorkflow(paymentMethod, shippingMethod);
  if (!workflow) return [];
  const idx = workflow.findIndex((s) => s.status === currentStatus);
  if (idx === -1 || idx === workflow.length - 1) return [];
  const next = workflow[idx + 1];
  if (next.triggeredBy !== 'admin') return [];
  // 'confirmed' is only reachable via the confirmPayment endpoint
  if (next.status === 'confirmed') return [];
  return [next.status];
}

export function getStepLabel(paymentMethod: string, shippingMethod: string, status: string): string {
  const workflow = getWorkflow(paymentMethod, shippingMethod);
  if (!workflow) return status;
  return workflow.find((s) => s.status === status)?.label ?? status;
}
