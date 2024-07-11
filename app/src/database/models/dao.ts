import { Model, ModelCtor, Optional } from 'sequelize';
import { getFromCache, setInCache, deleteFromCache } from '../cache';

interface DaoI<T extends Model> {
    get(id: number): Promise<T | null>;
    getAll(): Promise<T[]>;
    save(instance: T): Promise<void>;
    update(instance: T, updateParams: Optional<T, keyof T>): Promise<void>;
    delete(instance: T): Promise<void>;
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
        const cachedResult = await getFromCache(cacheKey);

        if (cachedResult) {
            console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
            return JSON.parse(cachedResult) as T;
        }

        const result = await this.model.findByPk(id);

        if (result) {
            console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
            setInCache(cacheKey, JSON.stringify(result));
        }

        return result;
    }

    async getAll(): Promise<T[]> {
        const cacheKey = this.generateCacheKey();
        const cachedResult = await getFromCache(cacheKey);

        if (cachedResult) {
            console.log(`Cache HIT!!!\nGet ${cacheKey} with value ${cachedResult}`);
            return JSON.parse(cachedResult) as T[];
        }

        const result = await this.model.findAll();

        if (result && result.length > 0) {
            console.log(`Cache MISS!!!\nSet ${cacheKey} with value ${JSON.stringify(result)}`);
            setInCache(cacheKey, JSON.stringify(result));
        }

        return result;
    }

    async save(instance: T): Promise<void> {
        await instance.save();
        this.invalidateCache(instance);
    }
    
    async create(data: Partial<T>): Promise<T> {
        const instance = await this.model.create(data);
        this.invalidateCache(instance);
        return instance;
    }

    async update(instance: T, updateParams: Optional<T, keyof T>): Promise<void> {
        await instance.update(updateParams);
        this.invalidateCache(instance);
    }

    async delete(instance: T): Promise<void> {
        await instance.destroy();
        this.invalidateCache(instance);
    }

    private invalidateCache(instance: T): void {
        const id = (instance as any).id as number; // Assuming ID is directly accessible as a property
        const cacheKey = this.generateCacheKey(id);
        deleteFromCache(cacheKey);

        const allCacheKey = this.generateCacheKey();
        deleteFromCache(allCacheKey);
    }
}
