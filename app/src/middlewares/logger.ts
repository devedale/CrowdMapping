import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  console.log(`LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('\nLOGGER: Request headers:', req.headers);
  console.log('LOGGER: Request body:', req.body);

  const oldSend = res.send;
  res.send = function (data) {
    console.log('LOGGER: Response headers:', res.getHeaders());
    console.log('LOGGER: Response: Logging response data:', data);

    return oldSend.bind(this, data)();
  };

  next();
};
