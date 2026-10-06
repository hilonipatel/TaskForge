import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getProjects,
    getTasks,
    getOrganizations,
    getOrganizationMembers,
    getCurrentUserId,
    deleteTask,
} from "../services/api";
import type { Project } from "../types/project";
import type { Task } from "../types/task";
import type { OrganizationMember } from "../types/organization";
import PageLayout from "../components/PageLayout";
import "./ProjectDetailsPage.css";

type Organization = {
    id: number;
    name: string;
};

type OrganizationRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";

function ProjectDetailsPage() {
    const { projectId: projectIdParam } = useParams();
    const navigate = useNavigate();

    const [project, setProject] =
        useState<Project | null>(null);

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [organizationName, setOrganizationName] =
        useState("");

    const [organizationRole, setOrganizationRole] =
        useState<OrganizationRole | null>(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        const loadProjectDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const projectId =
                    Number(projectIdParam);

                if (!projectId) {
                    setError("Project not found");
                    return;
                }

                if (!currentUserId) {
                    setError(
                        "Unable to determine current user"
                    );
                    return;
                }

                const [
                    projects,
                    allTasks,
                    organizations,
                ] = await Promise.all([
                    getProjects(),
                    getTasks(),
                    getOrganizations(),
                ]);

                const foundProject =
                    projects.find(
                        (item: Project) =>
                            item.id === projectId
                    );

                if (!foundProject) {
                    setError("Project not found");
                    return;
                }

                setProject(foundProject);

                const projectTasks =
                    allTasks.filter(
                        (task: Task) =>
                            task.project_id ===
                            projectId
                    );

                setTasks(projectTasks);

                const organization =
                    organizations.find(
                        (
                            item: Organization
                        ) =>
                            item.id ===
                            foundProject.organization_id
                    );

                setOrganizationName(
                    organization?.name ??
                        "Unknown organization"
                );

                if (!organization) {
                    setOrganizationRole(null);
                    return;
                }

                const members =
                    await getOrganizationMembers(
                        organization.id
                    );

                const currentMember =
                    members.find(
                        (
                            member: OrganizationMember
                        ) =>
                            member.id ===
                            currentUserId
                    );

                const role =
                    currentMember?.role?.toUpperCase();

                if (
                    role === "OWNER" ||
                    role === "ADMIN" ||
                    role === "MEMBER" ||
                    role === "VIEWER"
                ) {
                    setOrganizationRole(role);
                } else {
                    setOrganizationRole(null);
                }
            } catch (error) {
                console.error(
                    "Failed to load project details:",
                    error
                );

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(
                        "Failed to load project details"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadProjectDetails();
    }, [projectIdParam, currentUserId]);

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

    /*
     * Permission matrix
     *
     * OWNER:
     * - View projects      YES
     * - Create project     YES
     * - Update project     YES
     * - Delete project     YES
     * - Manage members     YES
     * - Delete org         YES
     * - Create task        YES
     * - Update task        YES
     * - Delete task        YES
     *
     * ADMIN:
     * - View projects      YES
     * - Create project     YES
     * - Update project     YES
     * - Delete project     YES
     * - Manage members     YES
     * - Delete org         NO
     * - Create task        YES
     * - Update task        YES
     * - Delete task        YES
     *
     * MEMBER:
     * - View projects      YES
     * - Create project     YES
     * - Update project     YES
     * - Delete project     NO
     * - Manage members     NO
     * - Delete org         NO
     * - Create task        YES
     * - Update task        YES
     * - Delete task        NO
     *
     * VIEWER:
     * - View projects      YES
     * - Create project     NO
     * - Update project     NO
     * - Delete project     NO
     * - Manage members     NO
     * - Delete org         NO
     * - Create task        NO
     * - Update task        NO
     * - Delete task        NO
     */

    const canCreateTask =
        organizationRole === "OWNER" ||
        organizationRole === "ADMIN" ||
        organizationRole === "MEMBER";

    const canUpdateTask =
        organizationRole === "OWNER" ||
        organizationRole === "ADMIN" ||
        organizationRole === "MEMBER";

    const canDeleteTask =
        organizationRole === "OWNER" ||
        organizationRole === "ADMIN";

    const handleDeleteTask = async (
        task: Task
    ) => {
        setError("");

        if (!canDeleteTask) {
            setError(
                "You do not have permission to delete tasks in this project."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${task.title}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteTask(task.id);

            setTasks(
                (currentTasks) =>
                    currentTasks.filter(
                        (currentTask) =>
                            currentTask.id !==
                            task.id
                    )
            );
        } catch (error) {
            console.error(
                "Failed to delete task:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete task"
                );
            }
        }
    };

    if (loading) {
        return (
            <PageLayout title="Project Details">
                <div className="project-details-page">
                    <div className="project-loading">
                        <p>
                            Loading project...
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout title="Project Details">
                <div className="project-details-page">
                    <div className="project-error">
                        <h2>
                            Something went wrong
                        </h2>

                        <p>{error}</p>

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
            </PageLayout>
        );
    }

    if (!project) {
        return (
            <PageLayout title="Project Details">
                <div className="project-details-page">
                    <div className="project-loading">
                        <p>
                            Loading project...
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="Project Details">
            <div className="project-details-page">
                <div className="project-details-header">
                    <div>
                        <p className="page-eyebrow">
                            Project
                        </p>

                        <h2>
                            {project.name}
                        </h2>

                        <p className="page-subtitle">
                            View project information
                            and manage tasks for
                            this project.
                        </p>
                    </div>

                    <div className="project-header-actions">
                        <button
                            type="button"
                            className="secondary"
                            onClick={() =>
                                navigate(
                                    "/projects"
                                )
                            }
                        >
                            Back to Projects
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/tasks"
                                )
                            }
                        >
                            View All Tasks
                        </button>
                    </div>
                </div>

                <div className="project-info-card">
                    <div className="project-info-top">
                        <div className="project-icon">
                            {project.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <h3>
                                {project.name}
                            </h3>

                            <p>
                                {
                                    organizationName
                                }
                            </p>
                        </div>

                        {organizationRole && (
                            <span
                                className={`role-badge role-${organizationRole.toLowerCase()}`}
                            >
                                {
                                    organizationRole
                                }
                            </span>
                        )}
                    </div>

                    <div className="project-info-grid">
                        <div className="project-info-item">
                            <span className="info-label">
                                Organization
                            </span>

                            <span className="info-value">
                                {
                                    organizationName
                                }
                            </span>
                        </div>

                        <div className="project-info-item">
                            <span className="info-label">
                                Tasks
                            </span>

                            <span className="info-value">
                                {tasks.length}
                            </span>
                        </div>

                        <div className="project-info-item">
                            <span className="info-label">
                                Your Role
                            </span>

                            <span className="info-value">
                                {organizationRole ??
                                    "Unknown"}
                            </span>
                        </div>
                    </div>

                    <div className="project-description">
                        <span className="info-label">
                            Description
                        </span>

                        <p>
                            {project.description ||
                                "No description"}
                        </p>
                    </div>
                </div>

                <div className="project-tasks-section">
                    <div className="project-tasks-heading">
                        <div>
                            <h3>Tasks</h3>

                            <p>
                                Tasks assigned to
                                this project.
                            </p>
                        </div>

                        <span className="task-count">
                            {tasks.length}
                        </span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="project-empty-state">
                            <h4>
                                No tasks in this
                                project
                            </h4>

                            <p>
                                {canCreateTask
                                    ? "Add a task from the Tasks page to get started."
                                    : "You do not have permission to create tasks in this project."}
                            </p>

                            {canCreateTask && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/tasks"
                                        )
                                    }
                                >
                                    Create a Task
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="project-task-list">
                                {tasks.map(
                                    (task) => (
                                        <div
                                            key={
                                                task.id
                                            }
                                            className={`project-task-card ${
                                                task.status ===
                                                "DONE"
                                                    ? "completed"
                                                    : ""
                                            }`}
                                        >
                                            <div className="project-task-header">
                                                <div>
                                                    <h4>
                                                        {
                                                            task.title
                                                        }
                                                    </h4>
                                                </div>

                                                <div className="task-badges">
                                                    <span
                                                        className={`status-badge status-${task.status.toLowerCase()}`}
                                                    >
                                                        {task.status ===
                                                        "TODO"
                                                            ? "To Do"
                                                            : task.status ===
                                                              "IN_PROGRESS"
                                                            ? "In Progress"
                                                            : "Done"}
                                                    </span>

                                                    <span
                                                        className={`priority-badge priority-${task.priority.toLowerCase()}`}
                                                    >
                                                        {
                                                            task.priority
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="project-task-description">
                                                <span>
                                                    Description
                                                </span>

                                                <p>
                                                    {task.description ||
                                                        "No description"}
                                                </p>
                                            </div>

                                            <p className="project-task-due-date">
                                                <strong>
                                                    Due
                                                    date:
                                                </strong>{" "}
                                                {formatDueDate(
                                                    task.due_date
                                                )}
                                            </p>

                                            <div className="project-task-card-actions">
                                                {canUpdateTask && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/tasks`
                                                            )
                                                        }
                                                    >
                                                        Update Task
                                                    </button>
                                                )}

                                                {canDeleteTask && (
                                                    <button
                                                        type="button"
                                                        className="danger"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                task
                                                            )
                                                        }
                                                    >
                                                        Delete Task
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="project-task-actions">
                                <div>
                                    <h4>
                                        Manage Tasks
                                    </h4>

                                    <p>
                                        {canUpdateTask
                                            ? "You can create and update tasks for this project from the Tasks page."
                                            : "You have view-only access to tasks in this project."}
                                    </p>
                                </div>

                                {canCreateTask && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/tasks"
                                            )
                                        }
                                    >
                                        View All Tasks
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}

export default ProjectDetailsPage;
