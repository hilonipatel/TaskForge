import { createOrganization, findOrganizationsForUser } from "../repositories/organizationRepository.js";

export async function createOrganizationForUser(
    userId: number,
    name: string
) {
    return createOrganization(name, userId);
}

export async function getOrganizationsForUser(userId: number){
    return findOrganizationsForUser(userId);
}