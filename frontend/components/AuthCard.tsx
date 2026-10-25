import { Logo } from "./Logo";

// Contenedor común de las pantallas de login, registro y selección de rol.
export function AuthCard({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Logo />
          <h1 className="mt-4 text-2xl font-extrabold">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-tinta-suave">{subtitulo}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}
