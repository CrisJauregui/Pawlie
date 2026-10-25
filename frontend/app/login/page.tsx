"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Alerta, Button, Input } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { RespuestaAuth } from "@/lib/types";
import { rutaInicio, useSesion } from "@/store/sesion";

export default function LoginPage() {
  const router = useRouter();
  const iniciarSesion = useSesion((s) => s.iniciarSesion);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { accessToken, user } = await api<RespuestaAuth>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      iniciarSesion(accessToken, user);
      router.replace(rutaInicio(user));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo iniciar sesión",
      );
      setEnviando(false);
    }
  }

  return (
    <AuthCard
      titulo="¡Hola de nuevo!"
      subtitulo="Inicia sesión para continuar"
      foto="/fotos/perro.jpg"
      frase="Buenas huellas comienzan aquí"
    >
      <form onSubmit={enviar} className="flex flex-col gap-5">
        {error && <Alerta>{error}</Alerta>}
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          icono={Mail}
          placeholder="hola@ejemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          icono={Lock}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-tinta-suave">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-bold text-naranja">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
}
