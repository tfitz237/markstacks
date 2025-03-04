export default class AsyncIndexedDB {
  name: string;
  schema: Function;
  version: number;
  db: IDBDatabase | null;
  // return opened database with schema definitions given.
  constructor(db_name: string, schema: Function, version: number) {
      this.name = db_name;
      this.schema = schema; // upgrade callback
      this.version = version;
      this.db = null;
      Object.seal(this);
  }

  open() {
      return new Promise((resolve, reject) => {
          const db_request = self.indexedDB.open(this.name, this.version);
          const schema = this.schema;
          db_request.onerror = (event) => reject(event);
          db_request.onsuccess = () => {
              this.db = db_request.result;
              resolve(this);
          }
          db_request.onupgradeneeded = function () {
              schema(this.result)
          };
      })
  }

  // returns an ObjectStore proxy whose methods are awaitable.
  query(objectStoreName: string, mode: IDBTransactionMode = "readwrite", oncomplete?: ((this: IDBTransaction, ev: Event) => any) | null, onerror?: ((this: IDBTransaction, ev: Event) => any) | null) {
      // e.g. await this.query().getAll()
      const transaction = this.db!.transaction(objectStoreName, mode);
      if (oncomplete instanceof Function) transaction.oncomplete = oncomplete;
      if (onerror instanceof Function) transaction.onerror = onerror;
      return AsyncIndexedDB.proxy(transaction.objectStore(objectStoreName))
  }

  static proxy(obj: any) {
      // convert an IDBObjectStore and IDBIndex to an ObjectStore proxy whose methods are awaitable.
      return new Proxy(obj, {
          get: function (obj, prop) {
              if (!(obj[prop] instanceof Function)) return obj[prop];
              return function (...params: any[]) {
                  const request = obj[prop](...params);
                if (request instanceof IDBIndex)
                  return AsyncIndexedDB.proxy(obj.index(...params));
                  // When a cursor supposed to be returned, return an AsyncIterable instead.
                  // e.g. for await (let {key, value, primaryKey} of await this.query().openCursor()) { ... }
                  return new Promise((resolve, reject) => {
                      request.onsuccess = () => {
                          let result = request.result;
                          if (result instanceof IDBCursor)
                              resolve({
                                  request, 
                                cursor: result,
                                  [Symbol.asyncIterator]: async function* () {
                                      let promise;
                                      while (result) {
                                          yield {key: result.key, value: result.value, primaryKey: result.primaryKey};
                                          promise = new Promise<void>((resolve, reject) => {
                                              request.onsuccess = () => resolve()
                                              request.onerror = (e: any) => reject(e);
                                          });
                                          result.continue();
                                          await promise;
                                          result = request.result
                                      }
                                  }
                              });
                          else
                            // functions that do not return a cursor or an index are just turned into Promises.
                            resolve(result);
                      }
                      request.onerror = (e: any) => reject(e);
                  });
              }
          },
      });
  }

  async export(keyRange: IDBKeyRange | null = null, count?: number) {
      // Serialize IndexedDB in [[objectStoreName1, [..objects], [objectStoreName2, [..objects], ...] that can be easily turned into a Map.
      if (!this.db) throw new Error("Database is not initialized");
      return JSON.stringify(await Promise.all([...this.db.objectStoreNames].map(
          async objectStorename => {
              const query = await this.query(objectStorename);
              if (query.keyPath === null)
                  return [objectStorename, query.getAll(keyRange, count)]
          }
      )))
  }

  async import(data: any, keyPaths: any) {
      // Need to back up the original before import in case of error.
      // data validation may be required.
      data = JSON.parse(data);
      await Promise.all(data.map(async ([objectStoreName, entries]: [objectStoreName: string, entries: any[]]) => {
          let query = this.query(objectStoreName);
          if (query.keyPath === null) {
              let keyPath = keyPaths[objectStoreName];
              if (keyPath === undefined)
                  throw `ObjectStore '${query.name}' does not have a KeyPath. Call import(data, {[objectStoreName]:[keyPath]}).`
              for (let obj of entries) {
                  const key = obj[keyPath];
                  if (key !== undefined) throw `ObjectStore '${query.name}' entry '${obj}' is missing its key.`
                  await query.put(obj, key);
              }
          } else {
              for (let obj of entries) await query.put(obj);
          }
      }))
  }

  async clear() {
      return new Promise((resolve, reject) => {
          const request = self.indexedDB.deleteDatabase(this.name);
          request.onsuccess = resolve;
          request.onerror = reject;
      })
  }
}

