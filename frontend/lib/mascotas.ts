// Foto por especie (mientras el backend no guarde fotos de mascotas).
const FOTOS: Record<string, string> = {
  perro: "/fotos/perro.jpg",
  gato: "/fotos/gato.jpg",
  conejo: "/fotos/conejo.jpg",
};

export function fotoMascota(especie: string): string | null {
  return FOTOS[especie.trim().toLowerCase()] ?? null;
}

export function edadMascota(edad: number | null): string | null {
  if (edad === null) return null;
  return edad === 1 ? "1 año" : `${edad} años`;
}
