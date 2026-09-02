import { createOrganization } from "../repositories/organizationRepository.js";

export async function createOrganizationForUser(
    userId: number,
    name: string
) {
    return createOrganization(name, userId);
}
