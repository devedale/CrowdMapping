import { UserRepository, ICreateUser } from "../database/repository/user";
import { ErrorFactory } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from 'fs'

const jwt_secret_key =  process.env.JWT_SECRET_KEY || 'my_jwt_secret_key'
const jwt_exp_h =  parseInt(process.env.JWT_EXP_H) || 1;


const userRepository = new UserRepository();


class UserService {

    async registerUser(req: Request, res: Response, next: NextFunction) {
        const { nickname, email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
    
        try {    
            const newUser = await userRepository.createUser({ nickname, email, password});
            res.status(200).json({ success: true, message: 'Registrazione completata', user: newUser });
        } catch (error) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante la registrazione.')
                .setErrorDetail(error)
            );    
        } 
    }
    async loginUser(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        try {
            const user = await userRepository.getUserByEmail(email);
            if (!user) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Utente non trovato')
                    );
            }
            // Verifica della password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res
                    .status(HttpStatusCode.Unauthorized)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.Unauthorized)
                        .setDetails('Password non valida')
                    );
            }
            // Generazione del token JWT Symmetrico
            const token = jwt.sign(
                { userId: user.id, nickname: user.nickname, exp: Math.floor(Date.now() / 1000) + 60*60*jwt_exp_h }, // Payload del token
                jwt_secret_key); // Chiave segreta per la firma del token

            res.status(200).json({ success: true, message: 'Accesso riuscito', token });
    
        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il login.')
                .setErrorDetail(err)
            );
        }
    }


    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userRepository.getUsers();
            if (!users) {
                return res
                    .status(HttpStatusCode.NotFound)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.NotFound)
                        .setDetails('Utenti non trovati')
                    );
            }

            res.json({ success: true, message: 'Lista Utenti', users });
        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il recupero utenti.')
                .setErrorDetail(err)
            );
        }
    
    }

    async loginRSAUser(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;       
        try {
            const user = await userRepository.getUserByEmail(email);
            console.log('process.env.JWT_EXP_H', process.env.JWT_EXP_H);
            if (!user) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Utente non trovato')
                    );
            }
    
            // Verifica della password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res
                    .status(HttpStatusCode.Unauthorized)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.Unauthorized)
                        .setDetails('Password non valida')
                    );
            }
    
            // Generazione del token JWT Asymmetrico
            const private_key = await fs.promises.readFile('./src/services/jwtRS256.key');

            const token = jwt.sign(
                { userId: user.id, nickname: user.nickname, exp: Math.floor(Date.now() / 1000) + 60*60*jwt_exp_h }, // Payload del token
                private_key, // Chiave segreta per la firma del token
                { algorithm: 'RS256' } // Opzioni: Algoritmo di firma del token
            );
    
    
            res.json({ success: true, message: 'Accesso riuscito', token });
    
        } catch (err) {
            console.log(err);
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il login.')
                .setErrorDetail(err)
            );
        }

    }








}

export default UserService;
