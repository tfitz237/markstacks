export const Bookmark = ({ url, title, onRemove }: { url: string, title: string, onRemove?: Function}) => {
  return (
    <article>
      <header>{title}{onRemove && <button style={{ float: 'right'}} onClick={() => onRemove()}>X</button>}</header>
      <a href="{url}" target="_blank">{url}</a>
    </article>
  );
}