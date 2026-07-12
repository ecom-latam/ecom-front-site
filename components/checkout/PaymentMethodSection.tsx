import { Text, OptionCard } from 'zoui';
import type { PaymentMethod } from '@/utils/api/orders';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface PaymentMethodSectionProps {
  value:          PaymentMethod;
  mpAvailable:    boolean;
  cashAvailable:  boolean;
  onChange:       (method: PaymentMethod) => void;
}

export function PaymentMethodSection({ value, mpAvailable, cashAvailable, onChange }: PaymentMethodSectionProps) {
  return (
    <section style={{ background: 'var(--color-bg-default)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
      <Text variant="heading-3" style={{ marginBottom: '20px' }}>Método de pago</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <OptionCard
          name="paymentMethod"
          value="transfer"
          label="Transferencia bancaria"
          description="Recibirás los datos para transferir al confirmar el pedido."
          selected={value === 'transfer'}
          onChange={() => onChange('transfer')}
          data-testid="checkout-payment-transfer"
        />
        {mpAvailable && (
          <OptionCard
            name="paymentMethod"
            value="mp"
            label="Mercado Pago"
            description="Vas a completar el pago en Mercado Pago (tarjeta, dinero en cuenta y más). Después volvés a la tienda."
            selected={value === 'mp'}
            onChange={() => onChange('mp')}
            data-testid="checkout-payment-mp"
            trailing={<MercadoPagoLogo />}
          />
        )}
        {cashAvailable && (
          <OptionCard
            name="paymentMethod"
            value="cash"
            label="Efectivo en tienda"
            description="Pagás al retirar tu pedido en el local. Solo disponible con retiro en tienda."
            selected={value === 'cash'}
            onChange={() => onChange('cash')}
            data-testid="checkout-payment-cash"
          />
        )}
      </div>
    </section>
  );
}
