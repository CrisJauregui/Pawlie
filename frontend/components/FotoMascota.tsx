import { Cat, Dog, PawPrint, Rabbit, type LucideProps } from "lucide-react";
import Image from "next/image";
import { fotoMascota } from "@/lib/mascotas";

export function IconoMascota({
  especie,
  ...props
}: LucideProps & { especie: string }) {
  switch (especie.trim().toLowerCase()) {
    case "perro":
      return <Dog {...props} />;
    case "gato":
      return <Cat {...props} />;
    case "conejo":
      return <Rabbit {...props} />;
    default:
      return <PawPrint {...props} />;
  }
}

// Foto de la mascota según su especie; si no hay foto, un ícono.
export function FotoMascota({
  mascota,
  className,
  tamanoIcono = 40,
}: {
  mascota: { name: string; species: string };
  className: string;
  tamanoIcono?: number;
}) {
  const foto = fotoMascota(mascota.species);
  return foto ? (
    <Image
      src={foto}
      alt={mascota.name}
      width={400}
      height={400}
      className={`object-cover ${className}`}
    />
  ) : (
    <span
      className={`flex items-center justify-center bg-naranja-claro text-naranja ${className}`}
    >
      <IconoMascota
        especie={mascota.species}
        size={tamanoIcono}
        strokeWidth={1.5}
      />
    </span>
  );
}
