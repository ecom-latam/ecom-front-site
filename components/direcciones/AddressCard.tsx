import { Text, Badge, Icon } from 'zoui';
import type { Address } from '@/utils/api/addresses';
import { StoreButton } from '@/components/ui/StoreButton';

interface AddressCardProps {
  addr:           Address;
  deleting:       boolean;
  settingDefault: boolean;
  onEdit:         () => void;
  onDelete:       () => void;
  onSetDefault:   () => void;
}

export function AddressCard({ addr, deleting, settingDefault, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div className={`zoui-account__card zoui-account__card--padded${addr.isDefault ? ' zoui-account__card--accent' : ''}`}>
      <div className="zoui-account__address-head">
        <Text variant="body-sm" weight="semibold">{addr.label}</Text>
        {addr.isDefault && <Badge tone="info" variant="pill" size="sm">Predeterminada</Badge>}
      </div>

      <Text variant="body-sm" color="muted">{addr.fullName} · {addr.phone}</Text>
      <Text variant="body-sm" color="muted">{addr.address}{addr.floor ? `, ${addr.floor}` : ''}</Text>
      <Text variant="body-sm" color="muted">{addr.city}, {addr.province}{addr.zip ? ` (${addr.zip})` : ''}</Text>

      <div className="zoui-account__address-actions">
        <StoreButton emphasis="ghost" size="sm" onClick={onEdit} className="zoui-account__inline">
          <Icon name="edit" size="sm" /> Editar
        </StoreButton>

        {!addr.isDefault && (
          <StoreButton emphasis="ghost" size="sm" disabled={settingDefault} onClick={onSetDefault} className="zoui-account__inline">
            <Icon name="star" size="sm" />
            {settingDefault ? 'Guardando...' : 'Marcar predeterminada'}
          </StoreButton>
        )}

        <StoreButton emphasis="ghost" size="sm" disabled={deleting} onClick={onDelete} className="zoui-account__inline zoui-account__link-danger-btn">
          <Icon name="trash" size="sm" />
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </StoreButton>
      </div>
    </div>
  );
}
