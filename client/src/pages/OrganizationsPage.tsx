import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrganization, getOrganizations, getOrganizationMembers, addOrganizationMember, removeOrganizationMember, updateOrganizationMemberRole,} from "../services/api";
import type { Organization, OrganizationMember } from "../types/organization";
import { useAuth } from "../services/AuthContext";

function OrganizationsPage() {
    const navigate = useNavigate();
    const{ user } = useAuth();
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [name, setName] = useState("");
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [error, setError] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberRole, setMemberRole] = useState("MEMBER");

    const currentUserMembership = members.find(
        (member) => member.id === user?.id
    );
    
    const currentUserRole = currentUserMembership?.role;
    
 
    useEffect(() => {
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

        loadOrganizations();
    }, []);

    const handleOrganizationSelect = async (
        organization: Organization
    ) => {
        setSelectedOrganization(organization);
        setError("");
    
        try {
            const data = await getOrganizationMembers(organization.id);
            setMembers(data);
        } catch (error) {
            console.error("Failed to load organization members:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to load organization members");
            }
        }
    };    

    const handleAddMember = async (event: React.FormEvent) => {
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
    
        setError("");
    
        try {
            await removeOrganizationMember(
                selectedOrganization.id,
                userId
            );
    
            setMembers((currentMembers) =>
                currentMembers.filter((member) => member.id !== userId)
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
            const updatedMember = await updateOrganizationMemberRole(
                selectedOrganization.id,
                userId,
                role
            );
    
            setMembers((currentMembers) =>
                currentMembers.map((member) =>
                    member.id === userId
                        ? updatedMember
                        : member
                )
            );
    
        } catch (error) {
            console.error("Failed to update member role:", error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to update member role");
            }
        }
    };

    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        try {
            const data = await createOrganization(name);

            setOrganizations((currentOrganizations) => [
                ...currentOrganizations,
                data,
            ]);

            setName("");

        } catch (error) {
            console.error("Organization creation failed:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create organization");
            }
        }
    };

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Organizations</h2>
            <button
                type="button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="organization-name">
                        Organization name
                    </label>

                    <input
                        id="organization-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

                <button type="submit">
                    Create organization
                </button>
            </form>

            <h3>Your Organizations</h3>

            {organizations.length === 0 ? (
                <p>You don't have any organizations yet.</p>
            ) : (
                <ul>
                    {organizations.map((organization) => (
                        <li key={organization.id}>
                            <button
                                type="button"
                                onClick={() => handleOrganizationSelect(organization)}
                            >
                            {organization.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedOrganization && (
                <div>
                    <h3>Selected Organization</h3>
                    <p>Name: {selectedOrganization.name}</p>
                    <p>ID: {selectedOrganization.id}</p>
                    <p>Your role: {currentUserRole}</p>
                    {(currentUserRole == "OWNER" || currentUserRole === "ADMIN") && (
                        <>
                            <h4>Add Member</h4>
                            <form onSubmit={handleAddMember}>
                                <div>
                                    <label htmlFor="member-email">
                                        Email
                                    </label>

                                    <input
                                        id="member-email"
                                        type="email"
                                        value={memberEmail}
                                        onChange={(event) => setMemberEmail(event.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="member-role">
                                        Role
                                    </label>

                                    <select
                                        id="member-role"
                                        value={memberRole}
                                        onChange={(event) => setMemberRole(event.target.value)}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>
                                </div>

                                <button type="submit">
                                    Add Member
                                </button>
                            </form>
                        </>
                    )}
                    <h4>Members</h4>

                    {members.length === 0 ? (
                        <p>No members found.</p>
                    ) : (
                        <ul>
                            {members.map((member) => (
                                <li key={member.id}>
                                    {member.name} — {member.email}
                                    
                                    {member.role === "OWNER" ? (
                                        <span> - OWNER</span>
                                    ) : (
                                        <>
                                            {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
                                                <select
                                                    value={member.role}
                                                    onChange={(event) =>
                                                        handleChangeMemberRole(
                                                            member.id,
                                                            event.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="MEMBER">Member</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                            )}

                                            {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}

                        </ul>
                    )}
                </div>

            )}
        </div>
    );
}

export default OrganizationsPage;
