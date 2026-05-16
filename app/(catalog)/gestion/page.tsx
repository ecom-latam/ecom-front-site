import type React from 'react';

const STATS_MOCK = [
  { label: 'Pedidos hoy', value: '24', change: '+12%' },
  { label: 'Ingresos del mes', value: '$148.320', change: '+8%' },
  { label: 'Clientes nuevos', value: '37', change: '+5%' },
  { label: 'Productos activos', value: '142', change: '0%' },
];

const ORDERS_MOCK = [
  { id: '#0041', customer: 'Martina García', total: '$3.200', status: 'Pendiente' },
  { id: '#0040', customer: 'Lucas Romero', total: '$8.750', status: 'Enviado' },
  { id: '#0039', customer: 'Sofía Herrera', total: '$1.400', status: 'Entregado' },
  { id: '#0038', customer: 'Tomás Núñez', total: '$5.600', status: 'Pendiente' },
  { id: '#0037', customer: 'Valentina López', total: '$2.100', status: 'Cancelado' },
];

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  Pendiente: { background: '#fef9c3', color: '#854d0e' },
  Enviado:   { background: '#dbeafe', color: '#1e40af' },
  Entregado: { background: '#dcfce7', color: '#166534' },
  Cancelado: { background: '#fee2e2', color: '#991b1b' },
};

export default function GestionPage() {
  return (
    <main style={{ padding: '32px', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        Resumen
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {STATS_MOCK.map((stat) => (
          <div key={stat.label} style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{stat.value}</p>
            <p style={{ fontSize: '12px', color: stat.change.startsWith('+') ? '#16a34a' : '#6b7280' }}>
              {stat.change} vs mes anterior
            </p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Últimos pedidos</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Pedido', 'Cliente', 'Total', 'Estado'].map((col) => (
                <th key={col} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDERS_MOCK.map((order, i) => (
              <tr key={order.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111827', fontWeight: 500 }}>{order.id}</td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{order.customer}</td>
                <td style={{ padding: '14px 24px', fontSize: '14px', color: '#374151' }}>{order.total}</td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 500,
                    ...STATUS_STYLES[order.status],
                  }}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
