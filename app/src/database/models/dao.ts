import { Model, ModelCtor, Optional } from 'sequelize';
import redisClient from '../cache';

const getFromCache = redisClient.getFromCache;
const setInCache = redisClient.setInCache;
const deleteFromCache = redisClient.deleteFromCache;

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
      console.log(`\n\n\n\nCACHEresult${result}\nCACHEawait this.model.findByPk(id)${await this.model.findByPk(id)}`);

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

  async update(instance: T, updateParams: Partial<T>): Promise<0 | 1> {
    const id = (instance as T).id as number;
    if (!id) {
      console.error('Instance ID is missing');
      return 0;
    }

    try {
      await this.invalidateCache(instance);
      const [affectedRows] = await this.model.update(updateParams, {
        where: { id },
      });
      return affectedRows ? 1 : 0;
    } catch (error) {
      console.error(`Error in update method: ${error}`);
      return 0;
    }
  }

  async delete(instance: T): Promise<0 | 1> {
    const id = (instance as T).id as number;
    if (!id) {
      console.error('Instance ID is missing');
      return 0;
    }

    try {
      await this.invalidateCache(instance);
      const result = await this.model.destroy({ where: { id } });
      return result ? 1 : 0;
    } catch (error) {
      console.error(`Error in delete method: ${error}`);
      return 0;
    }
  }

  private async invalidateCache(instance: T): Promise<void> {
    const id = (instance as T).id as number;
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
