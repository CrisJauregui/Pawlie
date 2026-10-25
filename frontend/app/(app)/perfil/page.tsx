"use client";

import {
  CircleCheck,
  LogOut,
  Mail,
  PawPrint,
  Phone,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alerta, Cargando, Frase, Tarjeta } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { iniciales } from "@/lib/formato";
import type { ResumenDueno, Usuario } from "@/lib/types";
import { useSesion } from "@/store/sesion";

const NOMBRE_ROL = { OWNER: "Dueño", CAREGIVER: "Cuidador" };

// Perfil: datos del usuario según el backend (GET /auth/me).
export default function PerfilPage() {
  const router = useRouter();
  const cerrarSesion = useSesion((s) => s.cerrarSesion);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [resumen, setResumen] = useState<ResumenDueno | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Usuario>("/auth/me")
      .then((usuario) => {
        setPerfil(usuario);
        // Las estadísticas solo aplican al dueño.
        if (usuario.role === "OWNER") {
          return api<ResumenDueno>("/owner/summary").then(setResumen);
        }
      })
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : "No se pudo cargar tu perfil",
        ),
      );
  }, []);

  if (error) return <Alerta>{error}</Alerta>;
  if (!perfil) return <Cargando />;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section>
        <div className="h-36 rounded-3xl bg-gradient-to-r from-lila-claro via-crema to-naranja-claro" />
        <div className="-mt-14 flex flex-wrap items-end gap-4 px-6">
          <span className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-naranja-claro text-3xl font-extrabold text-naranja-oscuro shadow-sm">
            {iniciales(perfil.name)}
          </span>
          <div className="pb-2">
            <h1 className="flex items-center gap-2 text-3xl font-extrabold">
              {perfil.name}
              <span className="flex items-center gap-1 rounded-full border border-naranja/40 bg-naranja-claro px-3 py-0.5 text-xs font-bold text-naranja-oscuro">
                <PawPrint size={12} className="fill-current" />
                {NOMBRE_ROL[perfil.role]}
              </span>
            </h1>
          </div>
        </div>
      </section>

      {resumen && (
        <section className="grid grid-cols-3 gap-4">
          <Estadistica
            icono={PawPrint}
            valor={resumen.pets}
            texto="Mascotas registradas"
          />
          <Estadistica
            icono={CircleCheck}
            valor={resumen.completedServices}
            texto="Servicios completados"
          />
          <Estadistica
            icono={CalendarDays}
            valor={resumen.activeRequests}
            texto="Solicitudes activas"
          />
        </section>
      )}

      <Tarjeta>
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Phone size={20} className="text-naranja" /> Información de contacto
        </h2>
        <dl className="mt-5 flex flex-col gap-4">
          <Contacto
            icono={Mail}
            titulo="Correo electrónico"
            valor={perfil.email}
          />
          <Contacto
            icono={Phone}
            titulo="Teléfono"
            valor={perfil.phone ?? "Sin registrar"}
          />
        </dl>
      </Tarjeta>

      <button
        onClick={() => {
          cerrarSesion();
          router.replace("/login");
        }}
        className="mx-auto flex items-center gap-2 font-bold text-error hover:underline"
      >
        <LogOut size={18} /> Cerrar sesión
      </button>
      <Frase className="text-center">Juntos hacemos un mundo más feliz</Frase>
    </div>
  );
}

function Estadistica({
  icono: Icono,
  valor,
  texto,
}: {
  icono: LucideIcon;
  valor: number;
  texto: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-3xl bg-white p-5 text-center shadow-sm">
      <Icono size={22} className="text-naranja" />
      <span className="text-2xl font-extrabold">{valor}</span>
      <span className="text-xs text-tinta-suave">{texto}</span>
    </div>
  );
}

function Contacto({
  icono: Icono,
  titulo,
  valor,
}: {
  icono: LucideIcon;
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-naranja-claro text-naranja">
        <Icono size={18} />
      </span>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-tinta-suave">
          {titulo}
        </dt>
        <dd className="font-bold">{valor}</dd>
      </div>
    </div>
  );
}
