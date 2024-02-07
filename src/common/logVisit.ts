import fs from 'fs';

export default function logVisit(origin: string | undefined) {
  const logStream = fs.createWriteStream('./logs/visits.txt', { flags: 'a' });
  logStream.write(`${new Date().toLocaleString()}, ${origin} \n`);
  logStream.end();
}
