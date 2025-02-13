import { useState } from 'react';
import './bookmarks.css';

export const Bookmark = ({ url, title, onRemove }: { url: string, title: string, onRemove?: Function}) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <li className='bookmarkRoot'>
      <div className='bookmarkLine'>
        <button className='details'
          onClick={() => setShowDetails(!showDetails)}>{showDetails ? '-' : '+'}
        </button>
        <span>{title}</span>
        {onRemove && <button style={{ float: 'right', padding: '0.25rem', lineHeight: 'normal'}} onClick={() => onRemove()}>X</button>}

      </div>
      { showDetails && <a href="{url}" target="_blank">{url}</a>}
    </li>
  );
}