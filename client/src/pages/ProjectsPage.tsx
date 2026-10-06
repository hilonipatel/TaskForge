import { useEffect, useState } from "react";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getOrganizations,
    getOrganizationMembers,
    getCurrentUserId,
} from "../services/api";
import type { Project } from "../types/project";
import type { OrganizationMember } from "../types/organization";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./ProjectsPage.css";

type Organization = {
    id: number;
    name: string;
};

type OrganizationRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";

type RoleMap = Record<number, OrganizationRole>;

function ProjectsPage() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [organizations, setOrganizations] = useState<
        Organization[]
    >([]);
    const [organizationRoles, setOrganizationRoles] =
        useState<RoleMap>({});

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [organizationId, setOrganizationId] =
        useState("");

    const [editingProjectId, setEditingProjectId] =
        useState<number | null>(null);

    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [creatingProject, setCreatingProject] =
        useState(false);
    const [updatingProjectId, setUpdatingProjectId] =
        useState<number | null>(null);
    const [deletingProjectId, setDeletingProjectId] =
        useState<number | null>(null);

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                if (!currentUserId) {
                    throw new Error(
                        "Unable to determine current user"
                    );
                }

                const [
                    projectData,
                    organizationData,
                ] = await Promise.all([
                    getProjects(),
                    getOrganizations(),
                ]);

                setProjects(projectData);
                setOrganizations(organizationData);

                const roleEntries = await Promise.all(
                    organizationData.map(
                        async (
                            organization: Organization
                        ) => {
                            const members =
                                await getOrganizationMembers(
                                    organization.id
                                );

                            const currentMember =
                                members.find(
                                    (
                                        member: OrganizationMember
                                    ) =>
                                        String(
                                            member.id
                                        ) ===
                                        String(
                                            currentUserId
                                        )
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

                const roles: RoleMap = {};

                roleEntries.forEach(
                    ([organizationId, role]) => {
                        if (role) {
                            roles[organizationId] =
                                role;
                        }
                    }
                );

                setOrganizationRoles(roles);
            } catch (error) {
                console.error(
                    "Failed to load projects:",
                    error
                );

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError(
                        "Failed to load projects"
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentUserId]);

    /*
     * Permission model
     *
     * OWNER:
     * - View projects
     * - Create projects
     * - Update projects
     * - Delete projects
     *
     * ADMIN:
     * - View projects
     * - Create projects
     * - Update projects
     * - Delete projects
     *
     * MEMBER:
     * - View projects
     * - Create projects
     * - Update projects
     * - Cannot delete projects
     *
     * VIEWER:
     * - View projects only
     */

    const canCreateProject = (
        organizationId: number
    ) => {
        const role =
            organizationRoles[organizationId];

        return (
            role === "OWNER" ||
            role === "ADMIN" ||
            role === "MEMBER"
        );
    };

    const canUpdateProject = (
        organizationId: number
    ) => {
        const role =
            organizationRoles[organizationId];

        return (
            role === "OWNER" ||
            role === "ADMIN" ||
            role === "MEMBER"
        );
    };

    const canDeleteProject = (
        organizationId: number
    ) => {
        const role =
            organizationRoles[organizationId];

        return (
            role === "OWNER" ||
            role === "ADMIN"
        );
    };

    const handleCreateProject = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();
        setError("");

        if (!organizationId) {
            setError(
                "Please select an organization."
            );
            return;
        }

        const selectedOrganizationId =
            Number(organizationId);

        if (
            !canCreateProject(
                selectedOrganizationId
            )
        ) {
            setError(
                "You do not have permission to create projects in this organization."
            );
            return;
        }

        if (!name.trim()) {
            setError(
                "Project name is required."
            );
            return;
        }

        try {
            setCreatingProject(true);

            const project =
                await createProject(
                    selectedOrganizationId,
                    name.trim(),
                    description.trim() || null
                );

            setProjects(
                (currentProjects) => [
                    ...currentProjects,
                    project,
                ]
            );

            setName("");
            setDescription("");
            setOrganizationId("");
        } catch (error) {
            console.error(
                "Failed to create project:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to create project."
                );
            }
        } finally {
            setCreatingProject(false);
        }
    };

    const startEditingProject = (
        project: Project
    ) => {
        setError("");
        setEditingProjectId(project.id);
        setEditName(project.name);
        setEditDescription(
            project.description ?? ""
        );
    };

    const cancelEditingProject = () => {
        setEditingProjectId(null);
        setEditName("");
        setEditDescription("");
    };

    const handleUpdateProject = async (
        project: Project
    ) => {
        setError("");

        if (
            !canUpdateProject(
                project.organization_id
            )
        ) {
            setError(
                "You do not have permission to update this project."
            );
            return;
        }

        if (!editName.trim()) {
            setError(
                "Project name is required."
            );
            return;
        }

        try {
            setUpdatingProjectId(project.id);

            const updatedProject =
                await updateProject(
                    project.id,
                    {
                        name: editName.trim(),
                        description:
                            editDescription.trim() ||
                            null,
                    }
                );

            setProjects(
                (currentProjects) =>
                    currentProjects.map(
                        (currentProject) =>
                            currentProject.id ===
                            project.id
                                ? updatedProject
                                : currentProject
                    )
            );

            cancelEditingProject();
        } catch (error) {
            console.error(
                "Failed to update project:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to update project."
                );
            }
        } finally {
            setUpdatingProjectId(null);
        }
    };

    const handleDeleteProject = async (
        project: Project
    ) => {
        setError("");

        if (
            !canDeleteProject(
                project.organization_id
            )
        ) {
            setError(
                "You do not have permission to delete this project."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${project.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingProjectId(project.id);

            await deleteProject(project.id);

            setProjects(
                (currentProjects) =>
                    currentProjects.filter(
                        (currentProject) =>
                            currentProject.id !==
                            project.id
                    )
            );

            if (
                editingProjectId ===
                project.id
            ) {
                cancelEditingProject();
            }
        } catch (error) {
            console.error(
                "Failed to delete project:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete project."
                );
            }
        } finally {
            setDeletingProjectId(null);
        }
    };

    return (
        <PageLayout title="Projects">
            <div className="projects-page">
                <div className="projects-header">
                    <div>
                        <p className="page-eyebrow">
                            Workspace
                        </p>

                        <h2>Projects</h2>

                        <p className="page-subtitle">
                            Organize your work into
                            projects and keep
                            everything on track.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <section className="project-form">
                    <div className="section-heading">
                        <div>
                            <h3>
                                Create Project
                            </h3>

                            <p>
                                Create a project
                                inside one of
                                your
                                organizations.
                            </p>
                        </div>
                    </div>

                    {organizations.some(
                        (organization) =>
                            canCreateProject(
                                organization.id
                            )
                    ) ? (
                        <form
                            onSubmit={
                                handleCreateProject
                            }
                        >
                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="project-organization">
                                        Organization
                                    </label>

                                    <select
                                        id="project-organization"
                                        value={
                                            organizationId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setOrganizationId(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select an
                                            organization
                                        </option>

                                        {organizations
                                            .filter(
                                                (
                                                    organization
                                                ) =>
                                                    canCreateProject(
                                                        organization.id
                                                    )
                                            )
                                            .map(
                                                (
                                                    organization
                                                ) => (
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

                                <div className="form-field">
                                    <label htmlFor="project-name">
                                        Project name
                                    </label>

                                    <input
                                        id="project-name"
                                        type="text"
                                        value={name}
                                        placeholder="e.g. TaskForge Frontend"
                                        onChange={(
                                            event
                                        ) =>
                                            setName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="project-description">
                                    Description
                                </label>

                                <textarea
                                    id="project-description"
                                    value={
                                        description
                                    }
                                    placeholder="Describe what this project is about..."
                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    creatingProject
                                }
                            >
                                {creatingProject
                                    ? "Creating..."
                                    : "Create Project"}
                            </button>
                        </form>
                    ) : (
                        <div className="empty-state">
                            <h4>
                                You cannot create
                                projects
                            </h4>

                            <p>
                                You need to be an
                                organization owner,
                                admin, or member to
                                create projects.
                            </p>
                        </div>
                    )}
                </section>

                <section className="projects-section">
                    <div className="section-heading">
                        <div>
                            <h3>
                                Your Projects
                            </h3>

                            <p>
                                Projects are
                                grouped by
                                organization.
                            </p>
                        </div>

                        <span className="project-count">
                            {projects.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            Loading projects...
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="empty-state">
                            <h4>
                                No projects yet
                            </h4>

                            <p>
                                There are no
                                projects available
                                to you.
                            </p>
                        </div>
                    ) : (
                        <div className="organization-projects">
                            {organizations.map(
                                (
                                    organization
                                ) => {
                                    const organizationProjects =
                                        projects.filter(
                                            (
                                                project
                                            ) =>
                                                project.organization_id ===
                                                organization.id
                                        );

                                    if (
                                        organizationProjects.length ===
                                        0
                                    ) {
                                        return null;
                                    }

                                    const role =
                                        organizationRoles[
                                            organization.id
                                        ];

                                    return (
                                        <div
                                            key={
                                                organization.id
                                            }
                                            className="project-group"
                                        >
                                            <div className="project-group-header">
                                                <div className="project-group-info">
                                                    <div className="project-group-icon">
                                                        {organization.name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <h4>
                                                            {
                                                                organization.name
                                                            }
                                                        </h4>

                                                        <span>
                                                            {
                                                                organizationProjects.length
                                                            }{" "}
                                                            {organizationProjects.length ===
                                                            1
                                                                ? "project"
                                                                : "projects"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {role && (
                                                    <span
                                                        className={`role-badge role-${role.toLowerCase()}`}
                                                    >
                                                        {
                                                            role
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            <div className="project-list">
                                                {organizationProjects.map(
                                                    (
                                                        project
                                                    ) => {
                                                        const canUpdate =
                                                            canUpdateProject(
                                                                project.organization_id
                                                            );

                                                        const canDelete =
                                                            canDeleteProject(
                                                                project.organization_id
                                                            );

                                                        const isUpdating =
                                                            updatingProjectId ===
                                                            project.id;

                                                        const isDeleting =
                                                            deletingProjectId ===
                                                            project.id;

                                                        return (
                                                            <div
                                                                key={
                                                                    project.id
                                                                }
                                                                className="project-card"
                                                            >
                                                                <div className="project-card-top">
                                                                    <div className="project-icon">
                                                                        {project.name
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <div className="project-card-title">
                                                                        <h4>
                                                                            {
                                                                                project.name
                                                                            }
                                                                        </h4>

                                                                        <span>
                                                                            Project
                                                                            #
                                                                            {
                                                                                project.id
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <p className="project-description">
                                                                    {project.description ||
                                                                        "No description provided."}
                                                                </p>

                                                                <div className="project-actions">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/projects/${project.id}`
                                                                            )
                                                                        }
                                                                    >
                                                                        Open Project
                                                                    </button>

                                                                    {canUpdate && (
                                                                        <button
                                                                            type="button"
                                                                            className="secondary"
                                                                            disabled={
                                                                                isUpdating ||
                                                                                isDeleting
                                                                            }
                                                                            onClick={() =>
                                                                                startEditingProject(
                                                                                    project
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    )}

                                                                    {canDelete && (
                                                                        <button
                                                                            type="button"
                                                                            className="danger"
                                                                            disabled={
                                                                                isDeleting ||
                                                                                isUpdating
                                                                            }
                                                                            onClick={() =>
                                                                                handleDeleteProject(
                                                                                    project
                                                                                )
                                                                            }
                                                                        >
                                                                            {isDeleting
                                                                                ? "Deleting..."
                                                                                : "Delete"}
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {editingProjectId ===
                                                                    project.id &&
                                                                    canUpdate && (
                                                                        <div className="edit-project">
                                                                            <div className="section-heading">
                                                                                <div>
                                                                                    <h5>
                                                                                        Edit
                                                                                        Project
                                                                                    </h5>

                                                                                    <p>
                                                                                        Update
                                                                                        the
                                                                                        project
                                                                                        information.
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="form-field">
                                                                                <label
                                                                                    htmlFor={`edit-project-name-${project.id}`}
                                                                                >
                                                                                    Project
                                                                                    name
                                                                                </label>

                                                                                <input
                                                                                    id={`edit-project-name-${project.id}`}
                                                                                    type="text"
                                                                                    value={
                                                                                        editName
                                                                                    }
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                    onChange={(
                                                                                        event
                                                                                    ) =>
                                                                                        setEditName(
                                                                                            event
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="form-field">
                                                                                <label
                                                                                    htmlFor={`edit-project-description-${project.id}`}
                                                                                >
                                                                                    Description
                                                                                </label>

                                                                                <textarea
                                                                                    id={`edit-project-description-${project.id}`}
                                                                                    value={
                                                                                        editDescription
                                                                                    }
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                    onChange={(
                                                                                        event
                                                                                    ) =>
                                                                                        setEditDescription(
                                                                                            event
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="project-actions">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleUpdateProject(
                                                                                            project
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {isUpdating
                                                                                        ? "Saving..."
                                                                                        : "Save Changes"}
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="secondary"
                                                                                    disabled={
                                                                                        isUpdating
                                                                                    }
                                                                                    onClick={
                                                                                        cancelEditingProject
                                                                                    }
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </section>
            </div>
        </PageLayout>
    );
}

export default ProjectsPage;
