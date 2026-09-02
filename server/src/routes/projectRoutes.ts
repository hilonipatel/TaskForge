import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createProjectForUser,
    getProjectsForUser,
    getProjectForUser,
    updateProject,
    deleteProject
} from "../services/projectService.js";
import { createProjectSchema, updateProjectSchema } from "../validation/projectValidation.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const result = createProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const project = await createProjectForUser(
            req.userId,
            result.data.organizationId,
            result.data.name,
            result.data.description ?? null
        );

        return res.status(201).json(project);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const projects = await getProjectsForUser(req.userId);

        return res.status(200).json(projects);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({
                error: "Invalid project ID"
            });
        }

        const project = await getProjectForUser(
            projectId,
            req.userId
        );

        return res.status(200).json(project);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({
                error: "Invalid project ID"
            });
        }

        const result = updateProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const project = await updateProject(
            projectId,
            req.userId,
            result.data
        );

        return res.status(200).json(project);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        if (!Number.isInteger(projectId) || projectId <= 0) {
            return res.status(400).json({
                error: "Invalid project ID"
            });
        }

        await deleteProject(
            projectId,
            req.userId
        );

        return res.status(204).send();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;
