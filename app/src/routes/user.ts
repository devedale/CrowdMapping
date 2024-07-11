import { usersController } from '../controllers/usersController';
import { authMiddleware } from '../middlewares/auth';
import { authRSAMiddleware } from '../middlewares/authRSA';
import { registerController } from '../controllers/registerController';
import { loginController } from '../controllers/loginController';
import UserService from '../services/user';


export default (app: Express) =>{
    const userService = new UserService();
    const base_url = `${process.env.API_VERSION || '/api'}/user`;
    app.post(`${base_url}/register`, userService.registerUser);
    app.post(`${base_url}/login`, userService.loginUser);
    app.post(`${base_url}/loginRSA`, userService.loginRSAUser);
    app.get(`${base_url}/users`, authMiddleware, userService.getUsers);
    app.get(`${base_url}/usersRSA`, authRSAMiddleware, userService.getUsers);
}




