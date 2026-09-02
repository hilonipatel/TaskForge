import { z } from "zod";

export const createProjectSchema = z.object({
    organizationId: z.number().int().positive(),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional()
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided"
    }
);
