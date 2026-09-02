import { AppError } from "../errors/AppError.js";
import { findOrganizationMembers } from "../repositories/organizationMemberRepository.js";
import { pool } from "../db.js";

export async function getOrganizationMembers(
    organizationId: number,
    userId: number
) {
    const membership = await pool.query(
        `
        SELECT 1
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, userId]
    );

    if (membership.rows.length === 0) {
        throw new AppError(
            "You are not a member of this organization",
            403
        );
    }

    return findOrganizationMembers(organizationId);
}
