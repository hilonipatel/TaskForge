import { pool } from "../db.js";

export async function createProject(
    organizationId: number,
    createdBy: number,
    name: string,
    description: string | null
) {
    const result = await pool.query(
        `
        INSERT INTO projects (
            organization_id,
            created_by,
            name,
            description
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            organization_id,
            created_by,
            name,
            description,
            created_at,
            updated_at
        `,
        [
            organizationId,
            createdBy,
            name,
            description
        ]
    );

    return result.rows[0];
}

export async function findProjectsForUser(userId: number) {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.organization_id,
            p.created_by,
            p.name,
            p.description,
            p.created_at,
            p.updated_at
        FROM projects p
        INNER JOIN organization_members om
            ON om.organization_id = p.organization_id
        WHERE om.user_id = $1
        ORDER BY p.created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

export async function findProjectByIdForUser(
    projectId: number,
    userId: number
) {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.organization_id,
            p.created_by,
            p.name,
            p.description,
            p.created_at,
            p.updated_at
        FROM projects p
        INNER JOIN organization_members om
            ON om.organization_id = p.organization_id
        WHERE p.id = $1
          AND om.user_id = $2
        `,
        [projectId, userId]
    );

    return result.rows[0];
}

export async function updateProjectForUser(
    projectId: number,
    userId: number,
    fields: {
        name?: string;
        description?: string | null;
    }
) {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (fields.name !== undefined) {
        values.push(fields.name);
        updates.push(`name = $${values.length}`);
    }

    if (fields.description !== undefined) {
        values.push(fields.description);
        updates.push(`description = $${values.length}`);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    values.push(projectId);
    const projectIdParam = values.length;

    values.push(userId);
    const userIdParam = values.length;

    const result = await pool.query(
        `
        UPDATE projects p
        SET ${updates.join(", ")}
        FROM organization_members om
        WHERE p.id = $${projectIdParam}
          AND om.organization_id = p.organization_id
          AND om.user_id = $${userIdParam}
        RETURNING
            p.id,
            p.organization_id,
            p.created_by,
            p.name,
            p.description,
            p.created_at,
            p.updated_at
        `,
        values
    );

    return result.rows[0];
}

export async function deleteProjectForUser(
    projectId: number,
    userId: number
) {
    const result = await pool.query(
        `
        DELETE FROM projects p
        USING organization_members om
        WHERE p.id = $1
          AND om.organization_id = p.organization_id
          AND om.user_id = $2
        RETURNING p.id
        `,
        [projectId, userId]
    );

    return result.rows[0];
}

