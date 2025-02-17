
export interface IBookmark {
  id?: number;
  url: string;
  title: string;
  parent: number;
  children: number[];
}

const schemaName = 'bookmarks';

const BookmarkSchema = async (db: IDBDatabase) => {
  const store = db.createObjectStore(schemaName, { keyPath: 'id', autoIncrement: true });
  store.createIndex('url', 'url', { unique: true });
  store.createIndex('title', 'title', { unique: false });
  store.createIndex('parent', 'parent', { unique: false });
  store.createIndex('children', 'children', { unique: false });
}

export const bookmarksParams = { name: 'markstacks', schema: BookmarkSchema, schemaName };
