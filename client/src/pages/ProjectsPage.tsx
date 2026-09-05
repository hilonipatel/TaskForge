import { useEffect, useState } from "react";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getOrganizations,
} from "../services/api";
import type { Project } from "../types/project";
import { useNavigate } from "react-router-dom";

function ProjectsPage() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);

    const [organizations, setOrganizations] = useState<
        { id: number; name: string }[]
    >([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [organizationId, setOrganizationId] = useState("");

    const [editingProjectId, setEditingProjectId] = useState<number | null>(
        null
    );

    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const projectData = await getProjects();
                const organizationData = await getOrganizations();

                setProjects(projectData);
                setOrganizations(organizationData);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load projects");
                }
            }
        };

        loadData();
    }, []);

    const handleCreateProject = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();
        setError("");

        try {
            const project = await createProject(
                Number(organizationId),
                name,
                description || null
            );

            setProjects((currentProjects) => [
                ...currentProjects,
                project,
            ]);

            setName("");
            setDescription("");
            setOrganizationId("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create project");
            }
        }
    };

    const handleUpdateProject = async (projectId: number) => {
        setError("");

        try {
            const updatedProject = await updateProject(projectId, {
                name: editName,
                description: editDescription || null,
            });

            setProjects((currentProjects) =>
                currentProjects.map((project) =>
                    project.id === projectId
                        ? updatedProject
                        : project
                )
            );

            setEditingProjectId(null);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to update project");
            }
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        setError("");

        try {
            await deleteProject(projectId);

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (project) => project.id !== projectId
                )
            );
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to delete project");
            }
        }
    };


    return (
        <div>
            <h1>TaskForge</h1>

            <h2>Projects</h2>

            <button
                type="button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>

            <h3>Create Project</h3>

            <form onSubmit={handleCreateProject}>
                <div>
                    <label htmlFor="project-organization">
                        Organization
                    </label>

                    <select
                        id="project-organization"
                        value={organizationId}
                        onChange={(event) =>
                            setOrganizationId(event.target.value)
                        }
                    >
                        <option value="">
                            Select an organization
                        </option>

                        {organizations.map((organization) => (
                            <option
                                key={organization.id}
                                value={organization.id}
                            >
                                {organization.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="project-name">
                        Name
                    </label>

                    <input
                        id="project-name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />
                </div>

                <div>
                    <label htmlFor="project-description">
                        Description
                    </label>

                    <textarea
                        id="project-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>

                <button type="submit">
                    Create Project
                </button>
            </form>

            {error && <p>{error}</p>}

            <h3>Projects</h3>

            {projects.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                <div>
                    {organizations.map((organization) => {
                        const organizationProjects = projects.filter(
                            (project) =>
                                project.organization_id === organization.id
                        );

                        if (organizationProjects.length === 0) {
                            return null;
                        }

                        return (
                            <div key={organization.id}>
                                <h4>{organization.name}</h4>

                                <ul>
                                    {organizationProjects.map((project) => (
                                        <li key={project.id}>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                            >
                                                {project.name}
                                            </button>

                                            <p>
                                                {project.description ||
                                                    "No description"}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingProjectId(
                                                        project.id
                                                    );

                                                    setEditName(
                                                        project.name
                                                    );

                                                    setEditDescription(
                                                        project.description ?? ""
                                                    );
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteProject(
                                                        project.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                            {editingProjectId === project.id && (
                                                <div>
                                                    <h5>Edit Project</h5>

                                                    <div>
                                                        <label
                                                            htmlFor={`edit-project-name-${project.id}`}
                                                        >
                                                            Name
                                                        </label>

                                                        <input
                                                            id={`edit-project-name-${project.id}`}
                                                            type="text"
                                                            value={editName}
                                                            onChange={(event) =>
                                                                setEditName(
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor={`edit-project-description-${project.id}`}
                                                        >
                                                            Description
                                                        </label>

                                                        <textarea
                                                            id={`edit-project-description-${project.id}`}
                                                            value={editDescription}
                                                            onChange={(event) =>
                                                                setEditDescription(
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateProject(
                                                                project.id
                                                            )
                                                        }
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingProjectId(
                                                                null
                                                            )
                                                        }
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

export default ProjectsPage;
