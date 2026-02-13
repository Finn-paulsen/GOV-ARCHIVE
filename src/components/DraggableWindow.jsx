import React, { useRef } from "react";
export default function DraggableWindow({
  window,
  getWindowContent,
  onFocus,
  onMove,
  onClose,
  onMinimize,
  onMaximize,
  z
}) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const windowStart = useRef({ x: 0, y: 0 });

  // Mouse event handlers
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onFocus && onFocus();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    windowStart.current = { ...window.pos };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    onMove({
      x: windowStart.current.x + dx,
      y: windowStart.current.y + dy
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const isMaximized = window.maximized;
  return (
    <div
      className={`gov-window${isMaximized ? ' maximized' : ''}`}
      style={
        isMaximized
          ? {
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100vw',
              height: '100vh',
              zIndex: z,
              userSelect: dragging.current ? 'none' : 'auto',
            }
          : {
              position: 'absolute',
              left: window.pos.x,
              top: window.pos.y,
              zIndex: z,
              userSelect: dragging.current ? 'none' : 'auto',
            }
      }
      onMouseDown={onFocus}
    >
      <div
        className="gov-window-titlebar"
        style={{ cursor: isMaximized ? 'default' : 'grab' }}
        onMouseDown={isMaximized ? undefined : handleMouseDown}
      >
        <span className="gov-window-title">{window.title}</span>
        <div className="gov-window-buttons">
          <button type="button" onClick={onMinimize}>_</button>
          <button type="button" onClick={onMaximize}>{isMaximized ? '🗗' : '🗖'}</button>
          <button type="button" onClick={onClose}>X</button>
        </div>
      </div>

      <div className="gov-window-content" style={isMaximized ? {height: 'calc(100vh - 36px)'} : {}}>
        {getWindowContent && getWindowContent(window)}
      </div>
    </div>
  );
}
