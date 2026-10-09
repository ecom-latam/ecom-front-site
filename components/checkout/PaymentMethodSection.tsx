import { Text, OptionCard } from 'zoui';
import type { PaymentMethod } from '@/utils/api/orders';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface PaymentMethodSectionProps {
  value:          PaymentMethod;
  mpAvailable:    boolean;
  cashAvailable:  boolean | undefined;
  onChange:       (method: PaymentMethod) => void;
}

export function PaymentMethodSection({ value, mpAvailable, cashAvailable, onChange }: PaymentMethodSectionProps) {
  return (
    <section className="zoui-checkout__card">
      <Text variant="heading-3" className="zoui-checkout__card-title">Método de pago</Text>
      <div className="zoui-checkout__options">
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
            description="Vas a completar el pago en Mercado Pago (tarjeta, dinero en cuenta y más). Después volvés al sitio."
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
            label="Efectivo en el local"
            description="Pagás al retirar tu pedido en el local. Solo disponible con retiro en el local."
            selected={value === 'cash'}
            onChange={() => onChange('cash')}
            data-testid="checkout-payment-cash"
          />
        )}
      </div>
    </section>
  );
}
