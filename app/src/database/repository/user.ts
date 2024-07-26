import { User } from "../models/user";
import { RoleRepository } from "./role"; 

interface ICreateUser {
    nickname: string;
    email: string;
    password: string;
}

interface UserRank {
    nickname: string;
    coins: number;
}

const roleRepository =new RoleRepository();

class UserRepository {
    async createUser(data: ICreateUser): Promise<User> {
        try {
            const user = await User.dao.create(data);
            
            return user as User;
        
        } catch (error) {
            console.error(error);
            throw new Error("Creazione user fallita");
        }
    }

    async createAdmin(data: ICreateUser): Promise<User> { // MANCA SERVICE REGISTER ADMIN
        try {
            
            const role = await roleRepository.getRoleByName('admin');

            if (!role) {
                throw new Error('Ruolo "admin" non trovato');
            }

            data.roleId = role.id;

            const user = await User.dao.create(data);
            console.log("Admin creato");
            console.log(user);
            return user as User;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione admin fallita");
        }
    }
    async getUserById(id: number): Promise<User | null> {
        try {
            if (await this.userIdExist(id)){
                const user = await User.dao.get(id);
                return user as User | null;
            }

        } catch (error) {
            console.error(error);
            throw new Error("Recupero utente per ID fallito");
        }
    }
    async userIdExist(userId: number): Promise<boolean> { // MANCA GESTIONE CACHE
        const count = await User.count({ where: { id: userId } });
        return count > 0;
      }

    async getUserByEmail(email: string): Promise<User | null> { // MANCA GESTIONE CACHE
        try {
            const user = await User.findOne({ where: { email } });
            return user as User | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero utente per email fallito");
        }
    }
    async getUsers(): Promise<User[] | null> {
        try {
            const users = await User.dao.getAll();
            return users as User[] | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero utenti fallito");
        }
    }
    async updateUser(user: User, data: Partial<ICreateUser>): Promise<0 | 1> {
        try {
            
            console.log("Aggiornamento utente:", user);
            return await User.dao.update(user, data) as 0 | 1;
            
        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento utente fallito");
        }
    }
    async deleteUser(user: User): Promise<0 | 1> {
        try {
            
            console.log("Eliminazione utente:", user);
            return await User.dao.delete(user) as 0 | 1;
            
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione utente fallita");
        }
    }
    async userValidatePoint(userId: number): Promise<0 | 1> {
        try {
            const user = await this.getUserById(userId)
            const validated  = user.validated + 1
            console.log("Consegna punti validazione utente:", user);
            return await this.updateUser(user,{ validated }) as 0 | 1;
            
        } catch (error) {
            console.error(error);
            throw new Error("Consegna punti validazione utente fallita");
        }
    }
    async userTokenPoints(userId: number): Promise<0 | 1> {
        try {
            
            const user = await this.getUserById(userId)
            let reward
            !(user.validated>10)? reward = 0.1 : reward = 0.15
            const coins  = parseFloat(user.coins) + parseFloat(reward)
            console.log("Ricompensa TokenPoints utente:", coins);
            return await this.updateUser(user,{ coins }) as 0 | 1;
            
        } catch (error) {
            console.error(error);
            throw new Error("Consegna TokenPoints utente fallita");
        }
    }
    async userReward(userId: number): Promise<0 | 1> {
        try {
            await this.userValidatePoint(userId);
            await this.userTokenPoints(userId);
            
        } catch (error) {
            console.error(error);
            throw new Error("Ricompensa utente fallita");
        }
    }
    async usersRankList(sortOrder: 'asc' | 'desc' = 'desc'): Promise<UserRank[] | null> {
        try {
            const users = await this.getUsers();
            
            const mappedUsers = users.map((user) => ({ nickname: user.nickname, coins: user.coins }));
            
            mappedUsers.sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a.coins - b.coins;
                } else {
                    return b.coins - a.coins;
                }
            });

            return mappedUsers;
        
        } catch (error) {
            console.error(error);
            throw new Error("Recupero graduatoria fallito");
        }
    }
    
}

export { UserRepository };
