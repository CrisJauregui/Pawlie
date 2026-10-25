"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";

// Componentes base reutilizables por todo el equipo.

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primario" | "secundario";
};

export function Button({
  variant = "primario",
  className = "",
  ...props
}: ButtonProps) {
  const estilos =
    variant === "primario"
      ? "bg-naranja text-white shadow-sm hover:bg-naranja-oscuro"
      : "border-2 border-naranja text-naranja hover:bg-naranja-claro";
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-colors disabled:opacity-50 ${estilos} ${className}`}
      {...props}
    />
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icono?: LucideIcon;
};

export function Input({
  label,
  error,
  id,
  icono: Icono,
  type,
  ...props
}: InputProps) {
  const [visible, setVisible] = useState(false);
  const esContrasena = type === "password";

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      <span
        className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 focus-within:border-naranja ${
          error ? "border-error" : "border-crema-oscuro"
        }`}
      >
        {Icono && (
          <Icono size={18} strokeWidth={1.75} className="shrink-0 text-icono" />
        )}
        <input
          id={id}
          type={esContrasena && visible ? "text" : type}
          className="min-w-0 flex-1 bg-transparent py-3 text-base font-normal outline-none placeholder:text-icono"
          aria-invalid={Boolean(error)}
          {...props}
        />
        {esContrasena && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="text-icono hover:text-tinta-suave"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {error && <span className="font-normal text-error">{error}</span>}
    </label>
  );
}

export function Alerta({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error"
    >
      {children}
    </p>
  );
}

export function Cargando() {
  return (
    <div className="flex flex-1 items-center justify-center p-10 text-tinta-suave">
      Cargando…
    </div>
  );
}

// Frase decorativa escrita a mano ("Amor en cada pata").
export function Frase({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mano text-2xl font-medium text-terracota ${className}`}>
      {children}
    </p>
  );
}

export function Tarjeta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

// Título de página en letra cursiva naranja, como en el Figma.
export function TituloPagina({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div>
      <h1 className="font-logo text-4xl leading-tight text-naranja sm:text-5xl">
        {titulo}
      </h1>
      {subtitulo && <p className="mt-2 text-tinta-suave">{subtitulo}</p>}
    </div>
  );
}
