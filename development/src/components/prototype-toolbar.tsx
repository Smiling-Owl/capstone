import Link from "next/link";

export function PrototypeToolbar({ current }: { current: "login" | "purok" | "barangay" | "drrm" }) {
  return (
    <nav className="prototype-toolbar" aria-label="Prototype role switcher">
      <span>Prototype review</span>
      <Link href="/login" aria-current={current === "login" ? "page" : undefined}>Log in</Link>
      <Link href="/purok" aria-current={current === "purok" ? "page" : undefined}>Purok</Link>
      <Link href="/barangay" aria-current={current === "barangay" ? "page" : undefined}>Barangay</Link>
      <Link href="/drrm" aria-current={current === "drrm" ? "page" : undefined}>DRRM</Link>
    </nav>
  );
}
