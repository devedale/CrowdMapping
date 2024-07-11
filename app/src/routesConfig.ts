import user from "./routes/user";
import report from "./routes/report";
import { app } from './app';


export const routesConfig = async (app: Express) => {
    //API
    user(app);
    report(app);
}

export default routesConfig;