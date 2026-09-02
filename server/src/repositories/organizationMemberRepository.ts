import { pool } from "../db.js";

export async function findOrganizationMembers(organizationId:number) {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            om.role
        FROM organization_members om
        INNER JOIN users u
            ON u.id = om.user_id
        WHERE om.organization_id = $1
        ORDER BY u.name ASC
        `,
        [organizationId]
    );
    return result.rows;
}

export async function addOrganizationMember(
    organizationId: number,
    userId: number,
    role: string
) {
    const result = await pool.query(
        `
        INSERT INTO organization_members (
            user_id,
            organization_id,
            role
        )
        VALUES ($1, $2, $3)
        RETURNING user_id, organization_id, role, created_at
        `,
        [userId, organizationId, role]
    );
    return result.rows[0];
}

export async function removeOrganizationMember(
    organizationId: number,
    userId: number
) {
    const result = await pool.query(
        `
        DELETE FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        RETURNING user_id, organization_id, role
        `,
        [organizationId, userId]
    );

    return result.rows[0];
}
