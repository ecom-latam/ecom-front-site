import { Text } from 'zoui';
import { StoreTextarea } from '@/components/ui/StoreTextarea';

interface NotesSectionProps {
  value:    string;
  onChange: (value: string) => void;
}

export function NotesSection({ value, onChange }: NotesSectionProps) {
  return (
    <section className="zoui-checkout__card">
      <Text variant="heading-3" className="zoui-checkout__card-title zoui-checkout__card-title--tight">Notas del pedido (opcional)</Text>
      <StoreTextarea
        label="Notas"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 500))}
        placeholder="Instrucciones especiales, referencias de entrega..."
      />
    </section>
  );
}
