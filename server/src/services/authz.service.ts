import { prisma } from "../config/prisma";

export interface EffectiveAuthz {
  roles: string[];
  permissions: string[];
}

/** Loads a user's roles and the flattened union of all permissions granted by those roles. */
export async function loadEffectiveAuthz(userId: string): Promise<EffectiveAuthz> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  const roles = new Set<string>();
  const permissions = new Set<string>();

  for (const userRole of userRoles) {
    roles.add(userRole.role.name);
    for (const rp of userRole.role.permissions) {
      permissions.add(rp.permission.key);
    }
  }

  return { roles: [...roles], permissions: [...permissions] };
}
