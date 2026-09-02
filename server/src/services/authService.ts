import bcrypt from "bcrypt";
import {
    createUser,
    findUserByEmail
} from "../repositories/userRepository.js";

export async function registerUser(
    name: string,
    email: string,
    password: string
) {
    const existingUser = await findUserByEmail(email); 
    if (existingUser) {
        throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser(name, email, passwordHash);
    return user;
}