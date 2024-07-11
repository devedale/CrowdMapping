import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../connection'; 
import { Dao } from './dao'; 
import { Role } from './role';

class User extends Model {
    private id!: number;
    private email!: string;
    private nickname!: string;
    private password!: string;
    private roleId!: number;
    public dao!: Dao<User>;

    static initialize(): void {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                nickname: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                roleId: { 
                    type: DataTypes.INTEGER,
                    field: 'roleid',
                    references: {
                        model: 'roles', 
                        key: 'id',
                    },
                    allowNull: false,
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
                modelName: 'user',
                timestamps: true,
                hooks: {
                    beforeCreate: async (user: User) => {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    },
                    beforeUpdate: async (user: User) => {
                        if (user.changed('password')) {
                            const salt = await bcrypt.genSalt(10);
                            user.password = await bcrypt.hash(user.password, salt);
                        }
                    }
                }
            }
        );

        this.dao = new Dao<User>(this); 
    }

    public comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
    
    static associate() {
        this.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    }
}

User.initialize();
User.associate();


export { User };
