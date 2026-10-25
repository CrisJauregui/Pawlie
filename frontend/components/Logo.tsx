import Link from "next/link";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      className={`font-logo text-naranja ${size === "lg" ? "text-5xl" : "text-3xl"}`}
    >
      Pawlie
    </Link>
  );
}
