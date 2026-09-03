import { pool } from "../db.js";
import { AppError } from "../errors/AppError.js";

export async function getUserOrganizationRole(
    userId: number,
    organizationId: number
) {
    const result = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE user_id = $1
          AND organization_id = $2
        `,
        [userId, organizationId]
    );

    if (result.rows.length === 0) {
        throw new AppError("You are not a member of this organization", 403);
    }

    return result.rows[0].role;
}

export async function requireOrganizationRole(
    userId: number,
    organizationId: number,
    allowedRoles: string[]
) {
    const role = await getUserOrganizationRole(
        userId,
        organizationId
    );

    if (!allowedRoles.includes(role)) {
        throw new AppError("You do not have permission to perform this action", 403);
    }

    return role;
}
