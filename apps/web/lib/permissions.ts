import { prisma } from "@/lib/db";

/**
 * Get the role a user has for a specific home.
 * Returns null if the user is not a member.
 */
export async function getUserHomeRole(
  userId: string,
  homeId: string
): Promise<string | null> {
  const homeUser = await prisma.homeUser.findUnique({
    where: { userId_homeId: { userId, homeId } },
  });
  return homeUser?.role ?? null;
}

/**
 * Check if a user can modify a home (owner or editor).
 */
export async function canUserModifyHome(
  userId: string,
  homeId: string
): Promise<boolean> {
  const role = await getUserHomeRole(userId, homeId);
  return role === "owner" || role === "editor";
}

/**
 * Require the user to be at least an editor. Throws if viewer or not a member.
 */
export async function requireEditor(
  userId: string,
  homeId: string
): Promise<void> {
  const role = await getUserHomeRole(userId, homeId);
  if (!role) {
    throw new Error("Not a member of this home");
  }
  if (role === "viewer") {
    throw new Error("Insufficient permissions — editor role required");
  }
}

/**
 * Require the user to be the owner. Throws if not owner.
 */
export async function requireOwner(
  userId: string,
  homeId: string
): Promise<void> {
  const role = await getUserHomeRole(userId, homeId);
  if (role !== "owner") {
    throw new Error("Insufficient permissions — owner role required");
  }
}
