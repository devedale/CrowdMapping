import express from 'express';
import loggerMiddleware from './middlewares/logger';
import resBuild from './middlewares/resBuild';
import errorHandlerMiddleware from './middlewares/errorHandler';
import routesConfig from './routesConfig';
import dbConfig from './database/config';

 


export const app = express();


app.use(express.json()); 


app.use(loggerMiddleware);
app.use(resBuild);


routesConfig(app);




app.use(errorHandlerMiddleware);

dbConfig();

export default app;