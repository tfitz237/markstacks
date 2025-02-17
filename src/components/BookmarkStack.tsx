import {useContext, useEffect, useRef, useState } from 'react';
import { Bookmark } from './Bookmark';
import { bookmarksParams, IBookmark } from '../models/bookmarks';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


export const BookmarkStack = () => {
  const { databases, put, remove} = useContext(DbContext);
  const items = databases[bookmarksParams.name]?.collection || [];
  const [bookmarks, setBookmarks] = useState<IBookmark[]>(items);
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
        root = { id: 0, title: 'Bookmarks', url: '', parent: null, children: [] };
        put(bookmarksParams.name, root);
      }
    }
    createRoot();


    setBookmarks(collection);
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
      put(bookmarksParams.name, { url, title, parent: dropId, children: [] });

    }
  };
  const handleDragEnd = (event: any) => {
    const {active, over } = event;
    if (active.id == 0 || over.id == 0) {
      if (over.id == 0) {
        const oldIndex = bookmarks.findIndex((bookmark) => bookmark.id === active.id);
        const bookmark = bookmarks[oldIndex];
        bookmark.parent = 0;
        const newBookmarks = arrayMove(bookmarks, oldIndex, 1);
        setBookmarks(newBookmarks);
      }
    } else if (active.id !== over.id) {
      const oldIndex = bookmarks.findIndex((bookmark) => bookmark.id === active.id);
      const newIndex = bookmarks.findIndex((bookmark) => bookmark.id === over.id);
      const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
      setBookmarks(newBookmarks);
    }
  };

  useEffect(() => {
    window.addEventListener('drop', handleDropWindow);
    window.addEventListener('dragover', handleDragOverWindow);
    return () => {
      window.removeEventListener('drop', handleDropWindow);
      window.removeEventListener('dragover', handleDragOverWindow);
    };
  }, [databases[bookmarksParams.name]?.collection, put]);


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
    <div id="bookmarkStack" ref={setNodeRef}>
      <AddBookmark />
      <SortableContext 
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {bookmarks?.map((bookmark) => (
          <Bookmark
            key={bookmark.id}
            id={bookmark.id!}
            url={bookmark.url} 
            title={bookmark.title} 
            onRemove={() => remove(bookmarksParams.name, bookmark.id)}
            changeTitle={(title: string) => put(bookmarksParams.name, { ...bookmark, title})}
            />
        ))}
      </SortableContext>
    </div>
    </DndContext>
  );
}