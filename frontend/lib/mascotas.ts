import { Cat, Dog, PawPrint, Rabbit, type LucideIcon } from "lucide-react";

// Foto e ícono por especie (mientras el backend no guarde fotos de mascotas).
const POR_ESPECIE: Record<string, { foto: string; icono: LucideIcon }> = {
  perro: { foto: "/fotos/perro.jpg", icono: Dog },
  gato: { foto: "/fotos/gato.jpg", icono: Cat },
  conejo: { foto: "/fotos/conejo.jpg", icono: Rabbit },
};

export function fotoMascota(especie: string): string | null {
  return POR_ESPECIE[especie.trim().toLowerCase()]?.foto ?? null;
}

export function iconoMascota(especie: string): LucideIcon {
  return POR_ESPECIE[especie.trim().toLowerCase()]?.icono ?? PawPrint;
}

export function edadMascota(edad: number | null): string | null {
  if (edad === null) return null;
  return edad === 1 ? "1 año" : `${edad} años`;
}
