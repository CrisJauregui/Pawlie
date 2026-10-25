import type { Rol } from "./types";

export interface ItemMenu {
  href: string;
  texto: string;
  icono: string;
  roles: Rol[];
}

// Menú de la app (barra lateral en escritorio, barra inferior en celular).
// Para agregar una pantalla al menú, agréguenla aquí con los roles que la ven.
export const MENU: ItemMenu[] = [
  { href: "/dueno", texto: "Inicio", icono: "🏠", roles: ["OWNER"] },
  { href: "/cuidador", texto: "Inicio", icono: "🏠", roles: ["CAREGIVER"] },
  { href: "/buscar", texto: "Buscar", icono: "🔎", roles: ["OWNER"] },
  {
    href: "/solicitudes",
    texto: "Solicitudes",
    icono: "📋",
    roles: ["OWNER", "CAREGIVER"],
  },
  { href: "/mascotas", texto: "Mis mascotas", icono: "🐾", roles: ["OWNER"] },
  {
    href: "/disponibilidad",
    texto: "Disponibilidad",
    icono: "📅",
    roles: ["CAREGIVER"],
  },
  {
    href: "/perfil",
    texto: "Perfil",
    icono: "👤",
    roles: ["OWNER", "CAREGIVER"],
  },
];

export function menuPara(rol: Rol): ItemMenu[] {
  return MENU.filter((item) => item.roles.includes(rol));
}

// ¿El rol puede entrar a esta ruta? (también aplica a sub-rutas: /buscar/123)
export function puedeEntrar(rol: Rol, ruta: string): boolean {
  const item = MENU.find(
    (i) => ruta === i.href || ruta.startsWith(`${i.href}/`),
  );
  return !item || item.roles.includes(rol);
}
