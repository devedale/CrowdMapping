import { Request, Response, NextFunction } from 'express';
import { ReportRepository, ICreateReport } from "../database/repository/report";
import { RoleRepository } from "../database/repository/role";
import { ReportType, Severity, ReportStatus } from "../database/models/report";
import ExportService from "./export";
import { ISError } from '../errors/ErrorFactory';

const reportRepository = new ReportRepository();
const roleRepository = new RoleRepository();



interface StatusCounts {
    [type: string]: {
        [severity: string]: {
            [status: string]: number;
        };
    };
}

class ReportService {
    constructor(){
        this.reportStatistics = this.reportStatistics.bind(this);
    }

    async createReport(req: Request, res: Response, next: NextFunction) {
        req.validate(['date','position','type','severity']);
        const { date, position, type, severity} = req.body;

        try {  
            if (!date) {
                date = new Date();
            }

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

            if (
                ![
                    ...Object.values(Severity.Pothole),
                    ...Object.values(Severity.Dip)
                ].includes(severity)
            ){
                return res.build('BadRequest',`Invalid Severity value. Available values: ${
                        reportTypeCheck ? Object.values(Severity.Pothole).join(', ') : Object.values(Severity.Dip).join(', ')
                    }`
                );
            }   

            const userId = req['userId']
            const status = ReportStatus.PENDING
            const newReport = await reportRepository.createReport({ userId, date, position, type, severity, status});

            res.status(201).json({ success: true, message: 'Report Creato', report: newReport });

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
            console.log(err);
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


    async updateReport(req: Request, res: Response, next: NextFunction) {

        const reportId = req.params.id;
        req.validate(['date','position','type','severity']);
        const data : Partial<ICreateReport> = req.body;
        try {

            const report = await reportRepository.getReportById(reportId);
            
            if (!report) {

                return res.build('NotFound',`Report ${reportId} non trovato`);

            }
            const userId = req['userId']
            const userRole = roleRepository.getRoleById(userId)
            const reportUserId = report.userId

            if (data.userId) {

                return res.build("Unauthorized", "Non è possibile aggiornare userId");

            }
            if (data.id) {

                return res.build("Unauthorized", "Non è possibile aggiornare l'id...  ma sei matto?");

            }
            

            if (userRole!== 'admin' && reportUserId!== userId) {

                return res.build("Unauthorized", "Non hai i permessi per aggiornare questo report");

            } else {

                const updatedRecords = await reportRepository.updateReport(report,data)
                res.status(200).json({ success: true, message: 'Report Aggiornati:', updatedRecords });

            }


        } catch (err) {

            next(ISError('Errore durante il recupero dei report.',err));

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
    async getMyReports(req, res, next) {
        const { status, dateRange } = req.body;
        req.validate(["status","dateRange"]);
        
        if (status && !ReportStatus[status]) {
            return res.build("BadRequest", 'Invalid status');
        }
        
        try {
            const userId = req['userId'];
            const reports = await reportRepository.getReports();
    
            if (!reports) {
                return res.build("NotFound", 'Reports not found');
            }
    
            let userFilteredReports = reports.filter(report => report.userId == userId);
    
            if (status) {
                userFilteredReports = userFilteredReports.filter(report => report.status == status);
            }
    
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                if (startDate && endDate) {
                    if (startDate.length<10||isNaN(Date.parse(startDate))) {

                        return res.build("BadRequest",
                            `Invalid start date value. Example of a valid value: "2023-07-21T15:00:00Z", "2023-07-21", "2023-21-07", "2023/07/21", "21-07-2023"`);
                    
                    }
                    if (endDate.length<10||isNaN(Date.parse(endDate))) {

                        return res.build("BadRequest",
                            `Invalid start date value. Example of a valid value: "2023-07-21T15:00:00Z", "2023-07-21", "2023-21-07", "2023/07/21", "21-07-2023"`);
                    
                    }


                    const start = Date.parse(startDate);
                    const end = Date.parse(endDate);
                    userFilteredReports = userFilteredReports.filter(report => {
                        const reportDate = new Date(report.date);
                        return reportDate >= start && reportDate <= end;
                    });
                } else {
                    return res.build('BadRequest','range date valid format: { startDate, endDate }');
                }
            }
    
            res.status(200).json({ success: true, message: 'Report list', reports: userFilteredReports });
        } catch (err) {
            next(ISError('Error retrieving reports.', err));
        }
    }
    

    async bulkUpdateReport(req: Request, res: Response, next: NextFunction) {

        const isNumberArray = (arr: Number[]): boolean => {
            return arr.filter(item => isNaN(parseInt(item))).length === 0;
        };

        const filterPendingArray = async (arr: number[]): Promise<number[]> => {
            const pendingReports: number[] = [];
            
            for (const id of arr) {
                 
                const report = await reportRepository.getReportById(id);
                console.log (`\n\n\n\n\nreport\n\n\n\n\n`, report);
                if ( report != undefined  ){
                    if ( report.status === ReportStatus.PENDING ) {
                        pendingReports.push(id);
                    }
                }
                
            }
            
            return pendingReports;

        };
        

        try {
            req.validate(['validate_ids','reject_ids']);
            const { validate_ids, reject_ids } = req.body;
            if (!isNumberArray(validate_ids) || !isNumberArray(reject_ids)) {

                return res.build("BadRequest",'Invalid input data. Provide a request body { validate_ids: number[], reject_ids: number[] }');

            }

            const validated = await filterPendingArray(validate_ids)
            const rejected = await filterPendingArray(reject_ids);

            const results = await reportRepository.bulkUpdateReport(validated, rejected);

            return res.status(200).json({ success: true, results});
        
        } catch (err) {
            
            next(ISError('Failed to update reports',err));

        }


    }

    async reportStatistics(req: Request, res: Response, next: NextFunction) {
        try {
            const format = req.params.format;

            if (!['json', 'csv', 'pdf', undefined].includes(format)) {
                return res.build("BadRequest", 'Formato non valido');
            }

            const statusCounts = await this.generateInitialStatusCounts();

            if (format !== undefined) {
                const methodName = `generate${format.charAt(0).toUpperCase() + format.slice(1)}`;
                const exportService = new ExportService(statusCounts).statisticsExportService;

                if (typeof exportService[methodName] === 'function') {
                    const fileBuffer = await exportService[methodName]();
                    return res.sendFile(fileBuffer, format);
                } else {
                    return res.build("BadRequest", 'Formato non valido');
                }
            }

            if (format === undefined) {
                return res.status(200).json({ success: true, message: 'Report statistics', statusCounts });
            }

            next();
        } catch (err) {
            console.log(err);
            next(ISError('errore durante il recupero delle statistiche', err));
        }
    }

    async runDbscan(req: Request, res: Response, next: NextFunction) {
        const eps = parseFloat(req.params.eps);
        const minPts = parseInt(req.params.minPts);
        if (typeof eps !== 'number' || typeof minPts !== 'number' ||
            !Number.isFinite(eps) || !Number.isInteger(minPts) ||
            eps <= 0 || minPts < 1) {            
                return res.status(400).send('Dati di input non validi');
        }

        const format = req.params.format;
        if (!['json', 'csv', 'pdf', undefined].includes(format)) {
            return res.build("BadRequest", 'Formato non valido');
        }


    
        try {
            const positions = await reportRepository.fetchPositions()
            const result = await reportRepository.runDbscan({ data: positions, eps, minPts });

            if (format !== undefined) {
                const methodName = `generate${format.charAt(0).toUpperCase() + format.slice(1)}`;
                const exportService = new ExportService(result).clusteringExportService;

                if (typeof exportService[methodName] === 'function') {
                    const fileBuffer = await exportService[methodName]();
                    return res.sendFile(fileBuffer, format);
                } else {
                    return res.build("BadRequest", 'Formato non valido');
                }
            }

            if (format === undefined) {
                return res.status(200).json({ success: true, message: 'Report statistics', result });
            }

            next();
    
        } catch (err) {

            next(ISError('Errore durante il DBSCAN.',err));

        }
    }

    async generateInitialStatusCounts():Promise<StatusCount> {
        const reports = await reportRepository.getReports();

        const generateInitialCounts = () => {
            const counts = {};

            const addSeverityCounts = (type, severityEnum) => {
                counts[type] = {};
                Object.values(severityEnum).forEach(severity => {
                    counts[type][severity] = {
                        [ReportStatus.PENDING]: 0,
                        [ReportStatus.REJECTED]: 0,
                        [ReportStatus.VALIDATED]: 0
                    };
                });
            };

            addSeverityCounts(ReportType.POTHOLE, Severity.Pothole);
            addSeverityCounts(ReportType.DIP, Severity.Dip);

            return counts;
        };

        const initialCounts = generateInitialCounts();

        const statusCounts = reports.reduce((counts, report) => {
            const { type, severity, status } = report;
            if (counts[type] && counts[type][severity] && counts[type][severity][status] !== undefined) {
                counts[type][severity][status]++;
            }
            return counts;
        }, initialCounts);

        return statusCounts;
    }
    async getReportsWithinRange(req: Request, res: Responsen, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, range, startDate, endDate } = req.query;

            if (!lat || !lng || !range) {
                return res.build('BadRequest','I parametri lat, lng e range sono obbligatori.');
            }

            const latNumber = parseFloat(lat as string);
            const lngNumber = parseFloat(lng as string);
            const rangeNumber = parseFloat(range as string);
            const start = startDate ? new Date(startDate as string) : undefined;
            const end = endDate ? new Date(endDate as string) : undefined;

            if (isNaN(latNumber) || isNaN(lngNumber) || isNaN(rangeNumber) || (startDate && isNaN(start.getTime())) || (endDate && isNaN(end.getTime()))) {
                return res.build('BadRequest','I parametri lat, lng, range devono essere numeri validi e startDate, endDate devono essere date valide.');
            }

            const reports = await reportRepository.searchReportsWithinRange(latNumber, lngNumber, rangeNumber, start, end);
            res.status(200).json({ success: true, message: 'Found Reports', reports });
        } catch (error) {
            next(ISError("Errore durante la ricerca dei report",error));
        }
    }

}

export default ReportService;
