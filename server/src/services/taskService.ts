import { AppError } from "../errors/AppError.js";
import { createTask, findTasksForUser, findTaskByIdForUser, updateTaskForUser, deleteTaskForUser } from "../repositories/taskRepository.js";
import { pool } from "../db.js";

export async function createTaskForUser(
    userId: number,
    organizationId: number,
    title: string,
    description: string | null,
    status: string,
    priority: string,
    dueDate: string | null
) {
    const membership = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE user_id = $1
          AND organization_id = $2
        `,
        [userId, organizationId]
    );

    if (membership.rows.length === 0) {
        throw new AppError(
            "You are not a member of this organization",
            403
        );
    }

    return createTask(
        organizationId,
        userId,
        title,
        description,
        status,
        priority,
        dueDate
    );
}

export async function getTasksForUser(userId: number) {
    return findTasksForUser(userId);
}

export async function getTaskForUser(
    taskId: number,
    userId: number
) {
    const task = await findTaskByIdForUser(taskId, userId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
}

export async function updateTask(
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
    const task = await updateTaskForUser(
        taskId,
        userId,
        fields
    );

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
}

export async function deleteTask(
    taskId: number,
    userId: number
) {
    const task = await deleteTaskForUser(
        taskId,
        userId
    );

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
}


