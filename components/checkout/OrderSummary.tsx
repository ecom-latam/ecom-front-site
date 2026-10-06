import Image from 'next/image';
import { Text } from 'zoui';
import type { PaymentMethod } from '@/utils/api/orders';
import type { Currency } from '@/context/PageConfigContext';
import { StoreButton } from '@/components/ui/StoreButton';
import { formatPrice } from '@/lib/format';

interface CartItem {
  _id:      string;
  name:     string;
  image:    string | null;
  price:    number;
  quantity: number;
}

interface OrderSummaryProps {
  items:         CartItem[];
  subtotal:      number;
  currency:      Currency | undefined;
  error:         string | null;
  submitting:    boolean;
  paymentMethod: PaymentMethod;
  onSubmit:      () => void;
}

export function OrderSummary({ items, subtotal, currency, error, submitting, paymentMethod, onSubmit }: OrderSummaryProps) {
  return (
    <div className="zoui-checkout__summary">
      <section className="zoui-checkout__card">
        <Text variant="heading-3" className="zoui-checkout__card-title">Resumen del pedido</Text>

        <ul className="zoui-checkout__summary-list">
          {items.map((item) => (
            <li key={item._id} className="zoui-checkout__summary-item">
              <div className="zoui-checkout__summary-image">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <div className="zoui-checkout__summary-image-empty">□</div>
                )}
              </div>
              <div className="zoui-checkout__summary-info">
                <Text variant="body-sm" weight="medium" truncate>{item.name}</Text>
                <Text variant="caption" color="muted">x{item.quantity}</Text>
              </div>
              <Text variant="body-sm" weight="semibold" style={{ flexShrink: 0 }}>
                {formatPrice(item.price * item.quantity, currency)}
              </Text>
            </li>
          ))}
        </ul>

        <div className="zoui-checkout__summary-subtotal">
          <div className="zoui-checkout__summary-line">
            <Text variant="body-sm" color="muted">Subtotal</Text>
            <Text variant="body-sm">{formatPrice(subtotal, currency)}</Text>
          </div>
          <div className="zoui-checkout__summary-line">
            <Text variant="body-sm" color="muted">Envío</Text>
            <Text variant="body-sm">A coordinar</Text>
          </div>
        </div>

        <div className="zoui-checkout__summary-total">
          <Text variant="body" weight="semibold">Total</Text>
          <Text variant="body" weight="semibold">{formatPrice(subtotal, currency)}</Text>
        </div>

        {error && (
          <div className="zoui-checkout__error">
            <Text variant="body-sm">{error}</Text>
          </div>
        )}

        <StoreButton
          size="md"
          disabled={submitting}
          style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
          onClick={onSubmit}
          data-testid="checkout-submit-btn"
        >
          {submitting ? 'Procesando...' : paymentMethod === 'mp' ? 'Pagar con Mercado Pago' : 'Confirmar pedido'}
        </StoreButton>
      </section>
    </div>
  );
}
