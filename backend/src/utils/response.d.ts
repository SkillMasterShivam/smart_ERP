import { Response } from 'express';
interface SuccessResponseArgs<T> {
    res: Response;
    statusCode?: number;
    message?: string;
    data?: T;
    meta?: any;
}
export declare const sendSuccess: <T>({ res, statusCode, message, data, meta, }: SuccessResponseArgs<T>) => Response<any, Record<string, any>>;
interface ErrorResponseArgs {
    res: Response;
    statusCode?: number;
    code?: string;
    message: string;
    details?: any;
}
export declare const sendError: ({ res, statusCode, code, message, details, }: ErrorResponseArgs) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=response.d.ts.map