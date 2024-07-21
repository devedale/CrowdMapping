import { User } from "../models/user";
import { Role } from "../models/role"; 
import { Report, ReportStatus } from "../models/report";

interface ICreateReport {
    private date?: Date;
    private position!: { latitude: number; longitude: number };
    private type!: ReportType;
    private severity!: Severity.Pothole | Severity.Dip;
}

class ReportRepository {
    async createReport(data: ICreateReport): Promise<Report> {
        try {
            if (!data.date) {
                data.date = new Date();
            }
            const report = await Report.dao.create(data);
            console.log("Report creato");
            console.log(report);
            return report as Report;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione report fallita");
        }
    }
    async getReportById(id: number): Promise<Report | null> {
        try {
            const report = await Report.dao.get(id);
            return report as Report | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero report per ID fallito");
        }
    }
    async getReports(): Promise<Report[] | null> {
        try {
            const reports = await Report.dao.getAll();
            return reports as Report[] | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero report fallito");
        }
    }
    async updateReport(report: Report, data: Partial<ICreateReport>):Promise<0 | 1> {
        try {
            console.log(`Report : ${report}, data : ${data}`);
            return await Report.dao.update(report, data);
            

        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento report fallito");
        }
    }
    async deleteReport(report: Report): Promise<void> {
        try {
            await Report.dao.delete(report);
            console.log("Utente eliminato:", report);
            
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione report fallita");
        }
    }
    async validateReport(id: Number): Promise<0 | 1> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.VALIDATED}`);

            return await this.updateReport(report, {status: ReportStatus.VALIDATED})

        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
            
        }
    }
    async rejectReport(id: Number): Promise<0 | 1> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.REJECTED}`);

            return await this.updateReport(report, {status: ReportStatus.REJECTED})
            
        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async pendingReport(id: Number): Promise<boolean> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.PENDING}`);

            return await this.updateReport(report, {status: ReportStatus.PENDING})

        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async bulkUpdateReport(validate_ids: number[], reject_ids: number[]): Promise<{ validated: number[], rejected: number[] }> {
        
            try{
            for (let i = 0; i <validate_ids.length; i++) {
                try {

                    await this.validateReport(id)
                    console.log(`Report ${id} status updated to ${ReportStatus.VALIDATED}`);


                } catch (error) {
                    console.error(`Failed to update report ${id}: ${error}`);
                }
            }
            for (let i = 0; i <reject_ids.length; i++) {
                try {

                    await this.rejectReport(id)
                    console.log(`Report ${id} status updated to ${ReportStatus.REJECTED}`);

                } catch (error) {
                    console.error(`Failed to update report ${id}: ${error}`);
                    
                }
            }
            return { validated: validate_ids, rejected: reject_ids };

        } catch (error) {
            console.error(error);
            throw new Error("Bulk report status update failed");
        }
    }
}

export { ReportRepository };
