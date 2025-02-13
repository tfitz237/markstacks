import {useContext, useEffect, useRef } from 'react';
import { Bookmark } from './Bookmark';
import { bookmarksParams } from '../models/bookmarks';
import { AddBookmark } from './AddBookmark';
import { DbContext } from '../contexts/dbContext';


export const BookmarkStack = () => {
  const { databases, put, remove} = useContext(DbContext);
  const bookmarks = databases[bookmarksParams.name]?.collection || [];


  const ref = useRef<HTMLDivElement>(null);

  const handleDragEnterOrOver = (e: DragEvent) => {
    const isLink = e.dataTransfer?.types.includes('text/uri-list');
    const isMozLink = e.dataTransfer?.types.includes('text/x-moz-url');
    if (isLink || isMozLink) {
      e.dataTransfer!.dropEffect = 'link';
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = e.dataTransfer?.getData('text/uri-list');
    
    if (url) {
      await put(bookmarksParams.name, { url, title: url });
    }
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('dragenter', handleDragEnterOrOver);
      ref.current.addEventListener('dragover', handleDragEnterOrOver);
      
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('dragenter', handleDragEnterOrOver);
        ref.current.removeEventListener('dragover', handleDragEnterOrOver);
      }
    }
  }, []);

  // Ensure that the put method in the handlers
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('drop', handleDrop);
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('drop', handleDrop);
      }
    }
  }, [put]);
  


  return (
    <div id="bookmarkStack" ref={ref}>
      <AddBookmark />
      <div>
        {bookmarks?.map((bookmark) => (
          <Bookmark
            key={bookmark.id}
            id={bookmark.id}
            url={bookmark.url} 
            title={bookmark.title} 
            onRemove={() => remove(bookmarksParams.name, bookmark.id)}
            changeTitle={(title: string) => put(bookmarksParams.name, { ...bookmark, title})} />
        ))}
      </div>
    </div>
  );
}