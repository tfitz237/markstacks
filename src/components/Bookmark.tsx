import { useEffect, useRef, useState } from 'react';
import './bookmarks.css';
import { useSortable } from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';



export const Bookmark = ({ id, url, title, onRemove, changeTitle, onDrop }: { id: number, url: string, title: string, onRemove?: Function, changeTitle: Function, onDrop?: Function}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [focused, setFocused] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({id, disabled: id == 0});

  const style = {
    transform: id != 0 &&  CSS.Transform.toString(transform),
    transition: id != 0 && transition,
  };

  


  return (
    <li 
      className='bookmarkRoot' 
      style={{opacity: isDragging ? '50%': '100%', ...style}}
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
            {title}
          </span>
        {onRemove && id != 0 && <button style={{ float: 'right', padding: '0.25rem', lineHeight: 'normal'}} onClick={(e) => { e.stopPropagation(); onRemove() }}>X</button>}

      </div>
      {showDetails && 
      <div className='bookmarkDetails'>
        <a href="{url}" target="_blank">{url}</a>
      </div>}
    </li>
  );
}