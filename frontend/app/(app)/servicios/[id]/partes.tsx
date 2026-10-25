import { BadgeCheck, Heart, type LucideIcon } from "lucide-react";
import { Frase } from "@/components/ui";
import { iniciales } from "@/lib/formato";
import { FotoMascota } from "@/components/FotoMascota";
import type { Seguimiento } from "@/lib/types";

export { FotoMascota };

// Piezas compartidas por las vistas de estado, seguimiento y finalizado.

export function AvatarCuidador({ nombre }: { nombre: string }) {
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-lila-claro text-lg font-extrabold text-lila shadow-sm">
      {iniciales(nombre)}
    </span>
  );
}

// "Camila ♥ Max · En buenas manos"
export function Pareja({ datos }: { datos: Seguimiento }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-crema p-6">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <AvatarCuidador nombre={datos.caregiver.name} />
          <span className="text-sm font-bold">{datos.caregiver.name}</span>
          <span className="flex items-center gap-1 rounded-full bg-verde-claro px-2 py-0.5 text-xs font-bold text-verde">
            <BadgeCheck size={12} /> Verificado
          </span>
        </div>
        <Heart size={28} className="fill-naranja-claro text-naranja-claro" />
        <div className="flex flex-col items-center gap-1">
          <FotoMascota
            mascota={datos.pet}
            className="h-16 w-16 rounded-full border-4 border-white shadow-sm"
          />
          <span className="text-sm font-bold">{datos.pet.name}</span>
          <span className="rounded-full bg-lila-claro px-2 py-0.5 text-xs font-bold text-lila">
            {datos.pet.breed ?? datos.pet.species}
          </span>
        </div>
      </div>
      <Frase className="text-xl">En buenas manos</Frase>
    </div>
  );
}

export function Dato({
  icono: Icono,
  titulo,
  valor,
}: {
  icono: LucideIcon;
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-naranja-claro text-naranja">
        <Icono size={18} strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-xs text-tinta-suave">{titulo}</span>
        <span className="block font-bold">{valor}</span>
      </span>
    </div>
  );
}
