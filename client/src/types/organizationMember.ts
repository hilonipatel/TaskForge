export type OrganizationRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER"
    | "VIEWER";

export type OrganizationMember = {
    id: number;
    name: string;
    email: string;
    role: OrganizationRole;
};
