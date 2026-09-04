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

    const membership = result.rows[0];

    const userResult = await pool.query(
        `
        SELECT
            id,
            name,
            email
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    const user = userResult.rows[0];

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
    };
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

export async function updateOrganizationMemberRole(
    organizationId: number,
    userId: number,
    role: string
) {
    const result = await pool.query(
        `
        UPDATE organization_members
        SET role = $1
        WHERE organization_id = $2
          AND user_id = $3
        RETURNING user_id, organization_id, role, created_at
        `,
        [role, organizationId, userId]
    );

    return result.rows[0];
}