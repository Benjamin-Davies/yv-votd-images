import fetch from 'node-fetch';
import { readFile } from 'fs/promises';

const PAGE_URL = 'https://www.bible.com/verse-of-the-day';

async function fetchPage(): Promise<string> {
  // TODO: remove when finished testing
  return await readFile('example-response.html', 'utf-8');

  const res = await fetch(PAGE_URL);
  const text = await res.text();
  return text;
}

fetchPage();
