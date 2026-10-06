import { pool } from "../db.js";

export async function createOrganization(
    name: string,
    userId: number
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const organizationResult = await client.query(
            `
            INSERT INTO organizations (name)
            VALUES ($1)
            RETURNING id, name, created_at
            `,
            [name]
        );

        const organization = organizationResult.rows[0];

        await client.query(
            `
            INSERT INTO organization_members (
                user_id,
                organization_id,
                role
            )
            VALUES ($1, $2, 'OWNER')
            `,
            [userId, organization.id]
        );

        await client.query("COMMIT");

        return organization;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function findOrganizationsForUser(userId: number) {
    const result = await pool.query(
        `
        SELECT
            o.id,
            o.name,
            o.created_at
        FROM organizations o
        INNER JOIN organization_members om
            ON om.organization_id = o.id
        WHERE om.user_id = $1
        ORDER BY o.name ASC
        `,
        [userId]
    );

    return result.rows;
}

export async function deleteOrganization(
    organizationId: number
) {
    const result = await pool.query(
        `
        DELETE FROM organizations
        WHERE id = $1
        RETURNING id
        `,
        [organizationId]
    );

    return result.rows[0];
}
