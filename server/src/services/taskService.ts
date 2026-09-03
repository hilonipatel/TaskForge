import { AppError } from "../errors/AppError.js";
import { createTask, findTasksForUser, findTaskByIdForUser, updateTaskForUser, deleteTaskForUser } from "../repositories/taskRepository.js";
import { findProjectByIdForUser } from "../repositories/projectRepository.js";
import { pool } from "../db.js";
import { requireOrganizationRole } from "./authorizationService.js";

export async function createTaskForUser(
    userId: number,
    projectId: number,
    organizationId: number,
    assigneeId: number | null,
    title: string,
    description: string | null,
    status: string,
    priority: string,
    dueDate: string | null
) {

    await requireOrganizationRole(
        userId,
        organizationId,
        ["OWNER", "ADMIN", "MEMBER"]
    );

    const project = await findProjectByIdForUser(
        projectId,
        userId
    );

    if (!project || project.organization_id !== organizationId) {
        throw new AppError ("Project not found", 403);
    }

    if (assigneeId != null) {
        const assignee = await pool.query(
            `
            SELECT 1
            FROM organization_members
            WHERE user_id = $1
              AND organization_id = $2
            `,
            [assigneeId, organizationId]
        );

        if (assignee.rows.length === 0) {
            throw new AppError("Assignee is not a member of this organization", 403);
        }
    }

    return createTask(
        organizationId,
        projectId,
        userId,
        assigneeId,
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
        assigneeId?: number | null;
        title?: string;
        description?: string | null;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }
) {
    const task = await findTaskByIdForUser(
        taskId,
        userId
    );

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    await requireOrganizationRole(
        userId,
        task.organization_id,
        ["OWNER", "ADMIN", "MEMBER"]
    );

    if (fields.assigneeId !== undefined && fields.assigneeId !== null) {
        const assignee = await pool.query(
            `
            SELECT 1
            FROM organization_members
            WHERE user_id = $1
              AND organization_id = $2
            `,
            [fields.assigneeId, task.organization_id]
        );

        if (assignee.rows.length === 0) {
            throw new AppError(
                "Assignee is not a member of this organization",
                403
            );
        }
    }

    const updatedTask = await updateTaskForUser(
        taskId,
        userId,
        fields
    );

    if (!updatedTask) {
        throw new AppError("Task not found", 404);
    }

    return updatedTask;
}

export async function deleteTask(
    taskId: number,
    userId: number
) {
    const task = await findTaskByIdForUser(
        taskId,
        userId
    );

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    await requireOrganizationRole(
        userId,
        task.organization_id,
        ["OWNER", "ADMIN"]
    );

    const deletedTask = await deleteTaskForUser(
        taskId,
        userId
    );

    if (!deletedTask) {
        throw new AppError("Task not found", 404);
    }

    return deletedTask;
}
