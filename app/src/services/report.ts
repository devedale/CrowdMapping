import { Request, Response, NextFunction } from 'express';
import { ReportRepository, ICreateReport } from "../database/repository/report";
import { ReportType, Severity, ReportStatus } from "../database/models/report";
import { ISError } from '../errors/ErrorFactory';

const reportRepository = new ReportRepository();

class ReportService {

    async createReport(req: Request, res: Response, next: NextFunction) {

        const { date, position, type, severity} = req.body;

        try {  

            if (date.length<10||isNaN(Date.parse(date))) {

                return res.build("BadRequest",`Invalid date value. Example of a valid value: "2023-07-21T15:00:00Z", "2023-07-21", "2023-21-07", "2023/07/21", "21-07-2023"`);
            
            }
            if (!position || position.type !== 'Point' || !Array.isArray(position.coordinates) || position.coordinates.length !== 2 || typeof position.coordinates[0] !== 'number' || typeof position.coordinates[1] !== 'number') {
                
                    return res.build("BadRequest",`Invalid position value. It should be an object with type "Point" and coordinates array with two numbers.`);
            
            }
            if (!(Object.values(ReportType).includes(type as ReportType)))   {

                    return res.build("BadRequest",`Invalid ReporType value. Available values: ${Object.values(ReportType).join(', ')}`);
                
                }
            const reportTypeCheck = type == "Pothole"                   

            if (!(Object.values(Severity.Pothole).includes(severity) || Object.values(Severity.Dip).includes(severity))){

                return 
                reportTypeCheck 
                ?res.build("BadRequest",`Invalid Severity value. Available values: ${Object.values(Severity.Pothole).join(', ')}`)
                :res.build("BadRequest",`Invalid Severity value. Available values: ${Object.values(Severity.Dip).join(', ')}`);
                    
            }   

            const userId = req['userId']
            const status = "PENDING"
            const newReport = await reportRepository.createReport({ userId, date, position, type, severity, status});

            res.status(200).json({ success: true, message: 'Report Creato', report: newReport });

        } catch (err) {

           next(ISError('Errore durante la creazione del report.',err)) 

        } 

    }

    async getReports(req: Request, res: Response, next: NextFunction) {

        try {

            const reports = await reportRepository.getReports();

            if (!reports) {

                return res.build("NotFound",'Report non trovati');

            }

            res.status(200).json({ success: true, message: 'Lista Report', reports });

        } catch (err) {

            next(ISError('Errore durante il recupero dei report.',err));

        }
    
    }

    async getReportById(req: Request, res: Response, next: NextFunction) {
        try {

            const id = req.params.id;

            if (!id) {

                return ISError("BadRequest",'Manca il parametro id della richiesta');

            }

            if (isNaN(parseInt(id))) {

                return res.build("BadRequest",'Id non valido');

            }
            const report = await reportRepository.getReportById(id);

            if (!report) {

                return res.build("NotFound",'Report non trovato');
            
            }
            
            res.status(200).json({ success: true, message: 'Report', report });

        } catch (err) {

            next(ISError('Errore durante il recupero del report.',err));
        
        }
    
    }
    async validateReport(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id) {

                    return res.build("BadRequest",'Fornire id Report da aggiornare');
            
                }

            if ( isNaN(parseInt(id))) {

                return res.build("BadRequest",'Id non valido');
            
            }
            const report = await reportRepository.getReportById(id)

            if (report === null) {

                return res.build("NotFound",'Report da aggiornare non presente');
            
            }

            if (report.status === ReportStatus.PENDING) {

                await reportRepository.validateReport(id)
                return res.status(200).json({ success: true, message: `Report ${id} validated` });
                
            } else {

                    return res.build("BadRequest", `Lo status del report è gia su ${report.status}`)
                
            }

        } catch (err) {

            next(ISError('Errore durante l\'aggiornamento del report.',err));

        }
    }

    async rejectReport(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id) {
            
                return res.build("BadRequest",'Fornire id Report da aggiornare');
            
            }
            if (isNaN(parseInt(id))) { 

                return res.build("BadRequest",'Id non valido');

            }

            const report = await reportRepository.getReportById(id)
            if (report === null) {
                return res.build("NotFound",'Report da aggiornare non presente');
            }
            if (report.status === ReportStatus.PENDING) {

                await reportRepository.rejectReport(id)
                return res.status(200).json({ success: true, message: `Report ${id} rejected` });
                
            } else {

                    return res.build("BadRequest", `Lo status del report è gia su ${report.status}`)
                
            }

        } catch (err) {
            next(ISError('Errore durante l\'aggiornamento del report.',err));
        }
    }
    async bulkUpdateReport(req: Request, res: Response, next: NextFunction) {

        const isNumberArray = (arr: Number[]): boolean => {
            return arr.filter(item => isNaN(parseInt(item))).length === 0;
        };
        
        try {
            const { validate_ids, reject_ids } = req.body;
            if (!isNumberArray(validate_ids) || !isNumberArray(reject_ids)) {

                return res.build("BadRequest",'Invalid input data. Provide a request body { validate_ids: number[], reject_ids: number[] }');

            }

            
            const { validated, rejected } = await reportRepository.bulkUpdateReport(validate_ids, reject_ids);
            return res.status(200).json({ success: true, validated, rejected });
        
        } catch (err) {
            
            next(ISError('Failed to update reports',err));

        }


    }
        
}

export default ReportService;
