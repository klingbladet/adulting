export const roles = {
  USER: "user",
  CREATOR: "creator",
  ADMIN: "admin",
} as const;

export const routeAccess = {
  app: [roles.USER, roles.CREATOR, roles.ADMIN],
  creator: [roles.CREATOR, roles.ADMIN],
  admin: [roles.ADMIN],
} as const;

export function normalizeRoles(roleValue: unknown): string[] {
  if (!roleValue) return ["user"];

  if (Array.isArray(roleValue)) {
    return roleValue.map(String);
  }

  return String(roleValue)
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}