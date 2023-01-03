import dotenv from 'dotenv';
import { login } from 'masto';
import fetch from 'node-fetch-commonjs';
import { fetchVotd } from './votd';

dotenv.config();

function statusFromToday(status: { createdAt: string }): boolean {
  // The timestamps are in ISO8601 format, so the first 10 chars contain the date
  const createdDate = status.createdAt.slice(0, 10);
  const nowDate = new Date().toISOString().slice(0, 10);
  return createdDate === nowDate;
}

async function main() {
  const masto = await login({
    url: process.env.URL ?? 'https://botsin.space',
    accessToken: process.env.TOKEN,
  });

  const acct = process.env.ACCOUNT;
  if (!acct) throw new Error('Missing account name');
  const account = await masto.v1.accounts.lookup({ acct });

  const existingStatuses = await masto.v1.accounts.listStatuses(account.id, {
    tagged: 'verseoftheday',
    limit: 1,
  });
  if (!existingStatuses.find(statusFromToday)) {
    console.log('No existing status from today found');

    const votd = await fetchVotd();

    console.log('Posting status...');

    const imageDownload = await fetch(votd.imageUrl);
    const attachment = await masto.v2.mediaAttachments.create({
      file: await imageDownload.blob(),
    });

    await masto.v1.statuses.create({
      mediaIds: [attachment.id],
      // TODO: status text and tags
    });

    console.log('Success!');
  } else {
    console.log('Found an existing status from today. Doing nothing');
  }
}

main();
