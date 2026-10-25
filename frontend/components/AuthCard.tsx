import Image from "next/image";
import { Logo } from "./Logo";
import { Frase } from "./ui";

// Diseño común de login, registro y selección de rol:
// foto con círculos de color a la izquierda (solo escritorio) y formulario a la derecha.
export function AuthCard({
  titulo,
  subtitulo,
  foto,
  frase,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  foto: string;
  frase: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex flex-1 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lila-claro" />
      <div className="pointer-events-none absolute -bottom-32 left-40 hidden h-80 w-80 rounded-full bg-verde-claro lg:block" />

      <section className="relative hidden w-[42%] flex-col justify-center gap-8 px-12 py-10 lg:flex">
        <div className="absolute left-12 top-10">
          <Logo />
        </div>
        <div className="relative">
          <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-naranja-claro" />
          <Image
            src={foto}
            alt=""
            width={420}
            height={420}
            priority
            className="relative aspect-square w-full max-w-sm rounded-[2rem] object-cover shadow-md"
          />
        </div>
        <Frase className="relative text-3xl">{frase}</Frase>
      </section>

      <section className="relative flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-tinta-suave">{subtitulo}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
