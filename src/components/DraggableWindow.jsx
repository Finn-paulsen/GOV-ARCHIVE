import React from "react";
import { motion } from "framer-motion";

export default function DraggableWindow({
  window,
  onFocus,
  onMove,
  onClose,
  onMinimize,
  z
}) {
  return (
    <motion.div
      className="gov-window"
      style={{
        position: "absolute",
        top: window.pos.y,
        left: window.pos.x,
        zIndex: z,
      }}
      drag
      dragMomentum={false}
      onDragEnd={(e, info) => {
        onMove({ x: info.point.x, y: info.point.y });
      }}
      onMouseDown={onFocus}
    >
      <div className="gov-window-titlebar">
        <span className="gov-window-title">{window.title}</span>
        <div className="gov-window-buttons">
          <button onClick={onMinimize}>_</button>
          <button onClick={onClose}>X</button>
        </div>
      </div>

      <div className="gov-window-content">
        {window.content}
      </div>
    </motion.div>
  );
}
