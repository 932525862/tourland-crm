import server from '../dist/server/server.js';

// Removed runtime: 'edge' so that Vercel uses standard Node.js
// This fixes the crash where Tanstack imports "node:async_hooks" which Edge rejects.

export default async function (request, context) {
  return server.fetch(request, context);
}
