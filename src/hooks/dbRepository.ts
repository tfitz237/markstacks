import AsyncIndexedDB from '../services/indexdb';

export interface IDbRepository<T> {
    db: AsyncIndexedDB;
    get: (key: any) => Promise<T>;
    getAll: () => Promise<T[]>;
    put: (object: any) => Promise<void>;
    remove: (key: any) => Promise<void>;
    collection: T[];
}

export interface IDbHookParams {
    name: string;
    schema: Function;
    schemaName: string;
    fetchOnInit?: boolean;
}

export default async function DbRepository<T>({ name, schema, schemaName, fetchOnInit = true }: IDbHookParams): Promise<IDbRepository<T>> {
  let db: AsyncIndexedDB;
    const getStore = () => {
      const store = db.query(schemaName);
      return store;
  }

  const get = async (key: any) => {
      const store = getStore();
      return await store.get(key);
  };

  const getAll = async () => {
      const store = getStore();
      const data = await store.getAll();
      return data;
  };

  const put = async (object: any) => {
      const store = getStore();
      await store.put(object);
  };

  const remove = async (key: any) => {
      const store = getStore();
      await store.delete(key);
  };

  const methods = {
    get,
    getAll,
    put,
    remove,
  };

  db = new AsyncIndexedDB(name, schema, 1);
  return new Promise<IDbRepository<T>>(async (resolve) => {
    await db.open();
    const collection = fetchOnInit ? await getAll() : [];
    resolve({...methods, collection, db });
  });
}