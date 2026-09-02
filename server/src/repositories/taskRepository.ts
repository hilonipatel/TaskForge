import { pool } from "../db.js";

export async function createTask(
    organizationId: number,
    projectId: number,
    createdBy: number,
    title: string,
    description: string | null,
    status: string,
    priority: string,
    dueDate: string | null
) {
    const result = await pool.query(
        `
        INSERT INTO tasks (
            organization_id,
            project_id,
            created_by,
            title,
            description,
            status,
            priority,
            due_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
            id,
            organization_id,
            project_id,
            created_by,
            title,
            description,
            status,
            priority,
            due_date,
            created_at,
            updated_at
        `,
        [
            organizationId,
            projectId,
            createdBy,
            title,
            description,
            status,
            priority,
            dueDate
        ]
    );

    return result.rows[0];
}

export async function findTasksForUser(userId: number) {
    const result = await pool.query(
        `
        SELECT
            t.id,
            t.organization_id,
            t.created_by,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.updated_at
        FROM tasks t
        INNER JOIN organization_members om
            ON om.organization_id = t.organization_id
        WHERE om.user_id = $1
        ORDER BY t.created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

export async function findTaskByIdForUser(
    taskId: number,
    userId: number
) {
    const result = await pool.query(
        `
        SELECT
            t.id,
            t.organization_id,
            t.created_by,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.updated_at
        FROM tasks t
        INNER JOIN organization_members om
            ON om.organization_id = t.organization_id
        WHERE t.id = $1
          AND om.user_id = $2
        `,
        [taskId, userId]
    );

    return result.rows[0];
}

export async function updateTaskForUser(
    taskId: number,
    userId: number,
    fields: {
        title?: string;
        description?: string | null;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }
) {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (fields.title !== undefined) {
        values.push(fields.title);
        updates.push(`title = $${values.length}`);
    }

    if (fields.description !== undefined) {
        values.push(fields.description);
        updates.push(`description = $${values.length}`);
    }

    if (fields.status !== undefined) {
        values.push(fields.status);
        updates.push(`status = $${values.length}`);
    }

    if (fields.priority !== undefined) {
        values.push(fields.priority);
        updates.push(`priority = $${values.length}`);
    }

    if (fields.dueDate !== undefined) {
        values.push(fields.dueDate);
        updates.push(`due_date = $${values.length}`);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    values.push(taskId);
    const taskIdParam = values.length;

    values.push(userId);
    const userIdParam = values.length;

    const result = await pool.query(
        `
        UPDATE tasks t
        SET ${updates.join(", ")}
        FROM organization_members om
        WHERE t.id = $${taskIdParam}
          AND om.organization_id = t.organization_id
          AND om.user_id = $${userIdParam}
        RETURNING
            t.id,
            t.organization_id,
            t.created_by,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.updated_at
        `,
        values
    );

    return result.rows[0];
}

export async function deleteTaskForUser(
    taskId: number,
    userId: number
) {
    const result = await pool.query(
        `
        DELETE FROM tasks t
        USING organization_members om
        WHERE t.id = $1
          AND om.organization_id = t.organization_id
          AND om.user_id = $2
        RETURNING t.id
        `,
        [taskId, userId]
    );

    return result.rows[0];
}


