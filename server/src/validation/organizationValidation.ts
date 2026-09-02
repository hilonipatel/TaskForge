import { z } from "zod";

export const createOrganizationSchema = z.object({
    name: z.string().trim().min(1).max(150)
});

export const addMemberSchema = z.object({
    email: z.string().email(),
    role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"])
});