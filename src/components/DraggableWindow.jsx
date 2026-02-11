import React, { useRef, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";

export default function DraggableWindow({
  window,
  getWindowContent,
  onFocus,
  onMove,
  onClose,
  onMinimize,
  z
}) {
  const startPosRef = useRef(window.pos);
  const dragControls = useDragControls();
  // Store mouse position at drag start
  const dragMouseStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    startPosRef.current = window.pos;
  }, [window.pos]);

  // ...existing code...
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
      dragListener={false}
      dragControls={dragControls}
      onDragStart={(event, info) => {
        startPosRef.current = { ...window.pos };
        if (info && info.point) {
          dragMouseStart.current = { x: info.point.x, y: info.point.y };
        } else if (event && event.touches && event.touches[0]) {
          dragMouseStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else if (event && event.clientX !== undefined) {
          dragMouseStart.current = { x: event.clientX, y: event.clientY };
        }
      }}
      onDragEnd={(event, info) => {
        let endX = info && info.point ? info.point.x : (event && event.clientX !== undefined ? event.clientX : 0);
        let endY = info && info.point ? info.point.y : (event && event.clientY !== undefined ? event.clientY : 0);
        const dx = endX - dragMouseStart.current.x;
        const dy = endY - dragMouseStart.current.y;
        const newX = startPosRef.current.x + dx;
        const newY = startPosRef.current.y + dy;
        onMove({ x: newX, y: newY });
      }}
    >
      <div
        className="gov-window-titlebar"
        style={{ cursor: "grab" }}
        onPointerDown={e => {
          dragControls.start(e);
        }}
      >
        <span className="gov-window-title">{window.title}</span>
        <div className="gov-window-buttons">
          <button type="button" onClick={onMinimize}>_</button>
          <button type="button" onClick={onClose}>X</button>
        </div>
      </div>

      <div className="gov-window-content">
        {getWindowContent && getWindowContent(window)}
      </div>
    </motion.div>
  );
}
