import jwt from 'jsonwebtoken';
import { ErrorFactory } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'my_jwt_secret_key';


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  
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
    
    const decoded = jwt.verify(token, JWT_SECRET_KEY);    
    req['decodedToken'] = decoded; 
    req['userId'] = decoded.userId; 
    console.log('\ndecoded', decoded,'\n');
    next();
  } catch (err) {
    console.log(err)
    return res
    .status(HttpStatusCode.Forbidden)
    .json(ErrorFactory
        .getError(HttpStatusCode.Forbidden)
        .setDetails('Il token non è valido.')
    );
  }
};