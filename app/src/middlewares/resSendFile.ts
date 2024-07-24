import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
    res.sendFile = (fileBuffer, format: string) => {
        const contentType = format === 'pdf' ? 'application/pdf' : format === 'csv' ? 'text/csv' : 'application/json';
        const fileExtension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'json';

        res.setHeader('Content-Disposition', `attachment; filename=export.${fileExtension}`);
        res.setHeader('Content-Type', contentType);
        res.send(fileBuffer);

    };
    next();
};
