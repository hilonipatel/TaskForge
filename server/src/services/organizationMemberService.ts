import { AppError } from "../errors/AppError.js";
import { findOrganizationMembers, addOrganizationMember, removeOrganizationMember } from "../repositories/organizationMemberRepository.js";
import { findUserByEmail } from "../repositories/userRepository.js";
import { pool } from "../db.js";

export async function getOrganizationMembers(
    organizationId: number,
    userId: number
) {
    const membership = await pool.query(
        `
        SELECT 1
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, userId]
    );

    if (membership.rows.length === 0) {
        throw new AppError(
            "You are not a member of this organization",
            403
        );
    }

    return findOrganizationMembers(organizationId);
}

export async function addMemberToOrganization(
    organizationId: number,
    requesterId: number,
    email: string,
    role: string
) {
    const requester = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, requesterId]
    );

    if (requester.rows.length === 0) {
        throw new AppError(
            "You are not a member of this organization",
            403
        );
    }

    const requesterRole = requester.rows[0].role;

    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
        throw new AppError(
            "You do not have permission to add members",
            403
        );
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
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
        throw new AppError(
            "User is already a member of this organization",
            409
        );
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
    const requester = await pool.query(
        `
        SELECT role
        FROM organization_members
        WHERE organization_id = $1
          AND user_id = $2
        `,
        [organizationId, requesterId]
    );

    if (requester.rows.length === 0) {
        throw new AppError(
            "You are not a member of this organization",
            403
        );
    }

    const requesterRole = requester.rows[0].role;

    if (requesterRole !== "OWNER" && requesterRole !== "ADMIN") {
        throw new AppError(
            "You do not have permission to remove members",
            403
        );
    }

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
        throw new AppError(
            "Member not found",
            404
        );
    }

    const targetRole = target.rows[0].role;

    if (requesterRole === "ADMIN" && targetRole === "OWNER") {
        throw new AppError(
            "Admins cannot remove the organization owner",
            403
        );
    }

    if (requesterId === targetUserId) {
        throw new AppError(
            "You cannot remove yourself from the organization",
            400
        );
    }

    return removeOrganizationMember(
        organizationId,
        targetUserId
    );
}
