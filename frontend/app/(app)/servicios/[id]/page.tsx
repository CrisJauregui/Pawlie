"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Alerta, Cargando } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { ESTADOS_ACTIVOS } from "@/lib/solicitudes";
import type { Seguimiento } from "@/lib/types";
import { VistaEstado } from "./VistaEstado";
import { VistaFinalizado } from "./VistaFinalizado";
import { VistaSeguimiento } from "./VistaSeguimiento";

// Cada cuánto se consultan nuevas actualizaciones mientras el servicio está activo.
const INTERVALO_MS = 15_000;

// Detalle de un servicio del dueño. Muestra una pantalla distinta según el estado:
//   PENDIENTE / ACEPTADA / RECHAZADA / CANCELADA → estado de la solicitud (pantalla 6)
//   EN_CURSO                                      → seguimiento en tiempo real (pantalla 7)
//   FINALIZADA                                    → resumen y reseña (pantalla 8)
export default function DetalleServicioPage() {
  const { id } = useParams<{ id: string }>();
  const { datos, cargando, error, recargar } = useApi<Seguimiento>(
    `/requests/${id}/tracking`,
    "No se pudo cargar el servicio",
  );

  // Mientras el servicio esté activo, se refresca solo para ver los cambios del cuidador.
  const activo = datos !== null && ESTADOS_ACTIVOS.includes(datos.status);
  useEffect(() => {
    if (!activo) return;
    const timer = setInterval(() => void recargar(), INTERVALO_MS);
    return () => clearInterval(timer);
  }, [activo, recargar]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/servicios"
        className="flex w-fit items-center gap-1 text-sm font-bold text-tinta-suave hover:text-naranja"
      >
        <ChevronLeft size={18} /> Volver a mis servicios
      </Link>

      {error && <Alerta>{error}</Alerta>}
      {cargando && <Cargando />}
      {datos?.status === "EN_CURSO" && <VistaSeguimiento datos={datos} />}
      {datos?.status === "FINALIZADA" && (
        <VistaFinalizado datos={datos} alCalificar={recargar} />
      )}
      {datos &&
        datos.status !== "EN_CURSO" &&
        datos.status !== "FINALIZADA" && <VistaEstado datos={datos} />}
    </div>
  );
}
