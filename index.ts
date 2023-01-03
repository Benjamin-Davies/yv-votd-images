import fetch from 'node-fetch';
import { readFile } from 'fs/promises';

const PAGE_URL = 'https://www.bible.com/verse-of-the-day';

interface VotdInfo {
  imageUrl: string;
  verseContent: string;
  verseReference: string;
}

async function fetchPage(): Promise<string> {
  // TODO: remove when finished testing
  return await readFile('example-response.html', 'utf-8');

  const res = await fetch(PAGE_URL);
  const text = await res.text();
  return text;
}

function extractInfo(contents: string): VotdInfo {
  const imageUrl = contents.match(
    /https:\/\/s3\.amazonaws\.com\/static-youversionapi-com\/.*?\.jpg/
  )?.[0];
  if (!imageUrl) throw new Error('Unable to extract image url');

  const verseWrapper = contents.match(
    /<div class=\"verse-wrapper.*?\".*?>(.*?)<\/div>/s
  )?.[1];
  if (!verseWrapper) throw new Error('Unable to extract verse');

  const [verseContent, verseReference] = [
    ...verseWrapper.matchAll(/<p.*?>(.*?)<\/p>/gs),
  ].map((match) => match?.[1]);
  if (!verseContent) throw new Error('Unable to extract verse content');
  if (!verseReference) throw new Error('Unable to extract verse reference');

  return { imageUrl, verseContent, verseReference };
}

async function main() {
  console.log('Fetching page...');
  const contents = await fetchPage();
  console.log('Extracting info...');
  const info = extractInfo(contents);
  console.log(info);
}

main();
