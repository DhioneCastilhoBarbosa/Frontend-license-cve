/** Vendas da loja seguem o padrão: sequência numérica + hífen + 2 dígitos (ex: 1638361679703-01) */
export function isStorePurchaseCode(codigoCompra: string): boolean {
  return /^\d+-\d{2}$/.test(codigoCompra.trim());
}

export function getPurchaseOrigin(
  codigoCompra: string
): "Loja" | "Criado manual" {
  return isStorePurchaseCode(codigoCompra) ? "Loja" : "Criado manual";
}

export function isWithinDateRange(
  createdAt: string,
  dateFrom: string,
  dateTo: string
): boolean {
  if (!dateFrom && !dateTo) return true;

  const itemDate = new Date(createdAt);
  if (Number.isNaN(itemDate.getTime())) return false;

  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`);
    if (itemDate < from) return false;
  }

  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999`);
    if (itemDate > to) return false;
  }

  return true;
}
