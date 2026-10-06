'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton }            from '@/components/ui/StoreButton';
import { ShippingMethodSection }  from '@/components/checkout/ShippingMethodSection';
import { ShippingDataSection }    from '@/components/checkout/ShippingDataSection';
import { PaymentMethodSection }   from '@/components/checkout/PaymentMethodSection';
import { NotesSection }           from '@/components/checkout/NotesSection';
import { OrderSummary }           from '@/components/checkout/OrderSummary';
import { useCheckoutForm }        from '@/hooks/useCheckoutForm';
import { usePageConfig }          from '@/context/PageConfigContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { hasPurchases } = usePageConfig();
  const {
    ready, submitting, error,
    savedAddresses, selectedAddressId,
    form, set, applyAddress, handleSubmit,
    mpAvailable, cashAvailable,
    subtotal, items, itemCount, currency,
  } = useCheckoutForm();

  // EC-559: tiendas sin el modulo de compras no tienen checkout.
  useEffect(() => {
    if (hasPurchases === false) router.replace('/productos');
  }, [hasPurchases, router]);

  if (!ready) return null;

  if (itemCount === 0) {
    return (
      <main className="zoui-checkout">
        <div className="zoui-checkout__container zoui-checkout__container--empty">
          <Text variant="body" color="muted" style={{ marginBottom: '16px' }}>
            Tu carrito está vacío.
          </Text>
          <StoreButton size="md" onClick={() => router.push('/productos')}>
            Ver productos
          </StoreButton>
        </div>
      </main>
    );
  }

  return (
    <main className="zoui-checkout">
      <div className="zoui-checkout__container">
        <Text variant="heading-2" className="zoui-checkout__title">Checkout</Text>

        <div className="zoui-checkout__layout">
          <div className="zoui-checkout__sections">
            <ShippingMethodSection
              value={form.shippingMethod}
              onChange={(method) => set('shippingMethod', method)}
              forcedPickup={form.paymentMethod === 'cash'}
            />
            <ShippingDataSection
              form={form}
              set={set}
              shippingMethod={form.shippingMethod}
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              onApplyAddress={applyAddress}
            />
            <PaymentMethodSection
              value={form.paymentMethod}
              mpAvailable={mpAvailable}
              cashAvailable={cashAvailable}
              onChange={(method) => set('paymentMethod', method)}
            />
            <NotesSection
              value={form.notes}
              onChange={(value) => set('notes', value)}
            />
          </div>

          <OrderSummary
            items={items}
            subtotal={subtotal}
            currency={currency}
            error={error}
            submitting={submitting}
            paymentMethod={form.paymentMethod}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
