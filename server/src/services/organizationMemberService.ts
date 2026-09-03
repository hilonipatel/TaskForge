import { AppError } from "../errors/AppError.js";
import { findOrganizationMembers, addOrganizationMember, removeOrganizationMember, updateOrganizationMemberRole } from "../repositories/organizationMemberRepository.js";
import { findUserByEmail } from "../repositories/userRepository.js";
import { pool } from "../db.js";
import { requireOrganizationRole } from "./authorizationService.js";

export async function getOrganizationMembers(
    organizationId: number,
    userId: number
) {
    await requireOrganizationRole(
        userId,
        organizationId,
        ["OWNER", "ADMIN", "MEMBER", "VIEWER"]
    );

    return findOrganizationMembers(organizationId);
}

export async function addMemberToOrganization(
    organizationId: number,
    requesterId: number,
    email: string,
    role: string
) {
    await requireOrganizationRole(
        requesterId,
        organizationId,
        ["OWNER", "ADMIN"]
    );

    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const existingMembership = await pool.query(
        `
        SELECT 1
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, user.id]
    );

    if (existingMembership.rows.length > 0) {
        throw new AppError("User is already a member of this organization", 409);
    }

    return addOrganizationMember(
        organizationId,
        user.id,
        role
    );
}

export async function removeMemberFromOrganization(
    organizationId: number,
    requesterId: number,
    targetUserId: number
) {
    const requesterRole = await requireOrganizationRole(
        requesterId,
        organizationId,
        ["OWNER", "ADMIN"]
    );

    const target = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, targetUserId]
    );

    if (target.rows.length === 0) {
        throw new AppError("Member not found", 404);
    }

    const targetRole = target.rows[0].role;

    if (
        requesterRole === "ADMIN" &&
        targetRole === "OWNER"
    ) {
        throw new AppError("Admins cannot remove the organization owner", 403);
    }

    if (requesterId === targetUserId) {
        throw new AppError("You cannot remove yourself from the organization", 400);
    }

    return removeOrganizationMember(
        organizationId,
        targetUserId
    );
}

export async function changeMemberRole(
    organizationId: number,
    requesterId: number,
    targetUserId: number,
    newRole: string
) {
    await requireOrganizationRole(
        requesterId,
        organizationId,
        ["OWNER", "ADMIN"]
    );

    const target = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, targetUserId]
    );

    if (target.rows.length === 0) {
        throw new AppError("User is not a member of this organization", 404);
    }

    const targetRole = target.rows[0].role;

    if (targetRole === "OWNER") {
        throw new AppError("The organization owner role cannot be changed", 403);
    }

    if (newRole === "OWNER") {
        throw new AppError("Cannot assign the OWNER role", 403);
    }

    return updateOrganizationMemberRole(
        organizationId,
        targetUserId,
        newRole
    );
}
