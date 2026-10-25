import { PawPrint } from "lucide-react";
import Link from "next/link";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 font-logo text-naranja ${size === "lg" ? "text-5xl" : "text-3xl"}`}
    >
      Pawlie
      <PawPrint size={size === "lg" ? 26 : 16} className="fill-current" />
    </Link>
  );
}
