import user from './routes/user';
import report from './routes/report';
import { Express } from 'express';

export const routesConfig = async (app: Express) => {
  user(app);
  report(app);
};

export default routesConfig;
