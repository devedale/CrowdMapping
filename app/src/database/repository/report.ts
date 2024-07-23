import { User } from "../models/user";
import { RoleRepository } from "./role"; 
import { Report, ReportStatus } from "../models/report";
import { UserRepository } from "./user"; 

const userRepository =new UserRepository();

interface ICreateReport {
    private date?: Date;
    private position!: { latitude: number; longitude: number };
    private type!: ReportType;
    private severity!: Severity.Pothole | Severity.Dip;
}


class ReportRepository {
    async createReport(data: ICreateReport): Promise<Report> {
        try {
            const report = await Report.dao.create(data);
            return report as Report;
        } catch (error) {
            console.error(error);
            throw new Error("Creazione report fallita");
        }
    }
    async reportIdExist(reportId: number): Promise<boolean> { // MANCA GESTIONE CACHE
        const count = await Report.count({ where: { id: reportId } });
        return count > 0;
      }

    async getReportById(id: number): Promise<Report | null> {
        try {
            if (await this.reportIdExist(id)) {
                const report = await Report.dao.get(id);
                return report as Report | null;
            }

        } catch (error) {
            console.error('\n\n\n\n\nerror\n\n\n\n\n');
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
            return await Report.dao.update(report, data) as 0 | 1
            

        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento report fallito");
        }
    }
    async deleteReport(report: Report): Promise<0 | 1> {
        try {
            console.log("Eliminazione report:", report);

            return await Report.dao.delete(report) as 0 | 1
            
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione report fallita");
        }
    }
    async validateReport(id: Number): Promise<0 | 1> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.VALIDATED}`);
            const results = await this.updateReport(report, {status: ReportStatus.VALIDATED}) 
            await userRepository.userReward(report.userId)
            return results

        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
            
        }
    }
    async rejectReport(id: Number): Promise<0 | 1> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.REJECTED}`);

            return await this.updateReport(report, {status: ReportStatus.REJECTED}) as 0 | 1
            
        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async pendingReport(id: Number): Promise<boolean> {
        try {
            const report = await this.getReportById(id);
            console.log(`Updating status to: ${ReportStatus.PENDING}`);

            return await this.updateReport(report, {status: ReportStatus.PENDING}) as 0 | 1

        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async bulkUpdateReport(validate_ids: number[], reject_ids: number[]): Promise<{ validated: number[], rejected: number[] }> {
        
            try{
            for (let i = 0; i <validate_ids.length; i++) {
                try {
                    const id = validate_ids[i];

                    await this.validateReport(id)
                    console.log(`Report ${id} status updated to ${ReportStatus.VALIDATED}`);


                } catch (error) {
                    console.error(`Failed to update report ${id}: ${error}`);
                }
            }
            for (let i = 0; i <reject_ids.length; i++) {
                try {

                    const id = reject_ids[i];


                    await this.rejectReport(id)
                    console.log(`Report ${id} status updated to ${ReportStatus.REJECTED}`);

                } catch (error) {
                    console.error(`Failed to update report ${id}: ${error}`);
                    
                }
            }
            return { validated: validate_ids, rejected: reject_ids } as { validated: number[], rejected: number[] };

        } catch (error) {
            console.error(error);
            throw new Error("Bulk report status update failed");
        }
    }
    
}

export { ReportRepository };
