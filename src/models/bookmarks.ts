
export interface IBookmark {
  id?: number | string;
  url: string;
  name: string;
  parent: string;
  orderNumber: number;
  children?: IBookmark[];
}

const schemaName = 'bookmarks';

const BookmarkSchema = async (db: IDBDatabase) => {
  const store = db.createObjectStore(schemaName, { keyPath: 'id', autoIncrement: true });
  store.createIndex('url', 'url', { unique: true });
  store.createIndex('name', 'name', { unique: false });
  store.createIndex('parent', 'parent', { unique: false });
  store.createIndex('orderNumber', 'orderNumber', { unique: false });
}

export const bookmarksParams = { name: 'markstacks', schema: BookmarkSchema, schemaName };

export const getBookmarkTree = ( bookmarks: IBookmark[], bookmark?: IBookmark): IBookmark | null => {
  const root = bookmark || bookmarks.find(x => x.id == 0);
  if (!root) {
    return null;
  }
  root!.id = `${root.id}` as any;
  // root!.parent = root.parent === null && root.id !== 0 ? '0' : root.parent;
  const children = bookmarks.filter(x => x.parent == root.id);
  root.children = children.map(x => getBookmarkTree(bookmarks, x)!).sort((a, b) => a.orderNumber - b.orderNumber);
  return root;
};