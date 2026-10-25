"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alerta, Button, Cargando } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Usuario } from "@/lib/types";
import { useSesion } from "@/store/sesion";

const NOMBRE_ROL = { OWNER: "Dueño de mascota", CAREGIVER: "Cuidador" };

// Perfil: datos del usuario según el backend (GET /auth/me).
export default function PerfilPage() {
  const router = useRouter();
  const cerrarSesion = useSesion((s) => s.cerrarSesion);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Usuario>("/auth/me")
      .then(setPerfil)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError ? err.message : "No se pudo cargar tu perfil",
        ),
      );
  }, []);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="text-3xl font-extrabold">Mi perfil</h1>
      {error && <Alerta>{error}</Alerta>}
      {!perfil && !error && <Cargando />}
      {perfil && (
        <dl className="flex flex-col gap-4 rounded-3xl bg-white p-6">
          <Dato titulo="Nombre" valor={perfil.name} />
          <Dato titulo="Correo" valor={perfil.email} />
          <Dato titulo="Teléfono" valor={perfil.phone ?? "Sin registrar"} />
          <Dato titulo="Rol" valor={NOMBRE_ROL[perfil.role]} />
        </dl>
      )}
      <Button
        variant="secundario"
        onClick={() => {
          cerrarSesion();
          router.replace("/login");
        }}
      >
        Cerrar sesión
      </Button>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-tinta-suave">{titulo}</dt>
      <dd className="text-lg font-bold">{valor}</dd>
    </div>
  );
}
