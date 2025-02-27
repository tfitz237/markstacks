import { useEffect, useRef, useState } from 'react';
import { NodeRendererProps } from 'react-arborist';
import { IBookmark } from '../models/bookmarks';
// import './bookmarks.css';


export const Bookmark = ({ node, style, dragHandle }: NodeRendererProps<IBookmark>) => {
  const bookmark = node.data;
  const id = bookmark.id!;
  const showDetails = node.isOpen;
  const hasChildren = !(node.children?.length == 0);


  return (
    <div 
      className='bookmarkRoot' 
      style={style}
      >
      <div className='bookmarkLine'>
          <button className='details'
            onClick={() => node.toggle()}>
                {hasChildren ? showDetails ? '➖' : '➕': '🛞'}
          </button> 
          <span className='bookmarkDragHandle' ref={dragHandle}>
            {bookmark.name}
          </span>
        {/* {onRemove && id != 0 && <button style={{ float: 'right', padding: '0.25rem', lineHeight: 'normal'}} onClick={(e) => { e.stopPropagation(); onRemove(id) }}>X</button>} */}

      </div>
      {/* {showDetails && 
      <div className='bookmarkDetails'>
        <a href="{bookmark.url}" target="_blank">{bookmark.url}</a>
      </div>} */}
    </div>
  );
}