export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    project_id: number;
    organization_id: number;
    assignee_id: number | null;
    created_at: string;
    updated_at: string;
};
