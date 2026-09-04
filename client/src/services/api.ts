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

export async function createOrganization(name: string) {
    const token = getToken();

    const response = await fetch(`${API_URL}/organizations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create organization");
    }

    return data;
}

export async function getOrganizations() {
    const token = getToken();

    const response = await fetch(`${API_URL}/organizations`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organizations");
    }

    return data;
}

export async function getOrganizationMembers(organizationId: number) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/members`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organization members");
    }

    return data;
}

export async function addOrganizationMember(
    organizationId: number,
    email: string,
    role: string
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/members`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                email,
                role,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to add organization member");
    }

    return data;
}

export async function removeOrganizationMember(
    organizationId: number,
    userId: number
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/members/${userId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove organization member");
    }
}

export async function updateOrganizationMemberRole(
    organizationId: number,
    userId: number,
    role: string
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/members/${userId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                role,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update organization member role"
        );
    }

    return data;
}
