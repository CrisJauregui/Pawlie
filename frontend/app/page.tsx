import { Camera, CalendarCheck, PawPrint, Search } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const PASOS = [
  {
    icono: Search,
    titulo: "Busca un cuidador",
    texto: "Filtra por servicio, fecha y ciudad.",
    color: "bg-lila-claro",
  },
  {
    icono: CalendarCheck,
    titulo: "Reserva en minutos",
    texto: "Elige tu mascota, el servicio y el horario.",
    color: "bg-naranja-claro",
  },
  {
    icono: Camera,
    titulo: "Sigue el servicio",
    texto: "Recibe fotos y notas mientras cuidan a tu mascota.",
    color: "bg-verde-claro",
  },
];

// Landing / bienvenida (pública).
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 hover:bg-crema-oscuro"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-full bg-naranja px-4 py-2 text-white hover:bg-naranja-oscuro"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-4 py-10">
        <section className="flex flex-col items-center gap-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-naranja-claro text-naranja">
            <PawPrint size={40} strokeWidth={1.75} />
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Cuidadores de confianza para quien más quieres
          </h1>
          <p className="max-w-xl text-lg text-tinta-suave">
            Pawlie conecta a dueños de mascotas con cuidadores verificados para
            paseos, cuidado en casa y más, con seguimiento en tiempo real.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="rounded-full bg-naranja px-8 py-3 font-bold text-white hover:bg-naranja-oscuro"
            >
              Empezar ahora
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-naranja px-8 py-3 font-bold text-naranja hover:bg-naranja-claro"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {PASOS.map(({ icono: Icono, ...paso }) => (
            <article
              key={paso.titulo}
              className={`rounded-3xl p-6 ${paso.color}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-naranja">
                <Icono size={24} strokeWidth={1.75} />
              </span>
              <h2 className="mt-3 text-lg font-extrabold">{paso.titulo}</h2>
              <p className="text-tinta-suave">{paso.texto}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-tinta-suave">
        Pawlie · Proyecto académico
      </footer>
    </div>
  );
}
