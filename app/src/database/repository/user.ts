import { User } from "../models/user";
import { Role } from "../models/role"; // Assicurati di importare il modello Role

interface ICreateUser {
    nickname: string;
    email: string;
    password: string;
}

class UserRepository {
    async createUser(data: ICreateUser): Promise<User> {
        try {
            const role = await Role.findOne({ where: { name: 'user' } });

            if (!role) {
                throw new Error('Ruolo "user" non trovato');
            }
            data.roleId = role.id;
            const user = await User.dao.create(data);
            console.log("User creato");
            console.log(user);
            return user as User;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione user fallita");
        }
    }

    async createAdmin(data: ICreateUser): Promise<User> {
        try {
            // Cerca il ruolo con nome "admin"
            const role = await Role.findOne({ where: { name: 'admin' } });

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
            const user = await User.dao.get(id);
            return user as User | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero utente per ID fallito");
        }
    }
    async getUserByEmail(email: string): Promise<User | null> {
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
    async updateUser(user: User, data: Partial<ICreateUser>): Promise<void> {
        try {
            await user.update(data);
            console.log("Utente aggiornato:", user);
            await User.dao.update(user, data); // Aggiorna anche nella cache
        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento utente fallito");
        }
    }
    async deleteUser(user: User): Promise<void> {
        try {
            await user.destroy();
            console.log("Utente eliminato:", user);
            await User.dao.delete(user); // Rimuovi anche dalla cache
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione utente fallita");
        }
    }
}

export { UserRepository };
