import { User } from "../models/user";
import { RoleRepository } from "./role"; 
import { Report, ReportStatus, ReportType, Severity } from "../models/report";
import { UserRepository } from "./user"; 
import { DBSCAN } from 'density-clustering';
import { getDistance } from 'geolib';

const userRepository =new UserRepository();

interface ICreateReport {
    private date?: Date;
    private position!: { latitude: number; longitude: number };
    private type!: ReportType;
    private severity!: Severity.Pothole | Severity.Dip;
}

interface Position {
    lat: number;
    lng: number;
}

interface IClusterData {
    data: Position[];
    eps: number;
    minPts: number;
}

interface IClusterResult {
    clusters: number[][];
    noise: number[][];
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Raggio della Terra in metri
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
};

class ReportRepository {
    constructor() {
        this.dbscan = new DBSCAN();
    }

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



    async fetchPositions(): Promise<Position[]> {
        try {
            const reports = await this.getReports();
            return reports.filter(report => report.status === ReportStatus.VALIDATED).map(report => {
                const geom = report.position as any;
                return {
                    lat: geom.coordinates[0],
                    lng: geom.coordinates[1]
                };
            });
        } catch (error) {
            console.error(error);
            throw new Error("Errore durante il recupero delle posizioni");
        }
    }
    async searchReportsWithinRange(lat: number, lng: number, range: number, startDate?: Date, endDate?: Date): Promise<Report[]> {
        try {
            const reports = await this.getReports(); 
            const filteredReports = reports.filter(report => {

                if (report.status !== ReportStatus.VALIDATED) {
                    return false;
                }
                
                const reportLat = report.position.coordinates[0];
                const reportLng = report.position.coordinates[1];
                const distance = haversineDistance(lat,lng,reportLat,reportLng)

                console.log(`distance: ${distance}`)
                
                const isWithinRange = distance <= range;
                
                const reportDate = new Date(report.date);
                const isWithinDateRange = (!startDate || reportDate >= startDate) && (!endDate || reportDate <= endDate);
                
                return isWithinRange && isWithinDateRange;
            });
    
            return filteredReports;


        } catch (err) {
            console.error(err);
            throw new Error("Errore durante la ricerca dei report nel raggio");
        }
    }


    async runDbscan({ data, eps, minPts }: IClusterData): Promise<IClusterResult> {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("Nessun dato disponibile per DBSCAN");
            }
            
            console.log("Dati per DBSCAN:", data); 
            const formattedData = data.map(pos => [pos.lat, pos.lng]);
            console.log("Dati formattati per DBSCAN:", formattedData); 

            if (formattedData.length === 0) {
                throw new Error("Nessun dato formattato disponibile per DBSCAN");
            }
            
            const clusterIds = this.dbscan.run(formattedData, eps, minPts);

            const clusters: { [key: number]: [number, number][] } = {};
            const noise: [number, number][] = [];

            formattedData.forEach((coord, index) => {
                const clusterId = clusterIds[index];
                if (clusterId === -1) {
                    noise.push(coord);
                } else {
                    if (!clusters[clusterId]) {
                        clusters[clusterId] = [];
                    }
                    clusters[clusterId].push(coord);
                }
            });
            return { clusters, noise: [] };
        } catch (error) {
            console.error(error);
            throw new Error("Esecuzione DBSCAN fallita");
        }
    }
    

    async createRandomData(): Promise<void> {

        function randomDate(startYear: number, endYear: number): string {
            const start = new Date(startYear, 0, 1);
            const end = new Date(endYear, 11, 31);
            const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}-${day}-${year}`;
        }
        
        function randomCoordinates(baseLat: number, baseLng: number): [number, number] {
            const lat = baseLat + (Math.random() - 0.5) * 4; // ±2 gradi
            const lng = baseLng + (Math.random() - 0.5) * 4; // ±2 gradi
            return [parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))];
        }
        
        const types = [ReportType.POTHOLE, ReportType.DIP];
        const potholeSeverities = Object.values(Severity.Pothole);
        const dipSeverities = Object.values(Severity.Dip);
        const reportStatuses = Object.values(ReportStatus);
        
        
        const baseLat = 42.4642;
        const baseLng = 13.1900;
        
        const data = Array.from({ length: 50 }, () => {
            const repType = types[Math.floor(Math.random() * types.length)];
            const severity = repType === ReportType.POTHOLE
                ? potholeSeverities[Math.floor(Math.random() * potholeSeverities.length)]
                : dipSeverities[Math.floor(Math.random() * dipSeverities.length)];
        
        
            return {
                date: randomDate(2014, 2024),
                position: {
                    type: 'Point',
                    coordinates: randomCoordinates(baseLat, baseLng)
                },
                type: repType,
                severity: severity,
                status: ReportStatus.PENDING,
                userId: 1
            };
        });
        
        
        
        data.forEach(async (e) => await this.createReport(e))
        
    }
}

export { ReportRepository };
