interface BenefitsRowProps {
  freeShippingMin?: number | null;
  returnsEnabled?: boolean;
  returnDays?: number;
  warrantyEnabled?: boolean;
  warrantyMonths?: number;
}

interface Benefit {
  icon: string;
  label: string;
}

function buildBenefits({
  freeShippingMin,
  returnsEnabled,
  returnDays,
  warrantyEnabled,
  warrantyMonths,
}: BenefitsRowProps): Benefit[] {
  const benefits: Benefit[] = [];

  if (freeShippingMin != null) {
    benefits.push({
      icon: '🚚',
      label: freeShippingMin === 0
        ? 'Envío gratis'
        : `Envío gratis en compras mayores a $${freeShippingMin.toLocaleString('es-AR')}`,
    });
  }

  if (returnsEnabled !== false && returnDays) {
    benefits.push({
      icon: '↩',
      label: `Devoluciones en ${returnDays} día${returnDays !== 1 ? 's' : ''}`,
    });
  }

  if (warrantyEnabled !== false && warrantyMonths) {
    benefits.push({
      icon: '🛡',
      label: `Garantía de ${warrantyMonths} mes${warrantyMonths !== 1 ? 'es' : ''}`,
    });
  }

  return benefits;
}

export function BenefitsRow(props: BenefitsRowProps) {
  const benefits = buildBenefits(props);
  if (benefits.length === 0) return null;

  return (
    <div className="zoui-product__benefits">
      {benefits.map((b, i) => (
        <div key={i} className="zoui-product__benefit">
          <span aria-hidden="true" className="zoui-product__benefit-icon">
            {b.icon}
          </span>
          <span className="zoui-product__benefit-text">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
