import { Text } from 'zoui';
import { ADDRESS_MAX } from '@/lib/constants';

const MAX = ADDRESS_MAX;

interface AddressSlotsIndicatorProps {
  count: number;
}

export function AddressSlotsIndicator({ count }: AddressSlotsIndicatorProps) {
  const atLimit = count >= MAX;
  return (
    <div className="zoui-account__slots">
      <div className="zoui-account__slot-bars">
        {Array.from({ length: MAX }).map((_, i) => (
          <div key={i} className={`zoui-account__slot${i < count ? ' zoui-account__slot--on' : ''}`} />
        ))}
      </div>
      <Text variant="caption" color="muted" weight={atLimit ? 'semibold' : 'regular'}>
        {count} / {MAX}{atLimit && ' — límite alcanzado'}
      </Text>
    </div>
  );
}
