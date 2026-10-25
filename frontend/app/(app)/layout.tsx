import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Cargando } from "@/components/ui";

// Todas las pantallas dentro de (app) requieren sesión iniciada.
// Suspense es necesario para las rutas con parámetros (ej: /servicios/[id]).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<Cargando />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
