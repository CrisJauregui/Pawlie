import {
  Calendar,
  CalendarCheck,
  FileText,
  House,
  PawPrint,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "./types";

export interface ItemMenu {
  href: string;
  texto: string;
  textoCorto?: string; // para la barra del celular
  icono: LucideIcon;
  roles: Rol[];
  // Roles que la ven también en la barra inferior del celular (caben máximo 5).
  enMovil: Rol[];
}

// Menú de la app (barra lateral en escritorio, barra inferior en celular),
// en el mismo orden del prototipo de Figma.
// Para agregar una pantalla al menú, agréguenla aquí con los roles que la ven.
export const MENU: ItemMenu[] = [
  {
    href: "/dueno",
    texto: "Inicio",
    icono: House,
    roles: ["OWNER"],
    enMovil: ["OWNER"],
  },
  {
    href: "/cuidador",
    texto: "Inicio",
    icono: House,
    roles: ["CAREGIVER"],
    enMovil: ["CAREGIVER"],
  },
  {
    href: "/mascotas",
    texto: "Mis mascotas",
    icono: PawPrint,
    roles: ["OWNER"],
    enMovil: ["OWNER"],
  },
  {
    href: "/buscar",
    texto: "Buscar cuidadores",
    textoCorto: "Buscar",
    icono: Search,
    roles: ["OWNER"],
    enMovil: ["OWNER"],
  },
  {
    href: "/solicitudes",
    texto: "Solicitudes",
    icono: FileText,
    roles: ["OWNER", "CAREGIVER"],
    enMovil: ["CAREGIVER"],
  },
  {
    href: "/servicios",
    texto: "Servicios",
    icono: Calendar,
    roles: ["OWNER"],
    enMovil: ["OWNER"],
  },
  {
    href: "/mis-servicios",
    texto: "Mis servicios",
    icono: CalendarCheck,
    roles: ["CAREGIVER"],
    enMovil: [],
  },
  {
    href: "/disponibilidad",
    texto: "Calendario",
    icono: Calendar,
    roles: ["CAREGIVER"],
    enMovil: ["CAREGIVER"],
  },
  {
    href: "/perfil",
    texto: "Perfil",
    icono: User,
    roles: ["OWNER", "CAREGIVER"],
    enMovil: ["OWNER", "CAREGIVER"],
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
