import { AppError } from "../errors/AppError.js";
import {
    createProject,
    findProjectsForUser,
    findProjectByIdForUser,
    updateProjectForUser,
    deleteProjectForUser
} from "../repositories/projectRepository.js";
import { pool } from "../db.js";

export async function createProjectForUser(
    userId: number,
    organizationId: number,
    name: string,
    description: string | null
) {
    const membership = await pool.query(
        `
        SELECT 1
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

    return createProject(
        organizationId,
        userId,
        name,
        description
    );
}

export async function getProjectsForUser(userId: number) {
    return findProjectsForUser(userId);
}

export async function getProjectForUser(
    projectId: number,
    userId: number
) {
    const project = await findProjectByIdForUser(
        projectId,
        userId
    );

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    return project;
}

export async function updateProject(
    projectId: number,
    userId: number,
    fields: {
        name?: string;
        description?: string | null;
    }
) {
    const project = await updateProjectForUser(
        projectId,
        userId,
        fields
    );

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    return project;
}

export async function deleteProject(
    projectId: number,
    userId: number
) {
    const project = await deleteProjectForUser(
        projectId,
        userId
    );

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    return project;
}
