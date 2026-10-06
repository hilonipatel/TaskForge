import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createOrganization,
    getOrganizations,
    getOrganizationMembers,
    addOrganizationMember,
    removeOrganizationMember,
    updateOrganizationMemberRole,
    deleteOrganization,
} from "../services/api";
import type {
    Organization,
    OrganizationMember,
} from "../types/organization";
import { useAuth } from "../services/AuthContext";
import PageLayout from "../components/PageLayout";
import "./OrganizationsPage.css";

function OrganizationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [selectedOrganization, setSelectedOrganization] =
        useState<Organization | null>(null);

    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    const [name, setName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState("MEMBER");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [creatingOrganization, setCreatingOrganization] = useState(false);

    const currentUserMembership = members.find(
        (member) => member.id === user?.id
    );

    const currentUserRole = currentUserMembership?.role;

    useEffect(() => {
        const loadOrganizations = async () => {
            try {
                setLoading(true);

                const data = await getOrganizations();

                setOrganizations(data);
            } catch (error) {
                console.error("Failed to load organizations:", error);

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load organizations");
                }
            } finally {
                setLoading(false);
            }
        };

        loadOrganizations();
    }, []);

    const handleOrganizationSelect = async (
        organization: Organization
    ) => {
        setSelectedOrganization(organization);
        setMembers([]);
        setError("");
        setLoadingMembers(true);

        try {
            const data = await getOrganizationMembers(organization.id);

            setMembers(data);
        } catch (error) {
            console.error(
                "Failed to load organization members:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to load organization members");
            }
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleAddMember = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!selectedOrganization) {
            return;
        }

        setError("");

        try {
            const member = await addOrganizationMember(
                selectedOrganization.id,
                memberEmail,
                memberRole
            );

            setMembers((currentMembers) => [
                ...currentMembers,
                member,
            ]);

            setMemberEmail("");
            setMemberRole("MEMBER");
        } catch (error) {
            console.error("Failed to add member:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to add member");
            }
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!selectedOrganization) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove this member?"
        );

        if (!confirmed) {
            return;
        }

        setError("");

        try {
            await removeOrganizationMember(
                selectedOrganization.id,
                userId
            );

            setMembers((currentMembers) =>
                currentMembers.filter(
                    (member) => member.id !== userId
                )
            );
        } catch (error) {
            console.error("Failed to remove member:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to remove member");
            }
        }
    };

    const handleChangeMemberRole = async (
        userId: number,
        role: string
    ) => {
        if (!selectedOrganization) {
            return;
        }

        setError("");

        try {
            const updatedMember =
                await updateOrganizationMemberRole(
                    selectedOrganization.id,
                    userId,
                    role
                );

            setMembers((currentMembers) =>
                currentMembers.map((member) =>
                    member.id === userId
                        ? {
                              ...member,
                              ...updatedMember,
                          }
                        : member
                )
            );
        } catch (error) {
            console.error(
                "Failed to update member role:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to update member role");
            }
        }
    };

    const handleDeleteOrganization = async () => {
        if (!selectedOrganization) {
            return;
        }
    
        if (currentUserRole !== "OWNER") {
            setError(
                "Only the organization owner can delete the organization."
            );
            return;
        }
    
        const confirmed = window.confirm(
            `Are you sure you want to delete "${selectedOrganization.name}"? This action cannot be undone.`
        );
    
        if (!confirmed) {
            return;
        }
    
        setError("");
    
        try {
            await deleteOrganization(
                selectedOrganization.id
            );
    
            setOrganizations((currentOrganizations) =>
                currentOrganizations.filter(
                    (organization) =>
                        organization.id !==
                        selectedOrganization.id
                )
            );
    
            setSelectedOrganization(null);
            setMembers([]);
        } catch (error) {
            console.error(
                "Failed to delete organization:",
                error
            );
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete organization"
                );
            }
        }
    };
    
    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Organization name is required");
            return;
        }

        try {
            setCreatingOrganization(true);

            const data = await createOrganization(
                name.trim()
            );

            setOrganizations((currentOrganizations) => [
                ...currentOrganizations,
                data,
            ]);

            setName("");
        } catch (error) {
            console.error(
                "Organization creation failed:",
                error
            );

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create organization");
            }
        } finally {
            setCreatingOrganization(false);
        }
    };

    const getRoleClassName = (role: string) => {
        switch (role) {
            case "OWNER":
                return "role-badge role-owner";
            case "ADMIN":
                return "role-badge role-admin";
            case "MEMBER":
                return "role-badge role-member";
            case "VIEWER":
                return "role-badge role-viewer";
            default:
                return "role-badge";
        }
    };

    return (
        <PageLayout title="Organizations">
            <div className="organizations-page">
                <div className="organizations-header">
                    <div>
                        <p className="page-eyebrow">
                            Workspace
                        </p>

                        <h2>Organizations</h2>

                        <p className="page-subtitle">
                            Manage your organizations, members,
                            and roles.
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

                <div className="organization-layout">
                    <section className="organization-create-card">
                        <div className="section-heading">
                            <div>
                                <h3>Create Organization</h3>

                                <p>
                                    Create a new workspace for
                                    your team.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label htmlFor="organization-name">
                                    Organization name
                                </label>

                                <input
                                    id="organization-name"
                                    type="text"
                                    value={name}
                                    placeholder="e.g. TaskForge Engineering"
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={creatingOrganization}
                            >
                                {creatingOrganization
                                    ? "Creating..."
                                    : "Create Organization"}
                            </button>
                        </form>
                    </section>

                    <section className="organizations-card">
                        <div className="section-heading">
                            <div>
                                <h3>Your Organizations</h3>

                                <p>
                                    Select an organization to
                                    manage its members.
                                </p>
                            </div>

                            <span className="organization-count">
                                {organizations.length}
                            </span>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                Loading organizations...
                            </div>
                        ) : organizations.length === 0 ? (
                            <div className="empty-state">
                                <h4>No organizations yet</h4>

                                <p>
                                    Create your first
                                    organization above.
                                </p>
                            </div>
                        ) : (
                            <div className="organization-list">
                                {organizations.map(
                                    (organization) => {
                                        const isSelected =
                                            selectedOrganization?.id ===
                                            organization.id;

                                        return (
                                            <button
                                                key={
                                                    organization.id
                                                }
                                                type="button"
                                                className={`organization-item ${
                                                    isSelected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleOrganizationSelect(
                                                        organization
                                                    )
                                                }
                                            >
                                                <div className="organization-icon">
                                                    {organization.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div className="organization-item-info">
                                                    <strong>
                                                        {
                                                            organization.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        Organization
                                                    </span>
                                                </div>

                                                <span className="organization-arrow">
                                                    →
                                                </span>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {selectedOrganization && (
                    <section className="selected-organization-card">
                        <div className="selected-organization-header">
                            <div>
                                <p className="page-eyebrow">
                                    Selected organization
                                </p>

                                <h3>
                                    {
                                        selectedOrganization.name
                                    }
                                </h3>

                                <p className="organization-id">
                                    Organization #
                                    {
                                        selectedOrganization.id
                                    }
                                </p>
                            </div>

                            <div className="current-role">
                                <span>Your role</span>

                                <strong
                                    className={getRoleClassName(
                                        currentUserRole ?? "UNKNOWN"
                                    )}
                                >
                                    {currentUserRole ?? "Loading"}
                                </strong>
                            </div>
                        </div>

                        {currentUserRole === "OWNER" ||
                        currentUserRole === "ADMIN" ? (
                            <div className="add-member-card">
                                <div className="section-heading">
                                    <div>
                                        <h4>Add Member</h4>

                                        <p>
                                            Invite an existing
                                            TaskForge user to
                                            this organization.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={
                                        handleAddMember
                                    }
                                    className="member-form"
                                >
                                    <div className="form-field">
                                        <label htmlFor="member-email">
                                            Email
                                        </label>

                                        <input
                                            id="member-email"
                                            type="email"
                                            value={memberEmail}
                                            placeholder="member@example.com"
                                            onChange={(
                                                event
                                            ) =>
                                                setMemberEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="member-role">
                                            Role
                                        </label>

                                        <select
                                            id="member-role"
                                            value={
                                                memberRole
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setMemberRole(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="MEMBER">
                                                Member
                                            </option>

                                            <option value="ADMIN">
                                                Admin
                                            </option>

                                            <option value="VIEWER">
                                                Viewer
                                            </option>
                                        </select>
                                    </div>

                                    <button type="submit">
                                        Add Member
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="permission-notice">
                                <strong>
                                    View-only access
                                </strong>

                                <span>
                                    You can view organization
                                    members, but you don't
                                    have permission to manage
                                    them.
                                </span>
                            </div>
                        )}

                        <div className="members-section">
                            <div className="section-heading">
                                <div>
                                    <h4>Members</h4>

                                    <p>
                                        People who belong to
                                        this organization.
                                    </p>
                                </div>

                                <span className="member-count">
                                    {members.length}
                                </span>
                            </div>

                            {loadingMembers ? (
                                <div className="loading-state">
                                    Loading members...
                                </div>
                            ) : members.length === 0 ? (
                                <div className="empty-state">
                                    <h4>
                                        No members found
                                    </h4>

                                    <p>
                                        This organization
                                        doesn't have any
                                        members yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="member-list">
                                    {members.map(
                                        (member) => (
                                            <div
                                                key={
                                                    member.id
                                                }
                                                className="member-row"
                                            >
                                                <div className="member-avatar">
                                                    {member.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div className="member-info">
                                                    <strong>
                                                        {
                                                            member.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            member.email
                                                        }
                                                    </span>
                                                </div>

                                                <div className="member-role">
                                                    {member.role ===
                                                    "OWNER" ? (
                                                        <span
                                                            className={getRoleClassName(
                                                                member.role
                                                            )}
                                                        >
                                                            OWNER
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {currentUserRole ===
                                                                "OWNER" ||
                                                            currentUserRole ===
                                                                "ADMIN" ? (
                                                                <select
                                                                    value={
                                                                        member.role
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleChangeMemberRole(
                                                                            member.id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="MEMBER">
                                                                        Member
                                                                    </option>

                                                                    <option value="ADMIN">
                                                                        Admin
                                                                    </option>

                                                                    <option value="VIEWER">
                                                                        Viewer
                                                                    </option>
                                                                </select>
                                                            ) : (
                                                                <span
                                                                    className={getRoleClassName(
                                                                        member.role
                                                                    )}
                                                                >
                                                                    {
                                                                        member.role
                                                                    }
                                                                </span>
                                                            )}

                                                            {currentUserRole ===
                                                                "OWNER" ||
                                                            currentUserRole ===
                                                                "ADMIN" ? (
                                                                <button
                                                                    type="button"
                                                                    className="danger"
                                                                    onClick={() =>
                                                                        handleRemoveMember(
                                                                            member.id
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                            {currentUserRole === "OWNER" && (
                                <div className="delete-organization-section">
                                    <button
                                        type="button"
                                        className="delete-organization"
                                        onClick={handleDeleteOrganization}
                                    >
                                        Delete Organization
                                    </button>
                                </div>
                            )}
                    </section>
                )}
            </div>
        </PageLayout>
    );
}

export default OrganizationsPage;
