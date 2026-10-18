import { useEffect, useState } from "react";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getOrganizations,
    getProjects,
    getOrganizationMembers,
    getCurrentUserId,
} from "../services/api";
import type { Task } from "../types/task";
import type { Project } from "../types/project";
import type { OrganizationMember } from "../types/organization";
import { 
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./TaskPage.css";

const priorityRank: Record<string, number> = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

type UserRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";

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

function TaskPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialProjectId = searchParams.get("projectId");

    const selectedProjectId = searchParams.get("projectId");

    type Organization = {
        id: number;
        name: string;
    }

    type RoleMap = Record<number, UserRole>;

    const currentUserId = getCurrentUserId();

    const [organizationRoles, setOrganizationRoles] = 
        useState<RoleMap>({});

    const getOrganizationRole = (
        organizationId: number
    ): UserRole | undefined => {
        return organizationRoles[organizationId];
    };

    const canCreateTaskInOrganization = (
        organizationId: number
    ) => {
        const role = getOrganizationRole(organizationId);

        return (
            role === "OWNER" ||
            role === "ADMIN" ||
            role === "MEMBER"
        );
    };

    const canUpdateTaskInOrganization = (
        organizationId: number
    ) => {
        const role = getOrganizationRole(organizationId);
    
        return (
            role === "OWNER" ||
            role === "ADMIN" ||
            role === "MEMBER"
        );
    };
    
    const canDeleteTaskInOrganization = (
        organizationId: number
    ) => {
        const role = getOrganizationRole(organizationId);
    
        return role === "OWNER" || role === "ADMIN";
    };

    //State

    const [organizations, setOrganizations] = useState<
        { id: number; name: string }[]
    >([]);

    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [organizationId, setOrganizationId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("TODO");
    const [dueDate, setDueDate] = useState("");

    const [editingTaskId, setEditingTaskId] =
        useState<number | null>(null);

    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] =
        useState("");

    const [editStatus, setEditStatus] =
        useState("TODO");

    const [editPriority, setEditPriority] =
        useState("MEDIUM");

    const [editDueDate, setEditDueDate] =
        useState("");

    //Filter Data

    const filteredProjects = projects.filter(
        (project) =>
            project.organization_id ===
            Number(organizationId)
    );

    const tasksByProject = projects.reduce<
        Record<number, Task[]>
    >((groups, project) => {
        groups[project.id] = tasks.filter(
            (task) =>
                task.project_id === project.id
        );

        return groups;
    }, {});

    const visibleTaskCount = selectedProjectId
    ? tasksByProject[Number(selectedProjectId)]?.length ?? 0
    : tasks.length;

    //Load Data
    useEffect(() => {
        let cancelled = false;
    
        const loadData = async () => {
            try {
                setError("");
    
                if (!currentUserId) {
                    throw new Error(
                        "Unable to determine current user"
                    );
                }
    
                const [
                    taskData,
                    organizationData,
                    projectData,
                ] = await Promise.all([
                    getTasks(),
                    getOrganizations(),
                    getProjects(),
                ]);
    
                const roleEntries = await Promise.all(
                    organizationData.map(
                        async (organization: Organization) => {
                            const members =
                                await getOrganizationMembers(
                                    organization.id
                                );
    
                            const currentMember = members.find(
                                (member: OrganizationMember) =>
                                    Number(member.id) === currentUserId
                            );
    
                            const role =
                                currentMember?.role?.toUpperCase();
    
                            if (
                                role === "OWNER" ||
                                role === "ADMIN" ||
                                role === "MEMBER" ||
                                role === "VIEWER"
                            ) {
                                return [
                                    organization.id,
                                    role,
                                ] as const;
                            }
    
                            return [
                                organization.id,
                                undefined,
                            ] as const;
                        }
                    )
                );
    
                if (cancelled) return;
    
                const roles: RoleMap = {};
    
                for (const [id, role] of roleEntries) {
                    if (role) {
                        roles[id] = role;
                    }
                }
    
                setTasks(taskData);
                setOrganizations(organizationData);
                setProjects(projectData);
                setOrganizationRoles(roles);
            } catch (error) {
                if (cancelled) return;
    
                console.error(
                    "Failed to load task data:",
                    error
                );
    
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load task data"
                );
            }
        };
    
        loadData();
    
        return () => {
            cancelled = true;
        };
    }, []);

    // Preselect organization and project from URL
    useEffect(() => {
        if (!initialProjectId || projects.length === 0) {
            return;
        }

        const parsedProjectId = Number(initialProjectId);

        if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
            setError("Invalid project ID.");
            return;
        }

        const selectedProject = projects.find(
            (project) => project.id === parsedProjectId
        );

        if (!selectedProject) {
            setError("Project not found.");
            return;
        }

        setOrganizationId(String(selectedProject.organization_id));
        setProjectId(String(selectedProject.id));
    }, [initialProjectId, projects]);
    

    // Create Task
    const handleCreateTask = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!organizationId) {
            setError("Please select an organization.");
            return;
        }

        if (!projectId) {
            setError("Please select a project.");
            return;
        }

        const selectedOrganizationId = Number(organizationId);
        const selectedProjectId = Number(projectId);

        const selectedProject = projects.find(
            (project) => project.id === selectedProjectId
        );

        if (
            !selectedProject ||
            selectedProject.organization_id !== selectedOrganizationId
        ) {
            setError(
                "The selected project does not belong to this organization."
            );
            return;
        }

        if (
            !canCreateTaskInOrganization(selectedOrganizationId)
        ) {
            setError(
                "You do not have permission to create tasks."
            );
            return;
        }

        setError("");

        try {
            const task = await createTask({
                organizationId: Number(
                    organizationId
                ),
                projectId: Number(projectId),
                title,
                description:
                    description || null,
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
            if (!selectedProject){
                setOrganizationId("");
                setProjectId("");
            }
            setPriority("MEDIUM");
            setStatus("TODO");
            setDueDate("");
        } catch (error) {
            console.error(
                "Failed to create task:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to create task"
                );
            }
        }
    };

    // Update Task

    const handleUpdateTask = async (taskId: number,) => {
        const task = tasks.find((t) => t.id === taskId);

        if (!task) {
            setError("Task not found.");
            return
        }

        if (!canUpdateTaskInOrganization(task.organization_id)) {
            setError("You do not have permission to update tasks.");
            return;
        }

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
            console.error( "Failed to update task:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update task"
            )
        }
    };

    // Complete Task

    const handleCompleteTask = async (task: Task) => {
        if (!canUpdateTaskInOrganization(task.organization_id)) {
            setError("You do not have permission to update tasks.");
            return;
        }

        setError("");

        try {
            const updatedTask = await updateTask(task.id, {
                title: task.title,
                description: task.description,
                status: "DONE",
                priority: task.priority,
                dueDate: task.due_date
                    ? task.due_date.split("T")[0]
                    : null,
            });

            setTasks((currentTasks) =>
                currentTasks.map((t) =>
                    t.id === task.id ? updatedTask : t
                )
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to complete task"
            )
        }
    };

    // Delete Task

    const handleDeleteTask = async (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);

        if (!task) {
            setError("Task not found.");
            return
        }


        if (!canDeleteTaskInOrganization(task.organization_id)) {
            setError( "You do not have permission to delete tasks.");
            return;
        }

        setError("");

        try {
            await deleteTask(taskId);

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => task.id !== taskId
                )
            );
        } catch (error) {
            console.error("Failed to delete task:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete task"
            )
        }
    };

    // Helpers

    function formatDueDate(
        dueDate: string | null
    ) {
        if (!dueDate) {
            return "No due date";
        }

        return new Date(
            dueDate
        ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    return (
        <PageLayout title="Tasks">
            <div className="tasks-page">

                {/* HEADER */}

                <div className="tasks-header">
                    <div>
                        <p className="page-eyebrow">
                            Workspace
                        </p>

                        <h2>Tasks</h2>

                        <p className="page-subtitle">
                            Create, organize, and
                            track your project
                            tasks.
                        </p>
                    </div>

                    <div className="tasks-header-actions">
                        <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            Back to Dashboard
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/projects"
                                )
                            }
                        >
                            Back to Projects
                        </button>
                    </div>
                </div>

                {/* Role Badge */}

                {organizationId && (
                    <div className="task-role-badge">
                        <span>Role</span>
                        <strong>
                            {getOrganizationRole(
                                Number(organizationId)
                            ) ?? "Unknown"}
                        </strong>
                    </div>
                )}

                {/* Error */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Create Task - Owner, Admin, Member */}

                {(
                    selectedProjectId
                        ? Boolean(
                            organizationId &&
                            canCreateTaskInOrganization(Number(organizationId))
                        )
                        : organizations.some((organization) =>
                            canCreateTaskInOrganization(organization.id)
                        )
                ) && (
                    <div className="task-form">
                        <div className="section-heading">
                            <div>
                                <h3>
                                    Create Task
                                </h3>

                                <p>
                                    Add a new task
                                    and assign
                                    it to a
                                    project.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={
                                handleCreateTask
                            }
                        >
                            <div className="task-form-grid">
                                <div className="form-field">
                                    <label htmlFor="task-title">
                                        Title
                                    </label>

                                    <input
                                        id="task-title"
                                        type="text"
                                        value={title}
                                        onChange={(
                                            event
                                        ) =>
                                            setTitle(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter task title"
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="task-organization">
                                        Organization
                                    </label>

                                    <select
                                        id="task-organization"
                                        value={
                                            organizationId
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setOrganizationId(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setProjectId(
                                                ""
                                            );
                                        }}
                                        required
                                    >
                                        <option value="">
                                            Select an
                                            organization
                                        </option>

                                        {organizations
                                            .filter((organization) =>
                                                canCreateTaskInOrganization(organization.id)
                                            )
                                            .map((organization) => (
                                                <option
                                                    key={
                                                        organization.id
                                                    }
                                                    value={
                                                        organization.id
                                                    }
                                                >
                                                    {
                                                        organization.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="task-description">
                                    Description
                                </label>

                                <textarea
                                    id="task-description"
                                    value={
                                        description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Describe the task"
                                />
                            </div>

                            <div className="task-form-grid">
                                <div className="form-field">
                                    <label htmlFor="task-project">
                                        Project
                                    </label>

                                    <select
                                        id="task-project"
                                        value={
                                            projectId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setProjectId(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        disabled={
                                            !organizationId
                                        }
                                    >
                                        <option value="">
                                            Select a
                                            project
                                        </option>

                                        {filteredProjects.map(
                                            (
                                                project
                                            ) => (
                                                <option
                                                    key={
                                                        project.id
                                                    }
                                                    value={
                                                        project.id
                                                    }
                                                >
                                                    {
                                                        project.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="task-status">
                                        Status
                                    </label>

                                    <select
                                        id="task-status"
                                        value={
                                            status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatus(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="TODO">
                                            To Do
                                        </option>

                                        <option value="IN_PROGRESS">
                                            In Progress
                                        </option>

                                        <option value="DONE">
                                            Done
                                        </option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="task-priority">
                                        Priority
                                    </label>

                                    <select
                                        id="task-priority"
                                        value={
                                            priority
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPriority(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="LOW">
                                            Low
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="HIGH">
                                            High
                                        </option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="task-due-date">
                                        Due Date
                                    </label>

                                    <input
                                        id="task-due-date"
                                        type="date"
                                        value={
                                            dueDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDueDate(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <button type="submit">
                                Create Task
                            </button>
                        </form>
                    </div>
                )}

                {/* Task List */}

                <div className="tasks-section">
                    <div className="tasks-section-heading">
                        <div>
                            <h3>Tasks</h3>

                            <p>
                                Tasks are grouped
                                by project and
                                sorted by
                                urgency.
                            </p>
                        </div>

                        <span className="task-count">
                            {visibleTaskCount}
                        </span>
                        {selectedProjectId && (
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => {
                                    setSearchParams({});
                                    setOrganizationId("");
                                    setProjectId("");
                                }}
                            >
                                Clear Project Filter
                            </button>
                        )}
                    </div>

                    {visibleTaskCount === 0 ? (
                        <div className="empty-state">
                            <h4>
                                {selectedProjectId
                                    ? "No tasks in this project yet"
                                    : "No tasks found"}
                            </h4>

                            <p>
                                {organizations.some((organization) =>
                                    canCreateTaskInOrganization(organization.id)
                                )
                                        ? "Create your first task to get started."
                                        : "There are currently no tasks available."}
                            </p>
                        </div>
                    ) : (
                        <div className="task-groups">
                            {organizations.map((organization) => {
                                const organizationProjects = projects.filter(
                                    (project) =>
                                        project.organization_id === organization.id
                                );

                                const visibleProjects = selectedProjectId
                                    ? organizationProjects.filter(
                                        (project) =>
                                            project.id === Number(selectedProjectId)
                                    )
                                    : organizationProjects;

                                const organizationTaskCount = visibleProjects.reduce(
                                    (total, project) =>
                                        total + (tasksByProject[project.id]?.length ?? 0), 0
                                );
                                const projectsWithTasks = visibleProjects.filter(
                                    (project) =>
                                        (tasksByProject[project.id]?.length ?? 0) > 0
                                );

                                if (organizationTaskCount === 0) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={organization.id }
                                        className="task-organization-group"
                                    >
                                        <div className="task-organization-heading">
                                            <div>
                                                <h2>{organization.name}</h2>
                                                <p>
                                                    {projectsWithTasks.length}{" "}
                                                    {projectsWithTasks.length === 1 ? "project" : "projects"}
                                                    {" · "}
                                                    {organizationTaskCount}{" "}
                                                    {organizationTaskCount === 1
                                                        ? "task"
                                                        : "tasks"}
                                                </p>
                                            </div>
                                        </div>

                                        {visibleProjects.map((project) => {
                                            const projectTasks = sortTasksByUrgency(
                                                tasksByProject[project.id] ?? []
                                            );

                                            if (projectTasks.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={project.id}
                                                    className="task-project-group"
                                                >
                                                    <div className="task-project-heading">
                                                        <div className="task-project-icon">
                                                            {project.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    
                                                        <div className="task-project-title">
                                                            <h3>{project.name}</h3>
                                                            <span>
                                                                {projectTasks.length}{" "}
                                                                {projectTasks.length === 1
                                                                    ? "task"
                                                                    : "tasks"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="task-list">
                                                        {projectTasks.map((task) => (
                                                            <div
                                                                key={task.id}
                                                                className={`task-card ${
                                                                    task.status === "DONE"
                                                                        ? "completed"
                                                                        : ""
                                                                }`}
                                                            >
                                                            <div className="task-card-header">
                                                                <h4>{task.title}</h4>
                                                                <div className="task-badges">
                                                                    <span
                                                                        className={`status-badge status-${task.status.toLowerCase()}`}
                                                                    >
                                                                        {task.status === "TODO"
                                                                            ? "To Do"
                                                                            : task.status === "IN_PROGRESS"
                                                                            ? "In Progress"
                                                                            : "Done"}
                                                                    </span>

                                                                    <span
                                                                        className={`priority-badge priority-${task.priority.toLowerCase()}`}
                                                                    >
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <p className="task-description">
                                                                {task.description || "No description"}
                                                            </p>

                                                            <p className="task-due-date">
                                                                Due Date: {formatDueDate(task.due_date)}
                                                            </p>

                                                            {(canUpdateTaskInOrganization(task.organization_id) ||
                                                            canDeleteTaskInOrganization(task.organization_id)) && (
                                                                <div className="task-actions">
                                                                    {task.status !== "DONE" &&
                                                                        canUpdateTaskInOrganization(task.organization_id) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleCompleteTask(task)}
                                                                            >
                                                                                Mark Done
                                                                            </button>
                                                                        )}

                                                                    {/* Edit: authorized users, active or completed tasks */}
                                                                    {canUpdateTaskInOrganization(task.organization_id) && (
                                                                        <button
                                                                            type="button"
                                                                            className="secondary"
                                                                            onClick={() => {
                                                                                setEditingTaskId(task.id);
                                                                                setEditTitle(task.title);
                                                                                setEditDescription(task.description ?? "");
                                                                                setEditStatus(task.status);
                                                                                setEditPriority(task.priority);
                                                                                setEditDueDate(
                                                                                    task.due_date
                                                                                        ? task.due_date.split("T")[0]
                                                                                        : ""
                                                                                );
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    )}

                                                                    {/* Delete: Owner/Admin, regardless of task status */}
                                                                    {canDeleteTaskInOrganization(task.organization_id) && (
                                                                        <button
                                                                            type="button"
                                                                            className="danger"
                                                                            onClick={() => handleDeleteTask(task.id)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {editingTaskId ===
                                                                task.id &&
                                                                canUpdateTaskInOrganization(task.organization_id) && (
                                                                    <div className="edit-task">
                                                                        <h5>Edit Task</h5>
                                                                        <div className="form-field">
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

                                                                        <div className="form-field">
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

                                                                        <div className="task-form-grid">
                                                                            <div className="form-field">
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

                                                                            <div className="form-field">
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

                                                                            <div className="form-field">
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
                                                                        </div>

                                                                        <div className="task-actions">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleUpdateTask(task.id,)
                                                                                }
                                                                            >
                                                                                Save
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                className="secondary"
                                                                                onClick={() =>
                                                                                    setEditingTaskId(null)
                                                                                }
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}

export default TaskPage;