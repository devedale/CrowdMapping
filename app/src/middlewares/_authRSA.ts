import jwt from 'jsonwebtoken';
import { ErrorFactory } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import fs from 'fs';


export const authRSAMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
    .status(HttpStatusCode.Unauthorized)
    .json(ErrorFactory
        .getError(HttpStatusCode.Unauthorized)
        .setDetails('La richiesta non ha il token nell\'header.')
    );
  }

  try {
    const public_key = await fs.promises.readFile('./src/middlewares/jwtRS256.key.pub');
    const decoded = jwt.verify(token, public_key, { algorithms: ['RS256'] })
    req['decodedToken'] = decoded; 
    req['userId'] = decoded.userId; 
    console.log('\ndecoded', decoded,'\n');

    next();
  } catch (err) {
    console.log(err);
    return res
    .status(HttpStatusCode.Forbidden)
    .json(ErrorFactory
        .getError(HttpStatusCode.Forbidden)
        .setDetails('Il token non è valido.')
    );
  }
};