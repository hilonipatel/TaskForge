import { Router } from "express";
import { registerUser } from "../services/authService.js";
import { registerSchema } from "../validation/authValidation.js"; 

const router = Router();

router.post("/register", async (req, res) => {
    try{
        const result = registerSchema.safeParse(req.body);
        if (!result.success){
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }

        const { name, email, password } = result.data;
        const user = await registerUser(name, email, password);
        res.status(201).json(user);
    } catch(error) {
        res.status(400).json({
            error: "Internal server error"
        });
    }
    
});

export default router; 