import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

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
      ? "bg-naranja text-white hover:bg-naranja-oscuro"
      : "border-2 border-naranja text-naranja hover:bg-naranja-claro";
  return (
    <button
      className={`rounded-full px-6 py-3 font-bold transition-colors disabled:opacity-60 ${estilos} ${className}`}
      {...props}
    />
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      <input
        id={id}
        className={`rounded-xl border-2 bg-white px-4 py-3 text-base font-normal outline-none focus:border-naranja ${
          error ? "border-error" : "border-crema-oscuro"
        }`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <span className="font-normal text-error">{error}</span>}
    </label>
  );
}

export function Alerta({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error"
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
