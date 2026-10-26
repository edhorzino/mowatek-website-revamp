import {readFileSync,writeFileSync} from 'node:fs';
import {vercelConfiguration} from '../src/hosting.mjs';
const root = new URL('../', import.meta.url);
const config = JSON.parse(readFileSync(new URL('site.config.json', root), 'utf8'));
writeFileSync(new URL('vercel.json', root), JSON.stringify(vercelConfiguration(config), null, 2) + '\n');
console.log('Updated Vercel configuration.');
