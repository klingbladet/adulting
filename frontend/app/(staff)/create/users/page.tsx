import { requireRole } from "@/lib/guards";

export default async function StaffUsersPage() {
  await requireRole(["admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Hantera användare</h1>
      <p className="mt-2 text-muted-foreground">
        Här ska admins kunna se användare, ändra roller och ta bort användare.
      </p>
    </div>
  );
}