import type { LoginResponse, RegisterResponse, } from "../types/auth";

const API_URL = "http://localhost:5050/api";

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
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
        throw new Error(
            data.error || "Registration failed"
        );
    }

    return data;
}

export function getToken() {
    return localStorage.getItem("token");
}

export function getCurrentUserId(): number | null {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]) );

        const userId =
            payload.userId ??
            payload.id ??
            payload.sub;

        if (!userId) {
            return null;
        }

        const numericId = Number(userId);

        return Number.isNaN(numericId)
            ? null
            : numericId;
    } catch (error) {
        console.error(
            "Failed to decode authentication token:",
            error
        );

        return null;
    }
}

export type UserRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";

export async function getUserOrganizationRole(
    organizationId: number
): Promise<UserRole> {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        return "VIEWER";
    }

    const members =
        await getOrganizationMembers(organizationId);

    const currentMember = members.find(
        (member: {
            user_id?: number;
            id?: number;
        }) =>
            Number(member.user_id ?? member.id) ===
            currentUserId
    );

    const role = currentMember?.role?.toUpperCase();

    if (
        role === "OWNER" ||
        role === "ADMIN" ||
        role === "MEMBER" ||
        role === "VIEWER"
    ) {
        return role;
    }

    return "VIEWER";
}

export async function createOrganization(name: string
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to create organization"
        );
    }

    return data;
}

export async function getOrganizations() {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/organizations`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to fetch organizations"
        );
    }

    return data;
}

export async function deleteOrganization(
    organizationId: number
) {
    const token = getToken();
    
    console.log(
        "DELETE URL:",
        `${API_URL}/organizations/${organizationId}`
    );
    console.log("Organization ID:", organizationId);
    console.log("Token exists:", !!token);

    const response = await fetch(
        `${API_URL}/organizations/${organizationId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.error || "Failed to delete organization"
        );
    }
}

export async function getProjects() {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/projects`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to fetch projects"
        );
    }

    return data;
}

export async function createProject(
    organizationId: number,
    name: string,
    description?: string | null
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/projects`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                organizationId,
                name,
                description,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to create project"
        );
    }

    return data;
}

export async function updateProject(
    projectId: number,
    project: {
        name?: string;
        description?: string | null;
    }
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(project),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to update project"
        );
    }

    return data;
}

export async function deleteProject(
    projectId: number
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.error ||
                "Failed to delete project"
        );
    }
}

export async function getOrganizationMembers(
    organizationId: number
) {
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
        throw new Error(
            data.error ||
                "Failed to fetch organization members"
        );
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
        throw new Error(
            data.error ||
                "Failed to add organization member"
        );
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

        throw new Error(
            data.error ||
                "Failed to remove organization member"
        );
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
            data.error ||
                "Failed to update organization member role"
        );
    }

    return data;
}

export async function getTasks() {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/tasks`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to fetch tasks"
        );
    }

    return data;
}

export async function createTask(task: {
    organizationId: number;
    projectId: number;
    assigneeId?: number | null;
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: string | null;
}) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(task),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to create task"
        );
    }

    return data;
}

export async function updateTask(
    taskId: number,
    task: {
        assigneeId?: number | null;
        title?: string;
        description?: string | null;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(task),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
                "Failed to update task"
        );
    }

    return data;
}

export async function deleteTask(
    taskId: number
) {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.error ||
                "Failed to delete task"
        );
    }
}
