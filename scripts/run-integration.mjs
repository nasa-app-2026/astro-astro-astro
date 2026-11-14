import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const server = await createServer({
  configFile: 'vite/config.dev.mjs',
  server: { host: '127.0.0.1', port: 8080, strictPort: true },
});

try {
  await server.listen();
  const cli = join(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'test', '--project=chromium'], { stdio: 'inherit', windowsHide: true });
    child.once('error', reject);
    child.once('close', resolve);
  });
  if (code !== 0) process.exitCode = code || 1;
} finally {
  await server.close();
}
