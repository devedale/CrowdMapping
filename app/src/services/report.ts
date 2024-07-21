import { Request, Response, NextFunction } from 'express';
import { ReportRepository, ICreateReport } from "../database/repository/report";
import { ReportType, Severity, ReportStatus } from "../database/models/report";
import { ErrorFactory } from '../errors/ErrorFactory';
import { res_build } from '../errors/ErrorFactory';
import { HttpStatusCode } from '../errors/HttpStatusCode';
import { resBuild } from '../errors/ErrorFactory';

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
            const status = "PENDING"

            const newReport = await reportRepository.createReport({ userId, date, position, type, severity, status});
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

            res.status(200).json({ success: true, message: 'Lista Report', reports });
        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il recupero dei report.')
                .setErrorDetail(err)
            );
        }
    
    }
    async getReportById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Manca il parametro id della richiesta')
                    );
            }
            if (isNaN(parseInt(id))) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Id non valido')
                    );
            }
            const report = await reportRepository.getReportById(id);
            if (!report) {
                return res
                   .status(HttpStatusCode.NotFound)
                   .json(ErrorFactory
                        .getError(HttpStatusCode.NotFound)
                        .setDetails('Report non trovato')
                    );
            }
            res.status(200).json({ success: true, message: 'Report', report });

        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante il recupero del report.')
                .setErrorDetail(err)
            );
        }
    
    }
    async validateReport(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Fornire id Report da aggiornare')
                    );
            }
            if (isNaN(parseInt(id))) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Id non valido')
                    );
            }
            const report = await reportRepository.getReportById(id)
            if (report === null) {
                return res
                .status(HttpStatusCode.NotFound)
                .json(ErrorFactory
                    .getError(HttpStatusCode.NotFound)
                    .setDetails('Report da aggiornare non presente')
                );
            }

            if (report.status === ReportStatus.PENDING) {
                await reportRepository.validateReport(id)
                } else {

                    //return resBuild(res,"BadRequest", `Lo status del report è gia su ${report.status}`)
                    return res.build("BadRequest", `Lo status del report è gia su ${report.status}`)

                    /*
                    return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails(`Lo status del report è gia su ${report.status}`));
                    */
                
                
                }

            if (await reportRepository.validateReport(id)){
            res.status(200).json({ success: true, message: `Report ${id} validated` });
            }
        } catch (err) {
            console.log(err)
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante l\'aggiornamento del report.')
                .setErrorDetail(err)
            );
        }
    }

    async rejectReport(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Fornire id Report da aggiornare')
                    );
            }
            if (isNaN(parseInt(id))) { 
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Id non valido')
                    );
            }

            const report = await reportRepository.getReportById(id)
            if (report === null) {
                return res
                .status(HttpStatusCode.NotFound)
                .json(ErrorFactory
                    .getError(HttpStatusCode.NotFound)
                    .setDetails('Report da aggiornare non presente')
                );
            }
            if (report.status === ReportStatus.PENDING) {
                }



            if (await reportRepository.rejectReport(id)){
                res.status(200).json({ success: true, message: `Report ${id} rejected` });
                }
        } catch (err) {
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Errore durante l\'aggiornamento del report.')
                .setErrorDetail(err)
            );
        }
    }
    async bulkUpdateReport(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Request body:", req.body);
            const validate_ids = req.body.validate_ids
            const reject_ids = req.body.reject_ids;
            
            console.log("Initial validate_ids, reject_ids");
            console.log(validate_ids, reject_ids);
            console.log("Type of validate_ids:", typeof validate_ids);
            console.log("Type of reject_ids:", typeof reject_ids);
            console.log("Instance of validate_ids:", validate_ids instanceof Array);
            console.log("Instance of reject_ids:", reject_ids instanceof Array);
            console.log("Length of validate_ids:", validate_ids.length);
            console.log("Length of reject_ids:", reject_ids.length);
            console.log("Validate_ids:", validate_ids[0]);
            console.log("Reject_ids:", reject_ids[0]);
            // Check if both validate_ids and reject_ids are arrays
            if (!Array.isArray(validate_ids) || !Array.isArray(reject_ids)) {
                return res
                    .status(HttpStatusCode.BadRequest)
                    .json(ErrorFactory
                        .getError(HttpStatusCode.BadRequest)
                        .setDetails('Provide a request body { validate_ids: number[], reject_ids: number[] }')
                    );
            }

            const results = await reportRepository.bulkUpdateReport(validate_ids, reject_ids );
            res.status(200).json({ success: true, message: `Results: validated: ${results.validated},  rejected: ${results.rejected}` });
        } catch (err) {
            console.log(err);
            next(ErrorFactory
                .getError(HttpStatusCode.InternalServerError)
                .setDetails('Error during report update.')
                .setErrorDetail(err)
            );
        }
    }
        
}

export default ReportService;
