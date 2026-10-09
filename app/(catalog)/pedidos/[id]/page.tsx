'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

import { getAccessTokenRole } from '@/utils/helpers';
import { orders } from '@/utils/api/orders';
import type { Order } from '@/utils/api/orders';
import { pageInfo } from '@/utils/api/pageInfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCurrentOrderRequest, clearCurrentOrder } from '@/store/orders/ordersSlice';
import { Badge, Text, Modal } from 'zoui';
import { usePageConfig } from '@/context/PageConfigContext';
import { formatPrice } from '@/lib/format';
import { StoreButton } from '@/components/ui/StoreButton';
import type { BadgeTone } from 'zoui';

const STATUS_LABEL: Record<string, string> = {
  new:        'Nuevo',
  notified:   'Transferencia enviada',
  confirmed:  'Confirmado',
  processing: 'En preparación',
  shipped:    'Enviado',
  ready:      'Listo para retirar',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

const STATUS_TONE: Record<string, BadgeTone> = {
  new:        'neutral',
  notified:   'warning',
  confirmed:  'info',
  processing: 'warning',
  shipped:    'info',
  ready:      'info',
  delivered:  'success',
  cancelled:  'danger',
};

const PAYMENT_NOTE: Record<string, string | null> = {
  pending:     null,
  in_progress: 'Transferencia notificada — el vendedor verificará el pago.',
  paid:        null,
  failed:      null,
};

interface TransferData {
  transfer_info?: string;
  transfer_cbu?: string;
  transfer_alias?: string;
  transfer_bank?: string;
  transfer_owner?: string;
  transfer_cuit?: string;
}

function TransferInfo({ store }: { store: TransferData }) {
  const fields = [
    { label: 'CBU',     value: store.transfer_cbu },
    { label: 'Alias',   value: store.transfer_alias },
    { label: 'Banco',   value: store.transfer_bank },
    { label: 'Titular', value: store.transfer_owner },
    { label: 'CUIT',    value: store.transfer_cuit },
  ].filter((f) => f.value);

  if (fields.length > 0) {
    return (
      <div className="zoui-account__transfer">
        <Text variant="body-sm" weight="semibold" className="zoui-account__transfer-title">
          Datos para transferir:
        </Text>
        <dl className="zoui-account__transfer-list">
          {fields.map((f) => (
            <>
              <dt key={`dt-${f.label}`}>{f.label}</dt>
              <dd key={`dd-${f.label}`}>{f.value}</dd>
            </>
          ))}
        </dl>
      </div>
    );
  }

  if (store.transfer_info) {
    return (
      <div className="zoui-account__transfer">
        <Text variant="body-sm" weight="semibold" className="zoui-account__transfer-title">Datos para transferir:</Text>
        <Text variant="body-sm" className="zoui-account__pre">{store.transfer_info}</Text>
      </div>
    );
  }

  return null;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { hasPurchases, store: pageStore } = usePageConfig();
  const currency = pageStore?.currency;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { current: reduxOrder, currentLoading } = useAppSelector((s) => s.orders);
  const initialized = useRef(false);

  const [order, setOrder]           = useState<Order | null>(null);
  const [storeInfo, setStoreInfo]   = useState<TransferData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal]   = useState<'notify' | 'cancel' | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [voucher, setVoucher]       = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);

  useEffect(() => {
    const role = getAccessTokenRole();
    if (!role) { router.replace('/iniciar-sesion'); return; }
    if (role !== 'Customer') { router.replace('/productos'); return; }
    // EC-559: sitios sin el modulo de compras no tienen pedidos.
    if (hasPurchases === false) { router.replace('/productos'); return; }

    initialized.current = false;
    dispatch(clearCurrentOrder());
    dispatch(fetchCurrentOrderRequest(id));

    pageInfo.getPublic<{ store?: TransferData }>()
      .then((res) => setStoreInfo(res.data?.store ?? null))
      .catch(() => setStoreInfo(null));
  }, [id, router, hasPurchases, dispatch]);

  useEffect(() => {
    if (initialized.current || currentLoading || reduxOrder === null) return;
    initialized.current = true;
    setOrder(reduxOrder);
    setLoading(false);
  }, [reduxOrder, currentLoading]);

  function handleVoucherChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVoucher(file);
    if (voucherPreview) URL.revokeObjectURL(voucherPreview);
    setVoucherPreview(file ? URL.createObjectURL(file) : null);
  }

  function openNotifyModal() {
    setVoucher(null);
    setVoucherPreview(null);
    setConfirmModal('notify');
  }

  async function handleNotifyPayment() {
    setActionLoading(true);
    setError(null);
    try {
      const { data } = await orders.notifyPayment(id, voucher);
      setOrder(data);
      setConfirmModal(null);
      setVoucher(null);
      setVoucherPreview(null);
    } catch {
      setError('No se pudo notificar el pago. Intentá de nuevo.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    setError(null);
    try {
      const { data } = await orders.cancel(id);
      setOrder(data);
      setConfirmModal(null);
    } catch {
      setError('No se pudo cancelar el pedido. Intentá de nuevo.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="zoui-account">
        <div className="zoui-account__container">
          <div className="zoui-account__skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="zoui-account__skeleton-item zoui-account__skeleton-item--tall" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="zoui-account">
        <div className="zoui-account__container zoui-account__container--center">
          <Text variant="body" color="muted">Pedido no encontrado.</Text>
          <StoreButton size="md" className="zoui-account__after" onClick={() => router.push('/mis-pedidos')}>
            Mis pedidos
          </StoreButton>
        </div>
      </main>
    );
  }

  const canNotify   = order.paymentStatus === 'pending' && order.status === 'new';
  const canCancel   = order.paymentStatus !== 'paid' && !['cancelled', 'delivered'].includes(order.status);
  const paymentNote = PAYMENT_NOTE[order.paymentStatus];
  const hasTransferData = storeInfo && (
    storeInfo.transfer_cbu || storeInfo.transfer_alias || storeInfo.transfer_bank ||
    storeInfo.transfer_owner || storeInfo.transfer_cuit || storeInfo.transfer_info
  );

  return (
    <main className="zoui-account">
      <div className="zoui-account__container">
        <button className="zoui-account__back" onClick={() => router.push('/mis-pedidos')}>
          ← Mis pedidos
        </button>

        <div className="zoui-account__heading">
          <Text variant="heading-2" className="zoui-account__title">Pedido #{order.orderNumber}</Text>
          <Badge tone={STATUS_TONE[order.status]} variant="pill">{STATUS_LABEL[order.status]}</Badge>
        </div>

        {error && (
          <div className="zoui-account__alert zoui-account__alert--error">
            <Text variant="body-sm">{error}</Text>
          </div>
        )}

        <div className="zoui-account__stack">

          {/* Items */}
          <section className="zoui-account__card zoui-account__card--padded">
            <Text variant="heading-3" className="zoui-account__card-title zoui-account__card-title--roomy">Productos</Text>
            <ul className="zoui-account__items">
              {order.items.map((item, idx) => (
                <li key={idx} className="zoui-account__item">
                  <div className="zoui-account__thumb">
                    {item.image ? <Image src={item.image} alt={item.name} width={56} height={56} /> : '□'}
                  </div>
                  <div className="zoui-account__row-main">
                    <Text variant="body-sm" weight="medium">{item.name}</Text>
                    {Object.keys(item.selectedOptions).length > 0 && (
                      <Text variant="caption" color="muted">
                        {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </Text>
                    )}
                    <Text variant="caption" color="muted">x{item.quantity} · {formatPrice(item.price, currency)} c/u</Text>
                  </div>
                  <Text variant="body-sm" weight="semibold">{formatPrice(item.subtotal, currency)}</Text>
                </li>
              ))}
            </ul>
            <div className="zoui-account__total">
              <Text variant="body" weight="semibold">Total</Text>
              <Text variant="body" weight="semibold">{formatPrice(order.total, currency)}</Text>
            </div>
          </section>

          {/* Shipping */}
          <section className="zoui-account__card zoui-account__card--padded">
            <Text variant="heading-3" className="zoui-account__card-title">Envío</Text>
            <Text variant="body-sm">{order.shippingAddress.fullName}</Text>
            <Text variant="body-sm">{order.shippingAddress.phone}</Text>
            <Text variant="body-sm">{order.shippingAddress.address}</Text>
            <Text variant="body-sm">{order.shippingAddress.city}, {order.shippingAddress.province}{order.shippingAddress.zip ? ` (${order.shippingAddress.zip})` : ''}</Text>
          </section>

          {/* Payment */}
          <section className="zoui-account__card zoui-account__card--padded">
            <Text variant="heading-3" className="zoui-account__card-title">Pago</Text>
            <Text variant="body-sm">Método: Transferencia bancaria</Text>

            {paymentNote && (
              <Text variant="body-sm" color="muted" className="zoui-account__note">{paymentNote}</Text>
            )}

            {order.paymentProofUrl && order.paymentStatus !== 'pending' && (
              <div className="zoui-account__proof">
                <Text variant="body-sm" color="muted">Comprobante adjunto:</Text>
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                  <Image src={order.paymentProofUrl} alt="Comprobante de transferencia" width={120} height={80} />
                </a>
              </div>
            )}

            {order.paymentStatus === 'pending' && hasTransferData && (
              <TransferInfo store={storeInfo!} />
            )}
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="zoui-account__card zoui-account__card--padded">
              <Text variant="heading-3" className="zoui-account__card-title zoui-account__card-title--tight">Notas</Text>
              <Text variant="body-sm" color="muted">{order.notes}</Text>
            </section>
          )}

          {/* Actions */}
          {(canNotify || canCancel) && (
            <div className="zoui-account__actions">
              {canNotify && (
                <StoreButton size="md" onClick={openNotifyModal} disabled={actionLoading}>
                  Ya transferí
                </StoreButton>
              )}
              {canCancel && (
                <StoreButton
                  emphasis="outlined"
                  size="md"
                  onClick={() => setConfirmModal('cancel')}
                  disabled={actionLoading}
                  className="zoui-account__danger"
                >
                  Cancelar pedido
                </StoreButton>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Notify payment modal */}
      <Modal open={confirmModal === 'notify'} size="sm" onClose={() => !actionLoading && setConfirmModal(null)}>
        <Modal.Header>Confirmar pago</Modal.Header>
        <Modal.Body>
          <Text variant="body-sm" className="zoui-account__lead">
            ¿Confirmás que ya realizaste la transferencia? El vendedor la verificará y confirmará tu pedido.
          </Text>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleVoucherChange}
          />

          {voucherPreview ? (
            <div className="zoui-account__voucher">
              <Image src={voucherPreview} alt="Comprobante" width={72} height={72} />
              <div>
                <Text variant="caption" color="muted">{voucher?.name}</Text>
                <button
                  onClick={() => { setVoucher(null); setVoucherPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="zoui-account__link-danger"
                >
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="zoui-account__attach"
            >
              + Adjuntar comprobante (opcional)
            </button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <StoreButton emphasis="ghost" size="md" onClick={() => setConfirmModal(null)} disabled={actionLoading}>
            Cancelar
          </StoreButton>
          <StoreButton size="md" onClick={handleNotifyPayment} disabled={actionLoading}>
            {actionLoading ? 'Enviando...' : 'Sí, ya transferí'}
          </StoreButton>
        </Modal.Footer>
      </Modal>

      {/* Cancel modal */}
      <Modal open={confirmModal === 'cancel'} size="sm" onClose={() => setConfirmModal(null)}>
        <Modal.Header>Cancelar pedido</Modal.Header>
        <Modal.Body>
          <Text variant="body-sm">
            ¿Estás seguro de que querés cancelar este pedido? Esta acción no se puede deshacer.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <StoreButton emphasis="ghost" size="md" onClick={() => setConfirmModal(null)} disabled={actionLoading}>
            Volver
          </StoreButton>
          <StoreButton
            size="md"
            onClick={handleCancel}
            disabled={actionLoading}
            className="zoui-account__danger-filled"
          >
            {actionLoading ? 'Cancelando...' : 'Cancelar pedido'}
          </StoreButton>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
