import { UserRepository, ICreateUser } from "../database/repository/user";
import { RoleRepository} from "../database/repository/role";
import { ISError } from '../errors/ErrorFactory';
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from 'fs'

const jwt_secret_key =  process.env.JWT_SECRET_KEY || 'my_jwt_secret_key'
const jwt_exp_h =  parseInt(process.env.JWT_EXP_H) || 1;


const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

class UserService {
    async registerUser(req: Request, res: Response, next: NextFunction) {
        const { nickname, email, password } = req.body;

        if (!email || !password) {

            return res.build('BadRequest','Email and password are required in the request body');
        
        }
    
        try {   
            if (await userRepository.getUserByEmail(email)) { 

                return res.build('Conflict','Utente gia registrato');

            };
            const desiredRole = 'user';
            const role = await roleRepository.getRoleByName(desiredRole);
            if (!role) {

                return res.build('BadRequest',`Il ruolo "user" non esiste`);
            
            }
            const roleId = role.id;
            const newUser = await userRepository.createUser({ nickname, email, password, roleId });
            res.status(201).json({ success: true, message: 'Registrazione completata', user: newUser });
        } catch (error) {
            next(ISError('Errore durante la registrazione.',err));    
        } 
    }

    async loginUser(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        try {
            const user = await userRepository.getUserByEmail(email);
            if (!user) {

                return res.build('BadRequest','Utente non trovato');
            
            }

            // Verifica della password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {

                return res.build('Unauthorized','Password non valida');
            
            }

            let token;
            if (process.env.RSA_AUTH === 'true' || process.env.RSA_AUTH === 'test') {
                // Generazione del token JWT Asymmetrico
                const private_key = await fs.promises.readFile('./src/services/jwtRS256.key');
                token = jwt.sign(
                    { userId: user.id, nickname: user.nickname, exp: Math.floor(Date.now() / 1000) + 60*60*parseInt(process.env.JWT_EXP_H || '1') },
                    private_key,
                    { algorithm: 'RS256' }
                );
            } else {
                // Generazione del token JWT Symmetrico
                token = jwt.sign(
                    { userId: user.id, nickname: user.nickname, exp: Math.floor(Date.now() / 1000) + 60*60*parseInt(process.env.JWT_EXP_H || '1') },
                    process.env.JWT_SECRET_KEY
                );
            }

            res.status(200).json({ success: true, message: 'Accesso riuscito', token });

        } catch (err) {

            next(ISError('Errore durante il login.',err));
        
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userRepository.getUsers();
            if (!users) {

                return res.build('NotFound','Utenti non trovati');
      
            }

            res.status(200).json({ success: true, message: 'Lista Utenti', users });

        } catch (err) {

            next(ISE('Errore durante il recupero utenti.'),err);
        
        }
    }
}

export default UserService;
