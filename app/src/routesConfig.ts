import user from "./routes/user";


export const routesConfig = async (app: Express) => {
    //API
    user(app);
}

export default routesConfig;