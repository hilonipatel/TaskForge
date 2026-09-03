import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createTaskForUser, getTasksForUser, getTaskForUser, updateTask, deleteTask } from "../services/taskService.js";
import { createTaskSchema, updateTaskSchema } from "../validation/taskValidation.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const result = createTaskSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const {
            organizationId,
            projectId,
            assigneeId,
            title,
            description,
            status,
            priority,
            dueDate
        } = result.data;

        const task = await createTaskForUser(
            req.userId,
            projectId,
            organizationId,
            assigneeId ?? null,
            title,
            description ?? null,
            status,
            priority,
            dueDate ?? null
        );

        return res.status(201).json(task);
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
        const tasks = await getTasksForUser(req.userId);

        return res.status(200).json(tasks);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const task = await getTaskForUser(
            taskId,
            req.userId 
        );

        return res.status(200).json(task);
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
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        const result = updateTaskSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const task = await updateTask(
            taskId,
            req.userId,
            {
                assigneeId: result.data.assigneeId,
                title: result.data.title,
                description: result.data.description,
                status: result.data.status,
                priority: result.data.priority,
                dueDate: result.data.dueDate
            }
        );

        return res.status(200).json(task);
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
        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                error: "Invalid task ID"
            });
        }

        await deleteTask(taskId, req.userId);

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