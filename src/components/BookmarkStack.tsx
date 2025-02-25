import {useContext, useEffect } from 'react';
import { Bookmark } from './Bookmark';
import { bookmarksParams, getBookmarkTree } from '../models/bookmarks';
import { AddBookmark } from './AddBookmark';
import { DbContext } from '../contexts/dbContext';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import './bookmarks.css';


export const BookmarkStack = () => {
  const { databases, put, putAll, remove} = useContext(DbContext);
  const bookmarks = databases[bookmarksParams.name]?.collection || [];
  const bookmarkRoot = getBookmarkTree(bookmarks);
  console.log(bookmarkRoot);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );



  

  useEffect(() => {
    const collection = databases[bookmarksParams.name]?.collection || [];
    
    function createRoot() {
      let root = collection.find(x => x.id == 0);
      if (!root) {
        root = { id: 0, title: 'Bookmarks', url: '', parent: null, orderNumber: 0 };
        put(bookmarksParams.name, root);
      }
    }
    createRoot();

  }, [put, databases[bookmarksParams.name]?.collection]);

  const {setNodeRef} = useDroppable({
    id: 'bookmark-stacks-drop',
    data: {
      accepts: ['text/uri-list', 'text/moz-link'],
    },
  });

  const handleDragOverWindow = (event: any) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('text/uri-list')) {
      event.dataTransfer.dropEffect = 'move';
      event?.preventDefault();
    }
  }

  const getBookmarkId = (event: any) => {
    let element = event.target;
    while (element) {
      let id = element.dataset.bookmarkId;
      if (id) {
        return parseInt(id);
      }
      element = element.parentElement;
    }
    return 0;
  }

  const handleDropWindow = (event: any) => {
    let type = event.dataTransfer.types.includes('text/x-moz-url') ? 'text/x-moz-url' : event.dataTransfer.types.includes('text/uri-list') ? 'text/uri-list' : null;
    let dropId = getBookmarkId(event);

    if (type) {
      event.preventDefault();
      let url;
      let title;
      if (type === 'text/x-moz-url') {
        [url, title] = event.dataTransfer.getData(type).split('\n');
        url = url.replace('URL=', '');
        title = title.replace('TITLE=', '');
      } else {
        url = event.dataTransfer.getData(type);
        title = url;
      }
      put(bookmarksParams.name, { url, title, parent: dropId, orderNumber: bookmarks.length });

    }
  };

  const handleDragEnd = (event: any) => {
    const {active, over } = event;
    const activeBookmark = bookmarks.find((bookmark) => bookmark.id === active.id);
    const overBookmark = bookmarks.find((bookmark) => bookmark.id === over.id);
    activeBookmark.orderNumber = overBookmark.orderNumber;
    overBookmark.orderNumber = overBookmark.orderNumber + 1;
    // if parent changed
    if (activeBookmark.parent !== overBookmark.parent) {
      activeBookmark.parent = overBookmark.parent;
    }
    putAll(bookmarksParams.name, [activeBookmark, overBookmark]);

  };

  useEffect(() => {
    window.addEventListener('drop', handleDropWindow);
    window.addEventListener('dragover', handleDragOverWindow);
    return () => {
      window.removeEventListener('drop', handleDropWindow);
      window.removeEventListener('dragover', handleDragOverWindow);
    };
  }, [databases[bookmarksParams.name]?.collection, putAll]);


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
    <div id="bookmarkStack" ref={setNodeRef}>
      <AddBookmark />
      <SortableContext 
        id="root"
        items={bookmarks}
        strategy={verticalListSortingStrategy}
      >
        {bookmarkRoot && <ul>
          <Bookmark 
            bookmark={bookmarkRoot} 
            onRemove={(id: number) => remove(bookmarksParams.name, id)}
            changeTitle={(id: number, title: string) => put(bookmarksParams.name, { id, title })}
          />
        </ul>}
      </SortableContext>
    </div>
    </DndContext>
  );
}