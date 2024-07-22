import jwt from 'jsonwebtoken';
import { ISError } from '../errors/ErrorFactory';
import fs from 'fs';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'my_jwt_secret_key';
const RSA_AUTH = process.env.RSA_AUTH == 'true' || process.env.RSA_AUTH == 'test';


const authHMACMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {

        return res.build('Unauthorized','La richiesta non ha il token nell\'header.');

    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);    
        req['decodedToken'] = decoded; 
        req['userId'] = decoded.userId; 
        console.log('\ndecoded', decoded,'\n');
        next();
    } catch (err) {
        console.log(err);
        return res.build('Forbidden','Il token non è valido.');
    }
};

const authRSAMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {

        return res.build('Unauthorized','La richiesta non ha il token nell\'header.');
    
    }

    try {
        const public_key = await fs.promises.readFile('./src/middlewares/jwtRS256.key.pub');
        const decoded = jwt.verify(token, public_key, { algorithms: ['RS256'] });
        req['decodedToken'] = decoded; 
        req['userId'] = decoded.userId; 
        console.log('\ndecoded', decoded,'\n');
        next();
    } catch (err) {

        console.log(err);
        
        return res.build('Forbidden','Il token non è valido.');
    
    }
};

export const authMiddleware = RSA_AUTH ? authRSAMiddleware : authHMACMiddleware;

export default authMiddleware;
