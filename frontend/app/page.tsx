import {
  ArrowRight,
  BadgeCheck,
  Camera,
  HeartHandshake,
  PawPrint,
  Search,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Frase } from "@/components/ui";

const BENEFICIOS = [
  {
    icono: Search,
    titulo: "Encuentra al cuidador ideal",
    texto:
      "Filtra por servicio, fecha y barrio, y conoce la experiencia de cada cuidador.",
  },
  {
    icono: BadgeCheck,
    titulo: "Cuidadores verificados",
    texto:
      "Revisamos la identidad y las referencias de cada cuidador antes de aprobarlo.",
  },
  {
    icono: Camera,
    titulo: "Actualizaciones en tiempo real",
    texto: "Recibe fotos y notas de tu mascota durante todo el servicio.",
  },
  {
    icono: Wallet,
    titulo: "Precios claros en pesos",
    texto: "Ves el valor total antes de reservar. Sin cobros sorpresa.",
  },
  {
    icono: Star,
    titulo: "Reseñas y calificaciones",
    texto:
      "Las familias califican cada servicio para que elijas con confianza.",
  },
  {
    icono: HeartHandshake,
    titulo: "Servicios a tu medida",
    texto: "Paseos, cuidado en casa y baño, según lo que necesite tu peludo.",
  },
];

const TESTIMONIOS = [
  {
    nombre: "Valentina García",
    detalle: "Dueña de Nala · Bogotá",
    texto:
      "Encontré a la cuidadora perfecta para mi gata en minutos. Nala llegó feliz y yo tranquila.",
  },
  {
    nombre: "Andrés Morales",
    detalle: "Dueño de Thor · Medellín",
    texto:
      "Me encanta ver las fotos de Thor durante el paseo. Esa tranquilidad no tiene precio.",
  },
  {
    nombre: "Camila Torres",
    detalle: "Cuidadora · Cali",
    texto:
      "Pawlie me ayudó a conocer familias increíbles en mi barrio y organizar mi agenda.",
  },
];

function Iniciales({ nombre }: { nombre: string }) {
  const letras = nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-naranja-claro font-extrabold text-naranja-oscuro">
      {letras}
    </span>
  );
}

// Landing / bienvenida (pública).
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm font-bold">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-naranja hover:bg-naranja-claro"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="rounded-full bg-naranja px-5 py-2 text-white hover:bg-naranja-oscuro"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Portada */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full bg-lila-claro" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-verde-claro" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="flex items-center gap-1 rounded-full border border-naranja/40 bg-white px-3 py-1 text-naranja">
                  <PawPrint size={12} className="fill-current" /> +500
                  cuidadores
                </span>
                <span className="flex items-center gap-1 rounded-full border border-lila/40 bg-white px-3 py-1 text-lila">
                  <ShieldCheck size={12} /> Verificados
                </span>
              </div>
              <h1 className="text-5xl font-extrabold leading-[1.05] sm:text-6xl">
                El hogar perfecto{" "}
                <span className="text-naranja">para tu mascota</span> cuando no
                puedes.
              </h1>
              <p className="max-w-md text-lg text-tinta-suave">
                Conectamos dueños de mascotas con cuidadores amorosos y
                verificados en tu ciudad. Tu peludo merece lo mejor, siempre.
              </p>
              <Frase className="text-3xl">Amor en cada pata</Frase>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/registro"
                  className="flex items-center justify-center gap-2 rounded-full bg-naranja px-8 py-4 font-bold text-white shadow-sm hover:bg-naranja-oscuro"
                >
                  <PawPrint size={18} className="fill-current" /> Empezar ahora
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-full border-2 border-naranja px-8 py-4 font-bold text-naranja hover:bg-naranja-claro"
                >
                  Ya tengo cuenta
                </Link>
              </div>
              <p className="flex items-center gap-2 text-sm text-tinta-suave">
                <span className="flex text-naranja">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </span>
                +2.000 familias felices en Colombia
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -bottom-6 -left-6 h-full w-full rounded-[2.5rem] bg-naranja-claro" />
              <Image
                src="/fotos/perro.jpg"
                alt="Perro durmiendo bajo una cobija"
                width={520}
                height={520}
                priority
                className="relative aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="bg-white py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="rounded-full bg-lila-claro px-3 py-1 text-xs font-bold text-lila">
                ¿Cómo funciona?
              </span>
              <h2 className="text-4xl font-extrabold">
                Simple, seguro y lleno de amor
              </h2>
              <Frase>Pequeñas patas, grandes historias</Frase>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
                <article
                  key={titulo}
                  className="rounded-3xl border border-crema-oscuro bg-crema/50 p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-naranja-claro text-naranja">
                    <Icono size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{titulo}</h3>
                  <p className="mt-1 text-sm text-tinta-suave">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5">
            <div>
              <span className="rounded-full border border-naranja/40 px-3 py-1 text-xs font-bold text-naranja">
                Testimonios
              </span>
              <h2 className="mt-3 text-4xl font-extrabold">
                Lo que dicen las familias
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIOS.map((t) => (
                <figure
                  key={t.nombre}
                  className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm"
                >
                  <figcaption className="flex items-center gap-3">
                    <Iniciales nombre={t.nombre} />
                    <span>
                      <span className="block font-extrabold">{t.nombre}</span>
                      <span className="text-xs text-tinta-suave">
                        {t.detalle}
                      </span>
                    </span>
                  </figcaption>
                  <span className="flex text-naranja">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} size={16} className="fill-current" />
                    ))}
                  </span>
                  <blockquote className="italic text-tinta-suave">
                    “{t.texto}”
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Llamado final */}
        <section className="px-5 pb-16">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-naranja px-6 py-14 text-center text-white">
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
            <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-white/15" />
            <h2 className="relative text-4xl font-extrabold">
              ¿Listo para darle lo mejor a tu mascota?
            </h2>
            <p className="relative mt-3 text-white/85">
              Únete a miles de familias que confían en Pawlie para cuidar a sus
              peludos.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="rounded-full bg-white px-8 py-3 font-bold text-naranja hover:bg-crema"
              >
                Soy dueño de mascota
              </Link>
              <Link
                href="/registro"
                className="flex items-center justify-center gap-2 rounded-full bg-naranja-oscuro px-8 py-3 font-bold hover:bg-tinta"
              >
                Soy cuidador <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-tinta-suave">
        Pawlie · Proyecto académico · Hecho en Colombia
      </footer>
    </div>
  );
}
