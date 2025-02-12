import { useState } from 'react';
import { DbRepositoryHook } from '../hooks/dbRepository';
import { Bookmark } from './Bookmark';

interface IBookmark {
  id: number;
  url: string;
  title: string;
}

const schemaName = 'bookmarks';

const BookmarkSchema = async (db: IDBDatabase) => {
  const store = db.createObjectStore(schemaName, { keyPath: 'id', autoIncrement: true });
  store.createIndex('url', 'url', { unique: true });
  store.createIndex('title', 'title', { unique: false });
}

export const BookmarkStack = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [openAddBookmark, setOpenAddBookmark] = useState(false);
  const { collection: bookmarks, ...db } = DbRepositoryHook<IBookmark>({ name: 'markstacks', schema: BookmarkSchema, schemaName });


  const addBookmark = async () => {
    await db.put({ url, title });
    setUrl('');
    setTitle('');
    setOpenAddBookmark(false);
  };


  return (
    <div>
      <dialog open={openAddBookmark}>
        <article>
          <header>
            <button onClick={() => setOpenAddBookmark(false)} aria-label="Close" rel="prev"></button>
            Bookmarks
          </header>

          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <footer>
            <button onClick={addBookmark}>Add Bookmark</button>
          </footer>
        </article>
      </dialog>
      <button onClick={() => setOpenAddBookmark(true)}>Add</button>
      <div>
        {bookmarks.map((bookmark) => (
          <Bookmark 
            key={bookmark.id} 
            url={bookmark.url} 
            title={bookmark.title} 
            onRemove={() => db.remove(bookmark.id)} />
        ))}
      </div>
    </div>
  );
}