import { authMiddleware } from '../middlewares/jwtAuth';
import ReportService from '../services/report';


export default (app: Express) =>{

    const reportService = new ReportService();
    const base_url = `${process.env.API_VERSION || '/api'}/reports`;
    app.get(`${base_url}`, authMiddleware, reportService.getReports);
    app.patch(`${base_url}/bulk_update`, authMiddleware, reportService.bulkUpdateReport);
    app.get(`${base_url}/my_reports`, authMiddleware, reportService.getMyReports);
    app.get(`${base_url}/statistics`, reportService.reportStatistics);
    app.get(`${base_url}/statistics/:format`, reportService.reportStatistics);
    app.get(`${base_url}/dbscan/:eps/:minPts`, reportService.runDbscan);
    app.get(`${base_url}/dbscan/:eps/:minPts/:format`, reportService.runDbscan);
    app.get(`${base_url}/find`, reportService.getReportsWithinRange);
    app.get(`${base_url}/:id`, authMiddleware, reportService.getReportById);
    app.post(`${base_url}`, authMiddleware, reportService.createReport);
    app.patch(`${base_url}/:id`, authMiddleware, reportService.updateReport);
    app.patch(`${base_url}/:id/reject`, authMiddleware, reportService.rejectReport);
    app.patch(`${base_url}/:id/validate`, authMiddleware, reportService.validateReport);

}




