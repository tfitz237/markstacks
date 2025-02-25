import { useState } from 'react';
import './bookmarks.css';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { IBookmark } from '../models/bookmarks';



export const Bookmark = ({ bookmark, onRemove, changeTitle, onDrop }: { bookmark: IBookmark, onRemove?: Function, changeTitle: Function, onDrop?: Function}) => {
  const id = bookmark.id!;
  const [showDetails, setShowDetails] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({id, disabled: id == 0});

  const style: any = {
    transform: id != 0  &&  CSS.Transform.toString(transform),
    transition: id != 0 && transition,
    opacity: isDragging ? '50%' : '100%',
    paddingRight: !showDetails ? '0.5rem': '0',
    borderBottom: id == 0 ? 'none' : '1px solid #ccc',
  };

  
  return (
    <li 
      className='bookmarkRoot' 
      style={style}
      data-bookmark-id={id}
      ref={setNodeRef}
      >
      <div className='bookmarkLine'>
          <button className='details'
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails)}
            }>
                {showDetails ? '-' : '+'}
          </button>
          
          <span className='bookmarkDragHandle' {...attributes} {...listeners} style={{ cursor: isOver ? 'move' : 'default' }}>
            {bookmark.title}
          </span>
        {onRemove && id != 0 && <button style={{ float: 'right', padding: '0.25rem', lineHeight: 'normal'}} onClick={(e) => { e.stopPropagation(); onRemove(id) }}>X</button>}

      </div>
      {showDetails && 
      <div className='bookmarkDetails'>
        <a href="{bookmark.url}" target="_blank">{bookmark.url}</a>
        {bookmark.children && 
        <SortableContext
          id={id.toString()}
          items={(bookmark as any).children}
          strategy={verticalListSortingStrategy}
        >
          {bookmark.children && <ul>
            {bookmark.children?.map((child) => (
              <Bookmark key={child.id} bookmark={child} changeTitle={changeTitle} onRemove={onRemove} onDrop={onDrop} />
            ))}
          </ul>}
        </SortableContext>}
      </div>}
    </li>
  );
}