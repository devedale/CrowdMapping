import { ErrorMsg } from '../errors/AppError'; 
import { HttpStatusCode } from '../errors/HttpStatusCode';

export default (error: ErrorMsg, req: Request, res: Response, next: NextFunction) => {

    console.error(`\n#START LOG ERROR#\n\n${error.error}\n\n#STACK#\n\n${error.stack}\n\n#END LOG ERROR#\n`);
    delete error.error;
    res.status(HttpStatusCode.InternalServerError).json(error);
}
