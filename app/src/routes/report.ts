import { authMiddleware } from '../middlewares/jwtAuth';
import { authRSAMiddleware } from '../middlewares/authRSA';
import ReportService from '../services/report';


export default (app: Express) =>{
    const reportService = new ReportService();
    const base_url = `${process.env.API_VERSION || '/api'}/report`;
    app.post(`${base_url}`, authMiddleware, reportService.createReport);
    app.post(`${base_url}RSA`, authRSAMiddleware, reportService.createReport);
}




