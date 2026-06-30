import { Request, Response } from 'express';
export declare const getHealthStatus: (req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const getServerInfo: (req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const getDbStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=health.controller.d.ts.map