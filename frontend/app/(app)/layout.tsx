import { AppShell } from "@/components/AppShell";

// Todas las pantallas dentro de (app) requieren sesión iniciada.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
