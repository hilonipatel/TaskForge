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