/** Emits an event when the custom Node server is running. On serverless hosts
 * that cannot keep a WebSocket connection alive, this safely becomes a no-op. */
export function emitToUser(userId: string, event: string, payload: unknown) {
  const io = (globalThis as any).__leonardxIo;
  if (io) io.to(`user:${userId}`).emit(event, payload);
}
