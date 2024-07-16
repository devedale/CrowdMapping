import { Model, ModelCtor, Optional } from 'sequelize';
import { getFromCache, setInCache, deleteFromCache } from '../cache';

interface DaoI<T extends Model> {
    get(id: number): Promise<T | null>;
    getAll(): Promise<T[]>;
    save(instance: T): Promise<boolean>;
    create(data: Partial<T>): Promise<T | null>;
    update(instance: T, updateParams: Optional<T, keyof T>): Promise<boolean>;
    delete(instance: T): Promise<boolean>;
}

export class Dao<T extends Model> implements DaoI<T> {
    private model: ModelCtor<T>;

    constructor(model: ModelCtor<T>) {
        this.model = model;
    }

    private generateCacheKey(id?: number): string {
        const className = this.model.name;
        return id ? `${className}:${id}` : `${className}:all`;
    }

    async get(id: number): Promise<T | null> {
        const cacheKey = this.generateCacheKey(id);
        try {
            const cachedResult = await getFromCache(cacheKey);

            if (cachedResult) {
                console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
                return JSON.parse(cachedResult) as T;
            }

            const result = await this.model.findByPk(id);

            if (result) {
                console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
                await setInCache(cacheKey, JSON.stringify(result));
            }

            return result;
        } catch (error) {
            console.error(`Error in get method: ${error}`);
            throw error;
        }
    }

    async getAll(): Promise<T[]> {
        const cacheKey = this.generateCacheKey();
        try {
            const cachedResult = await getFromCache(cacheKey);

            if (cachedResult) {
                console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
                return JSON.parse(cachedResult) as T[];
            }

            const result = await this.model.findAll();

            if (result && result.length > 0) {
                console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
                await setInCache(cacheKey, JSON.stringify(result));
            }

            return result;
        } catch (error) {
            console.error(`Error in getAll method: ${error}`);
            throw error;
        }
    }

    async save(instance: T): Promise<boolean> {
        try {
            await instance.save();
            await this.invalidateCache(instance);
            return true;
        } catch (error) {
            console.error(`Error in save method: ${error}`);
            return false;
        }
    }

    async create(data: Partial<T>): Promise<T | null> {
        try {
            const instance = await this.model.create(data);
            await this.invalidateCache(instance);
            return instance;
        } catch (error) {
            console.error(`Error in create method: ${error}`);
            return null;
        }
    }

    async update(instance: T, updateParams: Optional<T, keyof T>): Promise<boolean> {
        const id = (instance as any).id as number;
        if (!id) {
            console.error('Instance ID is missing');
            return false;
        }

        try {
            await this.model.update(updateParams, { where: { id } });
            await this.invalidateCache(instance);
            return true;
        } catch (error) {
            console.error(`Error in update method: ${error}`);
            return false;
        }
    }

    async delete(instance: T): Promise<boolean> {
        try {
            await instance.destroy();
            await this.invalidateCache(instance);
            return true;
        } catch (error) {
            console.error(`Error in delete method: ${error}`);
            return false;
        }
    }

    private async invalidateCache(instance: T): Promise<void> {
        const id = (instance as any).id as number; // Assuming ID is directly accessible as a property
        const cacheKey = this.generateCacheKey(id);
        try {
            await deleteFromCache(cacheKey);
        } catch (error) {
            console.error(`Error deleting cache for key ${cacheKey}: ${error}`);
        }

        const allCacheKey = this.generateCacheKey();
        try {
            await deleteFromCache(allCacheKey);
        } catch (error) {
            console.error(`Error deleting cache for key ${allCacheKey}: ${error}`);
        }
    }
}
