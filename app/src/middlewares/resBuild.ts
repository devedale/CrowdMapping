import { Request, Response, NextFunction } from 'express';
import { ISError } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
    res.build = (errorType: string, message: string, results?: any) => {
        try{
        const error = ErrorFactory.getError(errorType);
        if (error) {
            error.setDetails(message);
            res.status(HttpStatusCode[errorType]).json(error);
            
        } else if (errorType=="OK" || errorType=="Created") {
            res.status(HttpStatusCode[errorType]).json({
                success: true,
                message: message,
                results: results
            });

        } else {
            res.status(HttpStatusCode.InternalServerError).json({
                success: false,
                message: 'Unknown error type',
                details: message
            });
        }
        } catch (err) {
        next(ISError('Error building response', err));
        }
    };
    next();
};
