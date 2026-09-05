import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjects, getTasks, getOrganizations } from "../services/api";
import type { Project } from "../types/project";
import type { Task } from "../types/task";

function ProjectDetailsPage() {
    const { projectId: projectIdParam } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [organizationName, setOrganizationName] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const loadProjectDetails = async () => {
            try {
                const projectId = Number(projectIdParam);

                const [projects, allTasks, organizations] =
                    await Promise.all([
                        getProjects(),
                        getTasks(),
                        getOrganizations(),
                    ]);

                const foundProject = projects.find(
                    (project: Project) =>
                        project.id === projectId
                );

                if (!foundProject) {
                    setError("Project not found");
                    return;
                }

                setProject(foundProject);

                const projectTasks = allTasks.filter(
                    (task: Task) =>
                        task.project_id === projectId
                );

                setTasks(projectTasks);

                const organization = organizations.find(
                    (organization: { id: number; name: string }) =>
                        organization.id ===
                        foundProject.organization_id
                );

                setOrganizationName(
                    organization?.name ?? "Unknown organization"
                );
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(
                        "Failed to load project details"
                    );
                }
            }
        };

        loadProjectDetails();
    }, [projectIdParam]);

    function formatDueDate(
        dueDate: string | null
    ) {
        if (!dueDate) {
            return "No due date";
        }

        return new Date(
            dueDate
        ).toLocaleDateString();
    }

    if (error) {
        return (
            <div>
                <h1>TaskForge</h1>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/projects")
                    }
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    if (!project) {
        return (
            <div>
                <h1>TaskForge</h1>
                <p>Loading project...</p>
            </div>
        );
    }

    return (
        <div>
            <h1>TaskForge</h1>

            <button
                type="button"
                onClick={() =>
                    navigate("/projects")
                }
            >
                Back to Projects
            </button>

            <h2>{project.name}</h2>

            <p>
                <strong>
                    Organization:
                </strong>{" "}
                {organizationName}
            </p>

            <p>
                <strong>
                    Description:
                </strong>{" "}
                {project.description ||
                    "No description"}
            </p>

            <h3>Tasks</h3>

            {tasks.length === 0 ? (
                <p>
                    No tasks in this project.
                </p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <strong>
                                {task.title}
                            </strong>

                            {" — "}

                            {task.status}

                            {" — "}

                            {task.priority}

                            {" — "}

                            Due:{" "}
                            {formatDueDate(
                                task.due_date
                            )}

                            {task.description && (
                                <p>
                                    {
                                        task.description
                                    }
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectDetailsPage;
