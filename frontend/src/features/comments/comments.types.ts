export interface Comment {
    id: string;
    item_id: string;
    user_id: string;
    content: string;
    created_at: string;
    first_name?: string;
    last_name?: string;
}

export interface CreateCommentDTO {
    item_id: string;
    content: string;
}
