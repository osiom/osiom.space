const socket = io();
const canvas = document.getElementById("touchpad");

function getRelativePosition(e, element) {
  const rect = element.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height
  };
}

// Prevent all default touch behaviors on the canvas
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const pos = getRelativePosition(e, canvas);
  socket.emit("paint", pos);
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const pos = getRelativePosition(e, canvas);
  socket.emit("paint", pos);
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  e.stopPropagation();
}, { passive: false });

// Mouse events for desktop
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  const pos = getRelativePosition(e, canvas);
  socket.emit("paint", pos);
});

canvas.addEventListener("mousemove", (e) => {
  if (e.buttons === 1) {
    e.preventDefault();
    const pos = getRelativePosition(e, canvas);
    socket.emit("paint", pos);
  }
});

// Prevent context menu on long press
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});