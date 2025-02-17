import { useContext, useState } from 'react';
import { Modal } from './Modal';
import { bookmarksParams } from '../models/bookmarks';
import { DbContext } from '../contexts/dbContext';

export const AddBookmark = () => {
  const { put } = useContext(DbContext);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [openAddBookmark, setOpenAddBookmark] = useState(false);

  const addBookmark = async () => {
    await put(bookmarksParams.name, { url, title, parent: 0, children: [] });
    setUrl('');
    setTitle('');
    setOpenAddBookmark(false);
  };

  
  return (<>
    <Modal open={openAddBookmark} onClose={() => setOpenAddBookmark(false)}>
      <article>
        <h1>Add a bookmark</h1>
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
    </Modal>
    <button onClick={() => setOpenAddBookmark(true)}>Add</button>
  </>);
};
