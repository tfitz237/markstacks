import { useState } from 'react';
import './bookmarks.css';

export const Bookmark = ({ id, url, title, onRemove, changeTitle }: { id: string, url: string, title: string, onRemove?: Function, changeTitle: Function}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [focused, setFocused] = useState(false);

  const titleChanged = (e: any) => {
    changeTitle(e.target.innerText);
    e.target.blur();
    setFocused(false);
  };

  return (
    <li className='bookmarkRoot' style={{ backgroundColor: focused ? '#332' : 'inherit' }} data-id={id}>
      <div className='bookmarkLine'>
        <button className='details'
          onClick={() => setShowDetails(!showDetails)}>{showDetails ? '-' : '+'}
        </button>
        <span 
          contentEditable
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); titleChanged(e); } }}
        >
          {title}
        </span>
        {onRemove && <button style={{ float: 'right', padding: '0.25rem', lineHeight: 'normal'}} onClick={() => onRemove()}>X</button>}

      </div>
      {showDetails && 
      <div className='bookmarkDetails'>
        <a href="{url}" target="_blank">{url}</a>
      </div>}
    </li>
  );
}