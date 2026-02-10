import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function DraggableWindow({
  window,
  onFocus,
  onMove,
  onClose,
  onMinimize,
  z
}) {
  const startPosRef = useRef(window.pos);

  useEffect(() => {
    startPosRef.current = window.pos;
  }, [window.pos]);

  if (window.type === 'terminal') {
    return (
      <motion.div
        style={{
          position: "absolute",
          left: window.pos.x,
          top: window.pos.y,
          zIndex: z,
        }}
        drag
        dragMomentum={false}
        onDragStart={() => {
          startPosRef.current = { ...window.pos };
        }}
        onDragEnd={(event, info) => {
          const newX = startPosRef.current.x + info.offset.x;
          const newY = startPosRef.current.y + info.offset.y;
          onMove({ x: newX, y: newY });
        }}
      >
        {window.content}
      </motion.div>
    );
  }
  // ...existing code...
  return (
    <motion.div
      className="gov-window"
      style={{
        position: "absolute",
        left: window.pos.x,
        top: window.pos.y,
        zIndex: z,
      }}
      onMouseDown={onFocus}
      drag
      dragMomentum={false}
      onDragStart={() => {
        startPosRef.current = { ...window.pos };
      }}
      onDragEnd={(event, info) => {
        const newX = startPosRef.current.x + info.offset.x;
        const newY = startPosRef.current.y + info.offset.y;
        onMove({ x: newX, y: newY });
      }}
    >
      <div className="gov-window-titlebar" style={{ cursor: "grab" }}>
        <span className="gov-window-title">{window.title}</span>
        <div className="gov-window-buttons">
          <button type="button" onClick={onMinimize}>_</button>
          <button type="button" onClick={onClose}>X</button>
        </div>
      </div>

      <div className="gov-window-content">
        {window.content}
      </div>
    </motion.div>
  );
}
