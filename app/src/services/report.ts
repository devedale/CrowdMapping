import { ReportRepository, ICreateReport } from "../database/repository/report";
import { ReportType, Severity } from "../database/models/report";
import { ErrorFactory } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';

const reportRepository = new ReportRepository();

class ReportService {

    async createReport(req: Request, res: Response, next: NextFunction) {
        const { date, position, type, severity} = req.body;
        try {    
            if (date.length<10||isNaN(Date.parse(date))) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails(`Invalid date value. Example of a valid value: "2023-07-21T15:00:00Z", "2023-07-21", "2023-21-07", "2023/07/21", "21-07-2023"`));
            }
            if (!position || position.type !== 'Point' || !Array.isArray(position.coordinates) || position.coordinates.length !== 2 || 
                typeof position.coordinates[0] !== 'number' || typeof position.coordinates[1] !== 'number') {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails(`Invalid position value. It should be an object with type "Point" and coordinates array with two numbers.`));
            }
            if (
                !(Object.values(ReportType).includes(type as ReportType))
            )   {
                    return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails(`Invalid ReporType value. Available values: ${Object.values(ReportType).join(', ')}`));
                }
            const reportTypeCheck = type == "Pothole"                   

            if (
                !(Object.values(Severity.Pothole).includes(severity) ||
                Object.values(Severity.Dip).includes(severity))
            ){
                return 
                reportTypeCheck 
                ?res.status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails(`Invalid Severity value. Available values: ${Object.values(Severity.Pothole).join(', ')}`))
                :res.status(HttpStatusCode.BadRequest)
                        .json(ErrorFactory
                            .getError(HttpStatusCode.BadRequest)
                            .setDetails(`Invalid Severity value. Available values: ${Object.values(Severity.Dip).join(', ')}`));
                    
            }   


            const userId = req['userId']
            const newReport = await reportRepository.createReport({ userId, date, position, type, severity});
            res.status(200).json({ success: true, message: 'Report Creato', report: newReport });
        } catch (error) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante la creazione del report.')
                .setErrorDetail(error)
            );    
        } 
    }

    async getReports(req: Request, res: Response, next: NextFunction) {
        try {
            const reports = await reportRepository.getReports();
            if (!reports) {
                return res
                    .status(HttpStatusCode.NotFound)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.NotFound)
                        .setDetails('Report non trovati')
                    );
            }

            res.json({ success: true, message: 'Lista Report', reports });
        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il recupero dei report.')
                .setErrorDetail(err)
            );
        }
    
    }
}

export default ReportService;
