import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection'; 
import { Dao } from './dao'; 
import { User } from './user'; 



export enum ReportStatus {
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    VALIDATED = 'VALIDATED'
}

export enum ReportType {
    POTHOLE = 'Pothole',
    DIP = 'Dip'
}


export namespace Severity {
    export enum Pothole {
        LOW = 'LOW Depth Pothole',
        MEDIUM = 'MEDIUM Depth Pothole',
        HIGH = 'HIGH Depth Pothole'
    }

    export enum Dip {
        LOW = 'LOW Prominence Dip',
        MEDIUM = 'MEDIUM Prominence Dip',
        HIGH = 'HIGH Prominence Dip'
    }
}

class Report extends Model {
    private id!: number;
    private userId!: number;
    private date!: Date;
    private position!: { type: "Point"; coordinates: number[] };
    private type!: ReportType;
    private severity!: Severity.Pothole | Severity.Dip;
    private status!: ReportStatus;
    public dao!: Dao<Report>;

    static initialize(): void {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                userId: { 
                    type: DataTypes.INTEGER,
                    field: 'userid',
                    references: {
                        model: 'user', 
                        key: 'id',
                    },
                    allowNull: false,
                },
                date: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                position: {
                    type: DataTypes.GEOMETRY('POINT'),
                    allowNull: false
                },
                type: {
                    type: DataTypes.ENUM,
                    values: [
                        ReportType.POTHOLE,
                        ReportType.DIP
                    ],
                    allowNull: false
                },
                severity: {
                    type: DataTypes.ENUM,
                    values: [
                        Severity.Pothole.LOW,
                        Severity.Pothole.MEDIUM,
                        Severity.Pothole.HIGH,
                        Severity.Dip.LOW,
                        Severity.Dip.MEDIUM,
                        Severity.Dip.HIGH
                    ],
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM,
                    values: [
                        ReportStatus.PENDING,
                        ReportStatus.VALIDATED,
                        ReportStatus.REJECTED
                    ],
                    allowNull: false
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'createdat' 
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updatedat' 
                }
            },
            {
                sequelize,
                modelName: 'report',
                timestamps: true
            }
        );

        this.dao = new Dao<Report>(this); 
    }
    static associate() {
        this.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    }

}

Report.initialize();
Report.associate();


export { Report };







