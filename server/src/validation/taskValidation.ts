import { z } from "zod";

export const createTaskSchema = z.object({
    organizationId: z.number().int().positive(),
    projectId: z.number().int().positive(),
    assigneeId: z.number().int().positive().nullable().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(5000).nullable().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    dueDate: z.string().date().nullable().optional()
});

export const updateTaskSchema = z.object({
    assigneeId: z.number().int().positive().nullable().optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).nullable().optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().date().nullable().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided"
    }
);
