import authMiddleware from '../middlewares/jwtAuth';
import { authRSAMiddleware } from '../middlewares/authRSA';
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




