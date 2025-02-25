
export interface IBookmark {
  id?: number;
  url: string;
  title: string;
  parent: number;
  orderNumber: number;
  children?: IBookmark[];
}

const schemaName = 'bookmarks';

const BookmarkSchema = async (db: IDBDatabase) => {
  const store = db.createObjectStore(schemaName, { keyPath: 'id', autoIncrement: true });
  store.createIndex('url', 'url', { unique: true });
  store.createIndex('title', 'title', { unique: false });
  store.createIndex('parent', 'parent', { unique: false });
  store.createIndex('orderNumber', 'orderNumber', { unique: false });
}

export const bookmarksParams = { name: 'markstacks', schema: BookmarkSchema, schemaName };

export const getBookmarkTree = ( bookmarks: IBookmark[], bookmark?: IBookmark): IBookmark | null => {
  const root = bookmark || bookmarks.find(x => x.id == 0);
  if (!root) {
    return null;
  }
  const children = bookmarks.filter(x => x.parent == root.id);
  root.children = children.map(x => getBookmarkTree(bookmarks, x)!).sort((a, b) => a.orderNumber - b.orderNumber);
  return root;
};