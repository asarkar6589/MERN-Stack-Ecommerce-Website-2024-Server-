import { ObjectId } from "mongoose";

export interface QueryType {
    productId: ObjectId
}

export interface CommentBodyType {
    title: string,
    description: string
}

export interface DeleteParams {
    user_id: string,
    comment_id: string
}

export interface UpdateCommentBodyType {
    title?: string,
    description?: string
}

export interface Params {
    id: string,
}