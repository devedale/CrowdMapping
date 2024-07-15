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
            throw new Error("Recupero utente per ID fallito");
        }
    }
    async getReports(): Promise<Report[] | null> {
        try {
            const reports = await Report.dao.getAll();
            return reports as Report[] | null;
        } catch (error) {
            console.error(error);
            throw new Error("Recupero utenti fallito");
        }
    }
    async updateReport(report: Report, data: Partial<ICreateReport>): Promise<void> {
        try {
            await report.update(data);
            console.log("Utente aggiornato:", report);
            await Report.dao.update(report, data);
        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento utente fallito");
        }
    }
    async deleteReport(report: Report): Promise<void> {
        try {
            await report.destroy();
            console.log("Utente eliminato:", report);
            await Report.dao.delete(report);
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione utente fallita");
        }
    }
    async reportValidated(id: Number): Promise<void> {
        try {
            const report = getReportById(id)
            report.status = ReportStatus.VALIDATED;
            console.log(`Report status updated to: ${report.status}`);
        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async reportRejected(id: Number): Promise<void> {
        try {
            const report = this.getReportById(id)
            if(report.status !== ReportStatus.PENDING) {
                report.status = ReportStatus.REJECTED;
                console.log(`Report status updated to: ${report.status}`);
            }

        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
}

export { ReportRepository };
