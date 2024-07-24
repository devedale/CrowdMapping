import { Request, Response, NextFunction } from 'express';
import { ISError } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
    res.build = (errorType: string, message: string) => {
        try{
        const error = ErrorFactory.getError(errorType);
        if (error) {
            error.setDetails(message);
            res.status(HttpStatusCode[errorType]).json(error);
        } else {
            res.status(HttpStatusCode.InternalServerError).json({
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
