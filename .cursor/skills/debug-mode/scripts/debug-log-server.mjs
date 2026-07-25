#!/usr/bin/env node
// Log sink for the debug-mode skill: accepts POSTed instrumentation payloads and
// appends them to an NDJSON file, mirroring Cursor's built-in Debug mode logging.
//
// Usage: node .cursor/skills/debug-mode/scripts/debug-log-server.mjs [--port N] [--log-path P] [--session-id S]

import { createServer } from 'node:http';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      args[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      args[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const sessionId = args['session-id'] ?? randomBytes(4).toString('hex');
const logPath = resolve(args['log-path'] ?? `.cursor/debug-logs/debug-${sessionId}.log`);
const port = Number(args.port ?? 0);

mkdirSync(dirname(logPath), { recursive: true });

let counter = 0;

// Instrumented pages are served from a different origin than this sink, so browser
// fetches are preflighted and need permissive CORS headers to reach us at all.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end('{"error":"use POST"}');
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      // Keep unparseable bodies rather than dropping evidence.
      payload = { message: 'unparseable payload', data: { raw } };
    }

    counter += 1;
    const entry = {
      sessionId: payload.sessionId ?? req.headers['x-debug-session-id'] ?? sessionId,
      id: `log_${Date.now()}_${counter}`,
      timestamp: payload.timestamp ?? Date.now(),
      ...payload,
    };

    appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
    res.writeHead(204, corsHeaders);
    res.end();
  });
});

server.listen(port, '127.0.0.1', () => {
  const { port: boundPort } = server.address();
  console.log(
    JSON.stringify({
      serverEndpoint: `http://127.0.0.1:${boundPort}/log`,
      logPath,
      sessionId,
    }),
  );
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
