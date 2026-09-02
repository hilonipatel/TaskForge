import bcrypt from "bcrypt";
import {
    createUser,
    findUserByEmail, 
    findUserById
} from "../repositories/userRepository.js";
import { AppError } from "../errors/AppError.js";
import { generateToken } from "../utils/jwt.js"

export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    const existingUser = await findUserByEmail(email); 
    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await createUser(name, email, passwordHash);
    return user;
}

export async function loginUser(
    email: string, 
    password: string
) {
    const user = await findUserByEmail(email);
    if (user){
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches){
            throw new AppError("Invalid email or password", 401);
        }
    }
    if (!user){
        throw new AppError("Invalid email or password", 401);
    }
    
    const token = generateToken(user.id);

    //Return safe user data without exposing the password hash
    return{
        id: user.id, 
        name: user.name, 
        email: user.email, 
        created_at: user.created_at,
        token
    };
}

export async function getCurrentUser(userId: number) {
    const user = await findUserById(userId);
    if (!user){
        throw new AppError("User not found", 404);
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
    }
}