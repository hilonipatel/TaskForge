import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createOrganizationForUser } from "../services/organizationService.js";
import { createOrganizationSchema } from "../validation/organizationValidation.js";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const result = createOrganizationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const organization = await createOrganizationForUser(
            req.userId,
            result.data.name
        );

        return res.status(201).json(organization);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;
