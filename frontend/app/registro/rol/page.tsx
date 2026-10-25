"use client";

import { ArrowLeft, Dog, HeartHandshake, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Alerta, Button } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { RespuestaAuth, Rol } from "@/lib/types";
import { useRegistro } from "@/store/registro";
import { rutaInicio, useSesion } from "@/store/sesion";

const OPCIONES: {
  rol: Rol;
  icono: LucideIcon;
  titulo: string;
  texto: string;
}[] = [
  {
    rol: "OWNER",
    icono: Dog,
    titulo: "Soy dueño de mascota",
    texto: "Busco cuidadores de confianza para mis mascotas.",
  },
  {
    rol: "CAREGIVER",
    icono: HeartHandshake,
    titulo: "Soy cuidador",
    texto: "Quiero ofrecer paseos y cuidado de mascotas.",
  },
];

export default function SeleccionarRolPage() {
  const router = useRouter();
  const datos = useRegistro((s) => s.datos);
  const limpiar = useRegistro((s) => s.limpiar);
  const iniciarSesion = useSesion((s) => s.iniciarSesion);
  const [rol, setRol] = useState<Rol | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Si se entra directo a esta pantalla, primero hay que llenar "Crear cuenta".
  // (Mientras se envía no, porque al terminar se limpian los datos).
  useEffect(() => {
    if (!datos && !enviando) router.replace("/registro");
  }, [datos, enviando, router]);

  async function crearCuenta() {
    if (!datos || !rol) return;
    setError(null);
    setEnviando(true);
    try {
      const { accessToken, user } = await api<RespuestaAuth>("/auth/register", {
        method: "POST",
        body: {
          name: datos.name,
          email: datos.email,
          password: datos.password,
          role: rol,
          ...(datos.phone ? { phone: datos.phone } : {}),
        },
      });
      iniciarSesion(accessToken, user);
      limpiar();
      router.replace(rutaInicio(user));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear la cuenta",
      );
      setEnviando(false);
    }
  }

  return (
    <AuthCard titulo="¿Cómo usarás Pawlie?" subtitulo="Elige tu rol">
      <div className="flex flex-col gap-4">
        {error && <Alerta>{error}</Alerta>}
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.rol}
            type="button"
            onClick={() => setRol(opcion.rol)}
            aria-pressed={rol === opcion.rol}
            className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
              rol === opcion.rol
                ? "border-naranja bg-naranja-claro"
                : "border-crema-oscuro hover:border-lila"
            }`}
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                rol === opcion.rol
                  ? "bg-white text-naranja"
                  : "bg-crema text-icono"
              }`}
            >
              <opcion.icono size={28} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-extrabold">{opcion.titulo}</span>
              <span className="text-sm text-tinta-suave">{opcion.texto}</span>
            </span>
          </button>
        ))}
        <Button onClick={crearCuenta} disabled={!rol || enviando}>
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
        <Link
          href="/registro"
          className="flex items-center justify-center gap-1 text-sm font-bold text-tinta-suave"
        >
          <ArrowLeft size={16} /> Volver
        </Link>
      </div>
    </AuthCard>
  );
}
