export const getSelectValue = (catalogo, id, icon) => {
  if (!id || !catalogo || !Array.isArray(catalogo)) return null;
  const item = catalogo.find((x) => x.id === id);
  return item ? { value: item.id, label: item.nombre, icon } : null;
};
