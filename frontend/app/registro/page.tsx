"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { Button, Input } from "@/components/ui";
import { useRegistro, type DatosRegistro } from "@/store/registro";

type Errores = Partial<Record<keyof DatosRegistro | "confirmar", string>>;

// Mismas reglas que valida el backend (RegisterDto), para avisar antes de enviar.
function validar(datos: DatosRegistro, confirmar: string): Errores {
  const errores: Errores = {};
  if (!datos.name.trim()) errores.name = "El nombre es obligatorio";
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) {
    errores.email = "El correo no es válido";
  }
  if (datos.password.length < 8) {
    errores.password = "La contraseña debe tener al menos 8 caracteres";
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(datos.password)) {
    errores.password =
      "La contraseña debe tener al menos una letra y un número";
  }
  if (confirmar !== datos.password) {
    errores.confirmar = "Las contraseñas no coinciden";
  }
  return errores;
}

export default function RegistroPage() {
  const router = useRouter();
  const guardados = useRegistro((s) => s.datos);
  const guardar = useRegistro((s) => s.guardar);
  const [datos, setDatos] = useState<DatosRegistro>(
    guardados ?? { name: "", email: "", password: "", phone: "" },
  );
  const [confirmar, setConfirmar] = useState(guardados?.password ?? "");
  const [errores, setErrores] = useState<Errores>({});

  const cambiar = (campo: keyof DatosRegistro, valor: string) =>
    setDatos((d) => ({ ...d, [campo]: valor }));

  function continuar(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar(datos, confirmar);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    guardar({ ...datos, email: datos.email.trim().toLowerCase() });
    router.push("/registro/rol");
  }

  return (
    <AuthCard titulo="Crear cuenta" subtitulo="Únete a la comunidad Pawlie">
      <form onSubmit={continuar} className="flex flex-col gap-4" noValidate>
        <Input
          id="name"
          label="Nombre completo"
          autoComplete="name"
          value={datos.name}
          error={errores.name}
          onChange={(e) => cambiar("name", e.target.value)}
        />
        <Input
          id="email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={datos.email}
          error={errores.email}
          onChange={(e) => cambiar("email", e.target.value)}
        />
        <Input
          id="phone"
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          value={datos.phone}
          onChange={(e) => cambiar("phone", e.target.value)}
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={datos.password}
          error={errores.password}
          onChange={(e) => cambiar("password", e.target.value)}
        />
        <Input
          id="confirmar"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={confirmar}
          error={errores.confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        <Button type="submit">Continuar</Button>
      </form>
      <p className="mt-6 text-center text-sm text-tinta-suave">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-naranja">
          Iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
