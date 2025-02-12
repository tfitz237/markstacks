import { useState, useEffect } from 'react';
import AsyncIndexedDB from '../services/indexdb';

export function DbRepositoryHook<T>({ name, schema, schemaName, fetchOnInit = true }: { name: string, schema: Function, schemaName: string, fetchOnInit?: boolean }) {
  const [db, setDb] = useState<any>();
  const [collection, setCollection] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


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
      setCollection(data);
      return data;
  };

  const put = async (object: any) => {
      const store = getStore();
      await store.put(object);
      await getAll();
  };

  const remove = async (key: any) => {
      const store = getStore();
      await store.delete(key);
      await getAll();
  };

  useEffect(() => {
      const db = new AsyncIndexedDB(name, schema, 1);
      db.open().then(() => {
          setDb(db);
          setLoading(false);
          if (fetchOnInit) {
              db.query(schemaName).getAll().then((data: any) => {
                  setCollection(data);
              });
          }
      });
  }, []);

  return { 
    db, 
    getStore,
    collection,
    loading,
    get,
    getAll,
    put,
    remove,
  };
}