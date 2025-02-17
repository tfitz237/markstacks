import { BookmarkStack } from './components/BookmarkStack';
import './App.css';
import { DbProvider } from './contexts/dbContext';
import { bookmarksParams } from './models/bookmarks';
function App() {

  return (
    <>
      <DbProvider dbsToInit={[ bookmarksParams ]}>
          <div className="appRoot">
            <BookmarkStack />
          </div>
      </DbProvider>
    </>
  );
}

export default App;
