import express from 'express';
import loggerMiddleware from './middlewares/logger';
import resBuild from './middlewares/resBuild';
import resBuild from './middlewares/resSendFile';
import reqValidate from './middlewares/reqValidate';
import errorHandlerMiddleware from './middlewares/errorHandler';
import routesConfig from './routesConfig';
import dbConfig from './database/config';

 


export const app = express();


app.use(express.json()); 


app.use(loggerMiddleware);
app.use(reqValidate);
app.use(resBuild);
app.use(resBuild);


routesConfig(app);




app.use(errorHandlerMiddleware);

dbConfig();

export default app;