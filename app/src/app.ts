import express from 'express';
import loggerMiddleware from './middlewares/logger';
import errorHandlerMiddleware from './middlewares/errorHandler';
import routesConfig from './routesConfig';
import dbConfig from './database/config';

 


export const app = express();


app.use(express.json()); 


app.use(loggerMiddleware);


routesConfig(app);



app.use(errorHandlerMiddleware);

dbConfig();

export default app;