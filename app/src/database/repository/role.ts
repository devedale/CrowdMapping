import { Role } from "../models/role"; // Assicurati di importare il modello Role

interface ICreateRole {
    name: string;
}

class RoleRepository {
    async createRole(data: ICreateRole): Promise<Role> {
        try {
            const role = await Role.dao.create(data);
            console.log("Ruolo creato");
            console.log(role);
            return role as Role;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione role fallita");
        }
    }
    async getRoleById(id: number): Promise<Role | null> {
        try {
            const role = await Role.dao.get(id);
            return role as Role | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero ruolo per ID fallito");
        }
    }
    async deleteRole(role: Role): Promise<void> {
        try {
            await role.destroy();
            console.log("Utente eliminato:", role);
            await Role.dao.delete(role); 
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione ruolo fallita");
        }
    }
}

export { RoleRepository };
