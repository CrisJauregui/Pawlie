"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "./Logo";
import { Cargando } from "./ui";
import { menuPara, puedeEntrar } from "@/lib/navegacion";
import { rutaInicio, useSesion, useSesionCargada } from "@/store/sesion";

// Estructura de las pantallas privadas:
// - Sin sesión → redirige a /login.
// - Con un rol que no puede ver la ruta → redirige a su inicio.
// - Muestra la barra lateral (escritorio) o inferior (celular) según el rol.
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const cargada = useSesionCargada();
  const usuario = useSesion((s) => s.usuario);
  const cerrarSesion = useSesion((s) => s.cerrarSesion);

  const permitido = usuario !== null && puedeEntrar(usuario.role, ruta);

  useEffect(() => {
    if (!cargada) return;
    if (!usuario) router.replace("/login");
    else if (!permitido) router.replace(rutaInicio(usuario));
  }, [cargada, usuario, permitido, router]);

  if (!cargada || !usuario || !permitido) return <Cargando />;

  const menu = menuPara(usuario.role);
  const activo = (href: string) => ruta === href || ruta.startsWith(`${href}/`);

  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col gap-8 border-r border-crema-oscuro bg-white p-6 md:flex">
        <Logo />
        <nav className="flex flex-1 flex-col gap-1">
          {menu.map(({ href, texto, icono: Icono }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 font-bold ${
                activo(href)
                  ? "bg-activo text-naranja"
                  : "text-menu hover:bg-crema"
              }`}
            >
              <Icono
                size={22}
                strokeWidth={1.75}
                className={activo(href) ? "text-naranja" : "text-icono"}
              />
              {texto}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            cerrarSesion();
            router.replace("/login");
          }}
          className="flex items-center gap-4 rounded-2xl px-4 py-3 text-left font-bold text-menu hover:bg-crema"
        >
          <LogOut size={22} strokeWidth={1.75} className="text-icono" />
          Cerrar sesión
        </button>
      </aside>

      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-crema-oscuro bg-white px-4 py-3 md:hidden">
          <Logo />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-crema-oscuro bg-white py-2 md:hidden">
        {menu
          .filter((item) => item.enMovil.includes(usuario.role))
          .map(({ href, texto, textoCorto, icono: Icono }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 text-xs font-bold ${
                activo(href) ? "text-naranja" : "text-menu"
              }`}
            >
              <Icono
                size={22}
                strokeWidth={1.75}
                className={activo(href) ? "text-naranja" : "text-icono"}
              />
              {textoCorto ?? texto}
            </Link>
          ))}
      </nav>
    </div>
  );
}
