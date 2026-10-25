// Marcador para las pantallas que todavía no se han hecho.
export function EnConstruccion({
  titulo,
  responsable,
}: {
  titulo: string;
  responsable: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="rounded-2xl bg-lila-claro p-6 text-tinta-suave">
        🚧 Pantalla en construcción · Responsable: {responsable}
      </p>
    </section>
  );
}
