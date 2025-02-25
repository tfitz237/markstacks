import { createContext, useEffect, useState } from 'react';
import { IDbHookParams, IDbRepository } from '../hooks/dbRepository';
import DbRepository from '../hooks/dbRepository';

interface DbContextType {
  databases: { [key: string]: IDbRepository<any> };
  get: (dbName: string, id: any) => Promise<any>;
  getAll: (dbName: string) => Promise<any[]>;
  put: (dbName: string, object: any) => Promise<void>;
  putAll: (dbName: string, objects: any[]) => Promise<void>;
  remove: (dbName: string, id: any) => Promise<void>;

}

export const DbContext = createContext<DbContextType>({} as any);

export const DbProvider = ({ children, dbsToInit = [] }: { children: any, dbsToInit: IDbHookParams[] }) => {
  const [databases, setDatabases] = useState<{ [key: string]: IDbRepository<any> }>({});


  useEffect(() => {
    const fetchDbs = async (dbSchemaParams: IDbHookParams) => await DbRepository(dbSchemaParams);
    
    Promise.all(dbsToInit.map(fetchDbs)).then((dbs) => {
      const dbsObj = dbs.reduce((acc: any, db) => {
        acc[db.db.name] = db;
        return acc;
      }, {});
      setDatabases(dbsObj);
    });
  }, [dbsToInit]);

  const getAll = async (dbName: string) => {
    const db = databases[dbName];
    if (db) {
      const data = await db.getAll();
      setDatabases({ ...databases, [dbName]: { ...db, collection: data } });
      return data;
    }
    return [];
  }


  const get = async (dbName: string, id: any) => {
    const db = databases[dbName];
    if (db) {
      if (db.collection.length === 0) {
        const data = await db.getAll();
        return data.find((item: any) => item.id === id);
      }
      return db.collection.find((item: any) => item.id === id);
    }
    return null;
  }

  const put = async (dbName: string, object: any) => {
    const db = databases[dbName];
    if (db) {
      await db.put(object);
      const data = await db.getAll();
      setDatabases({ ...databases, [dbName]: { ...db, collection: data } });
    }
  }

  const putAll = async (dbName: string, objects: any[]) => {
    const db = databases[dbName];
    if (db) {
      await db.putAll(objects);
      const data = await db.getAll();
      setDatabases({ ...databases, [dbName]: { ...db, collection: data } });
    }
  }

  const remove = async (dbName: string, id: any) => {
    const db = databases[dbName];
    if (db) {
      await db.remove(id);
      const data = await db.getAll();
      setDatabases({ ...databases, [dbName]: { ...db, collection: data } });
    }
  }

  const currentValue = { databases, get, getAll, put, putAll, remove };

  return (<>
    <DbContext.Provider value={currentValue}>
      {children}
    </DbContext.Provider>
    </>
  );
};
