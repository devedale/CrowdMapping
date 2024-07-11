import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';

class Role extends Model {
    private id!: number;
    private name!: string;
    public dao!: Dao<Role>;

    static initialize(): void {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'createdat' // specifica il nome della colonna nel database
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updatedat' // specifica il nome della colonna nel database
                }
            },
            {
                sequelize,
                modelName: 'role',
                timestamps: true,
            }
        );

        this.dao = new Dao<Role>(this); // Istanzia la proprietà dao con new Dao<Role>(this)
    }

}

Role.initialize();

export { Role };
