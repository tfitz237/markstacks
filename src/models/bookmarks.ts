
export interface IBookmark {
  id?: number;
  url: string;
  title: string;
}

const schemaName = 'bookmarks';

const BookmarkSchema = async (db: IDBDatabase) => {
  const store = db.createObjectStore(schemaName, { keyPath: 'id', autoIncrement: true });
  store.createIndex('url', 'url', { unique: true });
  store.createIndex('title', 'title', { unique: false });
}

export const bookmarksParams = { name: 'markstacks', schema: BookmarkSchema, schemaName };
