import { Router } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/authService.js";
import { registerSchema, loginSchema } from "../validation/authValidation.js"; 
import { AppError } from "../errors/AppError.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

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
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message,
            });
        }    

        console.error(error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
    
});

router.post("/login", async (req, res) => {
    try{
        const result = loginSchema.safeParse(req.body);
        if (!result.success){
            return res.status(400).json({
                error: "Invalid request data",
                details: result.error.flatten()
            });
        }
        const {email, password} = result.data;
        const user = await loginUser(email, password);
        res.status(200).json(user);

    } catch (error){
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message,
            });
        }    

        console.error(error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try{
        const user = await getCurrentUser(req.userId);
        return res.status(200).json(user);
    } catch (error){
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                error: error.message,
            });
        }    

        console.error(error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

export default router; 