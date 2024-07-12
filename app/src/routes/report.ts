import { authMiddleware } from '../middlewares/jwtAuth';
import ReportService from '../services/report';


export default (app: Express) =>{
    const reportService = new ReportService();
    const base_url = `${process.env.API_VERSION || '/api'}/report`;
    app.post(`${base_url}`, authMiddleware, reportService.createReport);
}




