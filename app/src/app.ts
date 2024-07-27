import express from 'express';
import filterRequestMiddleware from './middlewares/filterRequest';
import loggerMiddleware from './middlewares/logger';
import resBuild from './middlewares/resBuild';
import resSendFile from './middlewares/resSendFile';
import reqValidate from './middlewares/reqValidate';
import errorHandlerMiddleware from './middlewares/errorHandler';
import routesConfig from './routesConfig';
import dbConfig from './database/config';

export const app = express();

app.use(express.json());

app.use(loggerMiddleware);
app.use(reqValidate);
app.use(resBuild);
app.use(resSendFile);
app.use(filterRequestMiddleware);

routesConfig(app);

app.use(errorHandlerMiddleware);

dbConfig();

export default app;
