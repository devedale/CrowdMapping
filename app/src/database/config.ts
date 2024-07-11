import { RoleRepository } from "./repository/role"
import { UserRepository } from "./repository/user"

export default async () => {
    const roleRepository = new RoleRepository();
    const userRepository = new UserRepository();
    const role_1 = await roleRepository.getRoleById(parseInt(1))
    if(!role_1) {
    await roleRepository.createRole({name: "user"});
    await roleRepository.createRole({name: "admin"});
    await userRepository.createAdmin({ nickname: "admin", email: process.env.ADMIN_EMAIL || "admin@email.com", password: process.env.ADMIN_PASSWORD || "admin_password"})
    }
}
