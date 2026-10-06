import { Text, OptionCard } from 'zoui';
import type { ShippingMethod } from '@/utils/api/orders';

interface ShippingMethodSectionProps {
  value:        ShippingMethod;
  onChange:     (method: ShippingMethod) => void;
  // EC-895: efectivo en tienda se paga contra retiro -- con ese método
  // seleccionado, "Envío a domicilio" queda bloqueado, no oculto, para que
  // quede claro por qué no está disponible en vez de simplemente desaparecer.
  forcedPickup?: boolean;
}

export function ShippingMethodSection({ value, onChange, forcedPickup }: ShippingMethodSectionProps) {
  return (
    <section className="zoui-checkout__card">
      <Text variant="heading-3" className="zoui-checkout__card-title">Método de entrega</Text>
      <div className="zoui-checkout__options">
        {(['delivery', 'pickup'] as const).map((method) => {
          const disabled = forcedPickup && method === 'delivery';
          return (
            <OptionCard
              key={method}
              name="shippingMethod"
              value={method}
              label={method === 'delivery' ? 'Envío a domicilio' : 'Retiro en tienda'}
              description={
                disabled
                  ? 'No disponible pagando en efectivo — el pago se hace al retirar.'
                  : method === 'delivery' ? 'Recibís el pedido en tu dirección.' : 'Retirás el pedido en el local cuando esté listo.'
              }
              selected={value === method}
              disabled={disabled}
              onChange={() => onChange(method)}
              data-testid={`checkout-shipping-${method}`}
            />
          );
        })}
      </div>
    </section>
  );
}
