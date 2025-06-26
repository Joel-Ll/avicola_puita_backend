export function updateDetailSold(
  detailSold: string[],
  size: string,
  unitQuantity: number,
  quantityPerBox: number,
  increment: boolean
): string[] {
  const existingIndex = detailSold.findIndex(detail =>
    detail.includes(`Huevo "${size}"`)
  );

  if (increment === true) {
    if (existingIndex !== -1) {
      const match = detailSold[existingIndex].match(/([\d.]+)C\s*-\s*([\d.]+)M/);
      const prevQuantityPerBox = match ? parseFloat(match[1]) : 0;
      const prevUnitQuantity = match ? parseFloat(match[2]) : 0;

      const updatedDetail = `Huevo "${size}": ${(prevQuantityPerBox + quantityPerBox)}C - ${(prevUnitQuantity + unitQuantity)}M`;
      detailSold[existingIndex] = updatedDetail;
    } else {
      const newDetail = `Huevo "${size}": ${quantityPerBox}C - ${unitQuantity}M`;
      detailSold.push(newDetail);
    }
  } else {
    if (existingIndex !== -1) {
      const match = detailSold[existingIndex].match(/([\d.]+)C\s*-\s*([\d.]+)M/);
      const prevQuantityPerBox = match ? parseFloat(match[1]) : 0;
      const prevUnitQuantity = match ? parseFloat(match[2]) : 0;

      const newQuantityPerBox = prevQuantityPerBox - quantityPerBox;
      const newUnitQuantity = prevUnitQuantity - unitQuantity;

      if (newQuantityPerBox === 0 && newUnitQuantity === 0) {
        detailSold.splice(existingIndex, 1); // Elimina el elemento del array
      } else {
        // Si no, actualizamos el detalle con las nuevas cantidades
        const updatedDetail = `Huevo "${size}": ${newQuantityPerBox}C - ${newUnitQuantity}M`;
        detailSold[existingIndex] = updatedDetail;
      }
    } else {
      // Solo agregamos el detalle si al menos una cantidad no es cero
      if (quantityPerBox !== 0 || unitQuantity !== 0) {
        const newDetail = `Huevo "${size}": ${quantityPerBox}C - ${unitQuantity}M`;
        detailSold.push(newDetail);
      }
    }
  }
  return detailSold;
}