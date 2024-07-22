import { Role } from "../models/role"; // Assicurati di importare il modello Role

interface ICreateRole {
    name: string;
}

class RoleRepository {
    async createRole(data: ICreateRole): Promise<Role> {
        try {
            const role = await Role.dao.create(data);
            return role as Role;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione role fallita");
        }
    }
    async getRoleById(id: number): Promise<Role | null> {
        try {
            const role = await Role.dao.get(id);
            return role as Role;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero ruolo per ID fallito");
        }
    }
    async deleteRole(role: Role): Promise<0 | 1> {
        try {
            console.log("Eliminazione ruolo:", role);

            return await Role.dao.delete(role);
            
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione ruolo fallita");
        }
    }
    async getRoleByName(roleName: string): Promise<Role | null> { // MANCA GESTIONE CACHE
        try {
            const role = await Role.findOne({ where: { name: roleName } });
            return role as Role;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero ruolo per ID fallito");
        }
    }
}

export { RoleRepository };
