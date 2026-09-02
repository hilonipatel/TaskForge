import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({
            error: "Authentication required"
        });
    }
    const parts = authHeader.split(" ");
    if(parts[0] != "Bearer" || !parts[1]){
        return res.status(401).json({
            error: "Invalid authorization header"
        });
    }
    try {
        const decoded = verifyToken(parts[1]);
        req.userId = decoded.userId; 
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid or expired token"
        })
    }
}