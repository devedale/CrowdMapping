import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
    res.build = (errorType: string, message: string) => {
        const error = ErrorFactory.getError2(errorType);
        if (error) {
            error.setDetails(message);
            res.status(HttpStatusCode[errorType]).json(error);
        } else {
            res.status(HttpStatusCode.InternalServerError).json({
                message: 'Unknown error type',
                details: message
            });
        }
    };
    next();
};
