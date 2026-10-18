const OPTIONS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };

export const formatDateTime = (value: Date | string | number): string => new Date(value).toLocaleString('es-AR', OPTIONS);
