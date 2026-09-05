const priorityRank: Record<string, number> = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

function sortTasksByUrgency(tasks: Task[]) {
    return [...tasks].sort((a, b) => {
        // Completed tasks go last
        if (a.status === "DONE" && b.status !== "DONE") {
            return 1;
        }

        if (a.status !== "DONE" && b.status === "DONE") {
            return -1;
        }

        // Tasks without due dates go after tasks with due dates
        if (!a.due_date && b.due_date) {
            return 1;
        }

        if (a.due_date && !b.due_date) {
            return -1;
        }

        // Compare due dates
        if (a.due_date && b.due_date) {
            const dateDifference =
                new Date(a.due_date).getTime() -
                new Date(b.due_date).getTime();

            if (dateDifference !== 0) {
                return dateDifference;
            }
        }

        // Compare priority
        return (
            (priorityRank[a.priority] ?? 99) -
            (priorityRank[b.priority] ?? 99)
        );
    });
}

import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask, getOrganizations, getProjects } from "../services/api";
import type { Task } from "../types/task";
import type { Project } from "../types/project"
import { useNavigate } from "react-router-dom";

function TasksPage() {
    const navigate = useNavigate();

    const [organizations, setOrganizations] = useState<
        { id: number; name: string }[]
    >([]);

    const [projects, setProjects] = useState<Project[]>([]);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("TODO");
    const [editPriority, setEditPriority] = useState("MEDIUM");
    const [editDueDate, setEditDueDate] = useState("");

    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState("");
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("TODO");
    const [dueDate, setDueDate] = useState("");
    
    const filteredProjects = projects.filter(
        (project) => project.organization_id === Number(organizationId)
    );

    const tasksByProject = projects.reduce<Record<number, Task[]>>(
        (groups, project) => {
            groups[project.id] = tasks.filter(
                (task) => task.project_id === project.id
            );
    
            return groups;
        },
        {}
    );
    
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await getTasks();
                setTasks(data);
            } catch (error) {
                console.error("Failed to load tasks:", error);
    
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load tasks");
                }
            }
        };
    
        const loadOrganizations = async () => {
            try {
                const data = await getOrganizations();
                setOrganizations(data);
            } catch (error) {
                console.error("Failed to load organizations:", error);
    
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load organizations");
                }
            }
        };

        const loadProjects = async () => {
            try {
                const data = await getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to load projects:", error);
        
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load projects");
                }
            }
        };
        
    
        loadTasks();
        loadOrganizations();
        loadProjects();
    }, []);
    

    const handleCreateTask = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
    
        try {
            const task = await createTask({
                organizationId: Number(organizationId),
                projectId: Number(projectId),
                title,
                description: description || null,
                status,
                priority,
                dueDate: dueDate || null,
            });
    
            setTasks((currentTasks) => [
                ...currentTasks,
                task,
            ]);
    
            setTitle("");
            setDescription("");
            setOrganizationId("");
            setProjectId("");
            setPriority("MEDIUM");
            setStatus("TODO");
            setDueDate("");
        } catch (error) {
            console.error("Failed to create task:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create task");
            }
        }
    };

    const handleUpdateTask = async (taskId: number) => {
        setError("");
    
        try {
            const updatedTask = await updateTask(taskId, {
                title: editTitle,
                description: editDescription || null,
                status: editStatus,
                priority: editPriority,
                dueDate: editDueDate || null,
            });
    
            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId ? updatedTask : task
                )
            );
    
            setEditingTaskId(null);
        } catch (error) {
            console.error("Failed to update task:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to update task");
            }
        }
    };

    const handleCompleteTask = async (task: Task) => {
        setError("");
    
        try {
            const updatedTask = await updateTask(task.id, {
                title: task.title,
                description: task.description,
                status: "DONE",
                priority: task.priority,
                dueDate: task.due_date
                    ? task.due_date.split("T")[0]
                    :null,
            });
    
            setTasks((currentTasks) =>
                currentTasks.map((currentTask) =>
                    currentTask.id === task.id ? updatedTask : currentTask
                )
            );
        } catch (error) {
            console.error("Failed to complete task:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to complete task");
            }
        }
    };
    
    
    const handleDeleteTask = async (taskId: number) => {
        setError("");
    
        try {
            await deleteTask(taskId);
    
            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== taskId)
            );
        } catch (error) {
            console.error("Failed to delete task:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to delete task");
            }
        }
    };
    
    function formatDueDate(dueDate: string | null) {
        if (!dueDate) {
            return "No due date";
        }
    
        return new Date(dueDate).toLocaleDateString();
    }
    

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Tasks</h2>

            <button
                type="button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>

            <button
                type="button"
                onClick={() => navigate("/projects")}
            >
                Back to Projects
            </button>

            <h3>Create Task</h3>

            <form onSubmit={handleCreateTask}>
                <div>
                    <label htmlFor="task-title">
                        Title
                    </label>

                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="task-description">
                        Description
                    </label>

                    <textarea
                        id="task-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="task-organization">
                        Organization
                    </label>

                    <select
                        id="task-organization"
                        value={organizationId}
                        onChange={(event) => {
                            setOrganizationId(event.target.value);
                            setProjectId("");
                        }} 
                    >
                        <option value="">Select an organization</option>

                        {organizations.map((organization) => (
                            <option key={organization.id} value={organization.id}>
                                {organization.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="task-project">
                        Project
                    </label>

                    <select
                        id="task-project"
                        value={projectId}
                        onChange={(event) => setProjectId(event.target.value)}
                    >
                        <option value="">Select a project</option>

                        {filteredProjects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="task-status">
                        Status
                    </label>

                    <select
                        id="task-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="task-priority">
                        Priority
                    </label>

                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="task-due-date">
                        Due Date
                    </label>

                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                    />
                </div>

                <button type="submit">
                    Create Task
                </button>
            </form>

            {error && <p>{error}</p>}


            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <div>
                    {projects.map((project) => {
                        const projectTasks = sortTasksByUrgency(
                            tasksByProject[project.id] ?? []
                        );
                        

                        if (projectTasks.length === 0) {
                            return null;
                        }
                         
                        return (
                            <div key={project.id}>
                                <h3>{project.name}</h3>

                                <ul>
                                    {projectTasks.map((task) => (
                                        <li key={task.id}>
                                            <strong>{task.title}</strong>
                                            {" — "}
                                            {task.status}
                                            {" — "}
                                            {task.priority}
                                            {"-"}
                                            Due: {formatDueDate(task.due_date)}

                                            {task.status !== "DONE" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCompleteTask(task)}
                                                    >
                                                        Mark Done
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingTaskId(task.id);
                                                            setEditTitle(task.title);
                                                            setEditDescription(task.description ?? "");
                                                            setEditStatus(task.status);
                                                            setEditPriority(task.priority);
                                                            setEditDueDate(task.due_date ? task.due_date.split("T")[0] : "");
                                                        }}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                            {editingTaskId === task.id && (
                                                <div>
                                                    <h4>Edit Task</h4>

                                                    <div>
                                                        <label htmlFor={`edit-title-${task.id}`}>
                                                            Title
                                                        </label>

                                                        <input
                                                            id={`edit-title-${task.id}`}
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(event) =>
                                                                setEditTitle(event.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor={`edit-description-${task.id}`}>
                                                            Description
                                                        </label>

                                                        <textarea
                                                            id={`edit-description-${task.id}`}
                                                            value={editDescription}
                                                            onChange={(event) =>
                                                                setEditDescription(event.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor={`edit-status-${task.id}`}>
                                                            Status
                                                        </label>

                                                        <select
                                                            id={`edit-status-${task.id}`}
                                                            value={editStatus}
                                                            onChange={(event) =>
                                                                setEditStatus(event.target.value)
                                                            }
                                                        >
                                                            <option value="TODO">To Do</option>
                                                            <option value="IN_PROGRESS">
                                                                In Progress
                                                            </option>
                                                            <option value="DONE">Done</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label htmlFor={`edit-priority-${task.id}`}>
                                                            Priority
                                                        </label>

                                                        <select
                                                            id={`edit-priority-${task.id}`}
                                                            value={editPriority}
                                                            onChange={(event) =>
                                                                setEditPriority(event.target.value)
                                                            }
                                                        >
                                                            <option value="LOW">Low</option>
                                                            <option value="MEDIUM">Medium</option>
                                                            <option value="HIGH">High</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label htmlFor={`edit-due-date-${task.id}`}>
                                                            Due Date
                                                        </label>

                                                        <input
                                                            id={`edit-due-date-${task.id}`}
                                                            type="date"
                                                            value={editDueDate}
                                                            onChange={(event) =>
                                                                setEditDueDate(event.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateTask(task.id)}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingTaskId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );

    
}



export default TasksPage;
