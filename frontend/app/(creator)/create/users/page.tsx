import { requireRole } from "@/lib/guards";
import { SERVER_BACKEND_URL } from "@/lib/backend-url";
import { cookies } from "next/headers";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

async function getUsers(): Promise<UserItem[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${SERVER_BACKEND_URL}/api/admin/users`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }

  return res.json();
}

export default async function CreateUsersPage() {
  await requireRole(["admin"]);

  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Hantera användare</h1>
      <p className="mt-2 text-muted-foreground">
        Här ser du alla användare i databasen.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3">Namn</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roll</th>
              <th className="px-4 py-3">Skapad</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  {new Date(user.createdAt).toLocaleDateString("sv-SE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
