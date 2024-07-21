import { authMiddleware } from '../middlewares/jwtAuth';
import ReportService from '../services/report';


export default (app: Express) =>{
    const reportService = new ReportService();
    const base_url = `${process.env.API_VERSION || '/api'}/reports`;
    app.get(`${base_url}`, authMiddleware, reportService.getReports);
    app.get(`${base_url}/:id`, authMiddleware, reportService.getReportById);
    app.post(`${base_url}`, authMiddleware, reportService.createReport);
    app.patch(`${base_url}/:id/reject`, authMiddleware, reportService.rejectReport);
    app.patch(`${base_url}/:id/validate`, authMiddleware, reportService.validateReport);
    app.patch(`${base_url}/bulk_update`, authMiddleware, reportService.bulkUpdateReport);
}




