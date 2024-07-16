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
    async updateReport(report: Report, data: Partial<ICreateReport>): Promise<void> {
        try {
            console.log(`Report : ${report}, data : ${data}`);
            await Report.dao.update(report, data);
            

        } catch (error) {
            console.error(error);
            throw new Error("Aggiornamento report fallito");
        }
    }
    async deleteReport(report: Report): Promise<void> {
        try {
            await report.destroy();
            console.log("Utente eliminato:", report);
            await Report.dao.delete(report);
        } catch (error) {
            console.error(error);
            throw new Error("Eliminazione report fallita");
        }
    }
    async validateReport(id: Number): Promise<void> {
        try {
            const report = await this.getReportById(id)
            await this.updateReport(report, {status: ReportStatus.VALIDATED})
            console.log(`Report status updated to: ${report.status}`);
        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async rejectReport(id: Number): Promise<void> {
        try {
            const report = await this.getReportById(id)
            await this.updateReport(report, {status: ReportStatus.REJECTED})
            console.log(`Report status updated to: ${report.status}`);
        } catch (error) {
            console.error(error);
            throw new Error("Report status update failed");
        }
    }
    async bulkUpdateReport(validate_ids: number[], reject_ids: number[]): Promise<{ validated: number[], rejected: number[] }> {
        const validatedUpdated: number[] = [];
        const rejectedUpdated: number[] = [];
        for (const id of validate_ids){
            try {
                this.validateReport(id)
                console.log(`Report ${id} status updated to ${ReportStatus.VALIDATED}`);
                validatedUpdated.push(id);
            } catch (error) {
                console.error(`Failed to update report ${id}: ${error}`);
            }
        }
        for (const id of reject_ids){
            try {
                this.rejectReport(id)
                console.log(`Report ${id} status updated to ${ReportStatus.REJECTED}`);
                rejectedUpdated.push(id);
            } catch (error) {
                console.error(`Failed to update report ${id}: ${error}`);
            }
        }

    return { validated: validatedUpdates, rejected: rejectedUpdates };

    }
}

export { ReportRepository };
