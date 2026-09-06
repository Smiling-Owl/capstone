export const prototypeRoles = ["purok", "barangay", "drrm"] as const;

export function getPrototypeRole(username: string) {
  return prototypeRoles.find((role) => username.trim().toLowerCase().startsWith(role));
}
