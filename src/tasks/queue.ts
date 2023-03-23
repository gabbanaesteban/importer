import { Import } from '@prisma/client';
import Queue, { Job } from 'bull';
import { setTimeout } from 'timers/promises';
import ImporterService from '../services/ImporterService';

const options = {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
};

export const importerQueue = new Queue<Import>('importerQueue', options);

importerQueue.process(async (job: Job<Import>) => {
  // Lets wait for 3 seconds to simulate a long running job
  await setTimeout(3000);
  const importerService = new ImporterService(job.data);
  await importerService.processImport();
});

importerQueue.on('completed', (job: Job<Import>) => {
  console.log(`Job ${job.id} has been completed`);
});

importerQueue.on('failed', async (job: Job<Import>, err: Error) => {
  console.log(`Job ${job.id} has failed with error ${err}`, { import: job.data });
  await ImporterService.markImportAsFailed(job.data.id);
});