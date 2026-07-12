// Marker de mapa con la foto real de la moto (en vez del ícono vectorial).
// La foto se mantiene "de pie" (no rota con el rumbo, se vería rara de costado);
// el rumbo lo indica una flechita aparte, detrás de la foto, que sí rota.
export function vehiclePhotoMarkerHtml(vehicleId: string, primary: string, selected: boolean): string {
  const photoUrl = `/images/${vehicleId.toLowerCase()}.jpg`;
  // Iniciales para el pin de respaldo cuando la moto todavía no tiene foto.
  const initials = vehicleId.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
  // El círculo de respaldo va SIEMPRE detrás; si la foto carga la tapa, y si
  // falla (onerror oculta el <img>) queda visible el pin de color. Así toda
  // moto tiene pin aunque le falte la imagen.
  return `
    <div class="moto-marker__heading"></div>
    <div class="moto-marker__fallback ${selected ? "moto-marker__photo--selected" : ""}" style="border-color:${primary};background:${primary}">${initials}</div>
    <img
      class="moto-marker__photo ${selected ? "moto-marker__photo--selected" : ""}"
      src="${photoUrl}"
      style="border-color:${primary}"
      onerror="this.style.display='none'"
      alt=""
    />
  `;
}
