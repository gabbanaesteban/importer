import { Import } from '@prisma/client';
import container from '../IoC/inversify.config';
import Bull, { Job } from 'bull';
import { setTimeout } from 'timers/promises';
import ImporterService from '../services/ImporterService';
import { IMPORTER_QUEUE } from '../IoC/types';

const importerQueue = container.get<Bull.Queue<Import>>(IMPORTER_QUEUE)

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