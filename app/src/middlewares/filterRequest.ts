import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {



    const customHeader = req.headers['filter-header'];

    const expectedFilterHeader = process.env.EXPECTED_FILTER_HEADER || 'noFilterHeaderValue';

    
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {

        return res.build('Forbidden','Checking request format: Forbidden Request');
      }

    if (!customHeader) {
      return res.build('BadRequest','Checking request format: Bad Request');
    }
  

    if (customHeader !== expectedFilterHeader) {
      return res.build('Unauthorized','Checking request format: Unauthorized request');
    }
  
    next();
  };
  
