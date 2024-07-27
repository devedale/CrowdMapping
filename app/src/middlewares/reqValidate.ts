import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  req.validate = (validKeys: string[]) => {
    const keys = Object.keys(req.body);

    for (const key of keys) {
      if (!validKeys.includes(key)) {
        return res.build('BadRequest', `Invalid key in request body: ${key}`);
      }
    }
  };
  next();
};
