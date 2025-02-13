import { useEffect } from 'react';

export const Modal = ({ open, onClose, children }: { open: boolean, onClose: Function, children: any }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [open]);
  return (<>
    <dialog open={open} style={{ position: 'fixed', top: '25%', left: '50%', transform: 'translate(-25%, -50%)', zIndex: 1000 }}>
      <button onClick={() => onClose()} aria-label="Close" rel="prev" style={{ float: 'right' }}>X</button>
      {children}
    </dialog>
    <div style={{ display: open ? 'block' : 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => onClose()}></div>
 </>);
};