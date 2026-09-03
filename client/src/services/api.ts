import type { LoginResponse, RegisterResponse  } from "../types/auth";

const API_URL = "http://localhost:5050/api";

export async function loginUser(email: string, password: string): Promise<LoginResponse>{
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Login failed");
    }
    
    return data;
}

export async function registerUser(
    name: string,
    email: string,
    password: string
): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password,
        }),
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Registration failed");
    }
    
    return data;
}

export function getToken(){
    return localStorage.getItem("token");
}