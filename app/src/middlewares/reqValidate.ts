import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { ErrorFactory } from '../errors/ErrorFactory';

export default (req: Request, res: Response, next: NextFunction) => {
    req.validate = (validKeys: string[]) => {
        const keys = Object.keys(req.body);
        
        for (let key of keys) {
            if (!validKeys.includes(key)) {
                return res.build('BadRequest',`Invalid key in request body: ${key}`);
            }
        }
    }
    next();
};
