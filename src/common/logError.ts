import fs from 'fs';

export default function logError(message: unknown) {
  const logStream = fs.createWriteStream('./logs/logs.txt', { flags: 'a' });
  logStream.write(`${new Date().toLocaleString()}\n${message}\n\n`);
  logStream.end();
}
