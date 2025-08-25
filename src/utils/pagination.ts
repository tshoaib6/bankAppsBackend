// utils/pagination.ts
import { Model, Document } from "mongoose";

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>; // Example: { createdAt: -1 }
    populate?: string[]; // Example: ["brand", "createdBy"]
    filter?: Record<string, any>; // Example: { isUsed: true }
}

export interface PaginatedResult<T> {
    data: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export const paginate = async <T extends Document>(
    model: Model<T>,
    options: PaginationOptions
): Promise<PaginatedResult<T>> => {
    const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = [],
        filter = {},
    } = options;

    const skip = (page - 1) * limit;

    let query = model.find(filter).sort(sort).skip(skip).limit(limit);

    // Apply populate
    populate.forEach((p) => {
        query = query.populate(p);
    });

    const [data, totalCount] = await Promise.all([
        query.exec(),
        model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data,
        totalCount,
        totalPages,
        currentPage: page,
    };
};
