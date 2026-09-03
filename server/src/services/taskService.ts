import { AppError } from "../errors/AppError.js";
import { createTask, findTasksForUser, findTaskByIdForUser, updateTaskForUser, deleteTaskForUser } from "../repositories/taskRepository.js";
import { findProjectByIdForUser } from "../repositories/projectRepository.js";
import { pool } from "../db.js";

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

    const project = await findProjectByIdForUser(projectId, userId);
    if (!project || project.organization_id !== organizationId){
        throw new AppError ("Project not found", 403);
    }

    if (assigneeId != null){
        const assignee = await pool.query(
            `
            SELECT 1
            FROM organization_members
            WHERE user_id = $1
                AND organization_id = $2
            `,
            [assigneeId, organizationId]
        );

        if (assignee.rows.length === 0){
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
    if (fields.assigneeId !== undefined && fields.assigneeId !== null) {
        const assignee = await pool.query(
            `
            SELECT 1
            FROM organization_members om
            INNER JOIN tasks t
                ON t.organization_id = om.organization_id
            WHERE t.id = $1
              AND om.user_id = $2
            `,
            [taskId, fields.assigneeId]
        );
    
        if (assignee.rows.length === 0) {
            throw new AppError("Assignee is not a member of this organization",403);
        }
    }
    
    const task = await updateTaskForUser(
        taskId,
        userId,
        fields //error here ---> 
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


