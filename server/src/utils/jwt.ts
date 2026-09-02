import jwt from "jsonwebtoken";

export type JWTPayload = {
    userId: number;
};

export function getJWTSecret(): string{
    const secret = process.env.JWT_SECRET;
    if (!secret){
        throw new Error("JWT_SECRET not configured")
    }
    return secret;
}

const JWT_SECRET = getJWTSecret(); 

export function generateToken(userId: number){
    return jwt.sign(
        { userId },
        JWT_SECRET, 
        {
            expiresIn: "1h"
        }
    )
};

export function verifyToken(token: string): JWTPayload {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null){
        throw new Error("Invalid token payload");
    }

    if (typeof decoded.userId !== "number"){
        throw new Error("Invalid token payload")
    }

    return decoded as JWTPayload; // error with return 
};