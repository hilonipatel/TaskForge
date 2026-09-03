import { AppError } from "../errors/AppError.js";
import {
    createProject,
    findProjectsForUser,
    findProjectByIdForUser,
    updateProjectForUser,
    deleteProjectForUser
} from "../repositories/projectRepository.js";
import { requireOrganizationRole } from "./authorizationService.js";

export async function createProjectForUser(
    userId: number,
    organizationId: number,
    name: string,
    description: string | null
) {
    
    await requireOrganizationRole(
        userId,
        organizationId,
        ["OWNER", "ADMIN", "MEMBER"]
    );

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

    const project = await findProjectByIdForUser(
        projectId,
        userId
    );

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    await requireOrganizationRole(
        userId,
        project.organization_id,
        ["OWNER", "ADMIN", "MEMBER"]
    );

    const updatedProject = await updateProjectForUser(
        projectId, 
        userId, 
        fields
    );

    if (!updatedProject){
        throw new AppError("Project not found", 404);
    }

    return updatedProject;
}

export async function deleteProject(
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

    await requireOrganizationRole(
        userId,
        project.organization_id,
        ["OWNER", "ADMIN"]
    );

    const deletedProject = await deleteProjectForUser(
        projectId,
        userId
    );

    if (!deletedProject) {
        throw new AppError("Project not found", 404);
    }

    return deletedProject;
}
