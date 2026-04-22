# Routes, guards och client components

## Syfte

Vi vill hålla våra routes tydliga, säkra och enkla att underhålla.

I vårt projekt gäller:

- Next App Router renderar sidor på servern som standard
- interaktiv UI ska ligga i client components
- route protection ska göras på servern
- UI får gärna dölja länkar, men säkerheten ska alltid ligga i serverkontroller

Next App Router använder Server Components som standard, medan Client Components behövs för state, event handlers och browser-API:er. Better Auth rekommenderar också att riktiga auth-checks görs per sida/route, inte enbart i proxy. :contentReference[oaicite:0]{index=0}

---

## Grundregel

### Server page ansvarar för:
- `requireGuest()`
- `requireUser()`
- `requireRole()`
- datahämtning på servern
- redirect om användaren inte har access

### Client component ansvarar för:
- `useState`
- `useEffect`
- `useRouter`
- formulärhantering
- click handlers
- dropdowns, toggles, menyer

---

## Tumregel

### Ha allt i `page.tsx` när:
- sidan bara visar data
- sidan behöver server guard
- sidan inte behöver client hooks

Exempel:

```tsx
import { requireRole } from "@/lib/guards";

export default async function AdminPage() {
  await requireRole(["admin"]);

  return <div>Admin area</div>;
}