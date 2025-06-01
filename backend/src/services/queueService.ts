import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { pdfService } from './pdfService'; // Updated import
import { generatePolicyDocx } from './docxService';
import fs from 'fs/promises'; // For saving to a temporary location or a shared volume
import path from 'path';

// Define the structure of the job data
interface DocumentJobData {
  type: 'pdf' | 'docx';
  policyData: {
    title: string;
    sections: Array<{ title: string; content: string }>;
  };
  jobId: string; // To identify the job and potentially the output file
}

// Define the structure of the job result (optional, for tracking)
interface DocumentJobResult {
  filePath?: string;
  error?: string;
  message: string;
}

const queueName = 'documentGenerationQueue';

// Initialize Redis connection (ensure REDIS_HOST and REDIS_PORT are in .env)
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null, // Important for BullMQ
});

// Create a new queue
export const documentQueue = new Queue<DocumentJobData, DocumentJobResult>(queueName, {
  connection,
  defaultJobOptions: {
    attempts: 3, // Number of attempts before failing
    backoff: {
      type: 'exponential',
      delay: 5000, // 5 seconds delay for the first retry
    },
  },
});

// Define the output directory for generated documents
// In a real application, this might be a cloud storage bucket or a shared volume.
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'generated_documents');

// Ensure output directory exists
const ensureOutputDir = async () => {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Output directory ensured: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error(`Error creating output directory ${OUTPUT_DIR}:`, error);
    // Depending on the setup, this might be a critical error
  }
};
ensureOutputDir();


// Create a worker to process jobs from the queue
export const documentWorker = new Worker<DocumentJobData, DocumentJobResult>(
  queueName,
  async (job: Job<DocumentJobData, DocumentJobResult>) => {
    const { type, policyData, jobId } = job.data;
    console.log(`Processing job ${job.id} (custom ID: ${jobId}) for ${type} document: ${policyData.title}`);

    try {
      let buffer: Buffer | void;
      const timestamp = Date.now();
      const safeTitle = policyData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${safeTitle}_${jobId}_${timestamp}.${type}`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      if (type === 'pdf') {
        buffer = await pdfService.generatePdfFromPolicyData(policyData); // Updated call
      } else if (type === 'docx') {
        buffer = await generatePolicyDocx(policyData);
      } else {
        throw new Error(`Unsupported document type: ${type}`);
      }

      if (buffer instanceof Buffer) {
        await fs.writeFile(filePath, buffer);
        console.log(`Document ${fileName} saved to ${filePath}`);
        // Here you might update a database with the job status and file path,
        // or send a notification (e.g., via WebSocket, email).
        return { filePath, message: `${type.toUpperCase()} document generated successfully.` };
      } else {
        // This case should not be reached if services always return a buffer when no outputPath is given
        throw new Error('Document generation service did not return a buffer.');
      }
    } catch (error) {
      console.error(`Job ${job.id} (custom ID: ${jobId}) failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during document generation.';
      // Optionally, update job data with error information if BullMQ supports it directly,
      // or log it externally linked to the job ID.
      // Worker should throw an error to mark the job as failed for BullMQ to handle retries/failure.
      throw new Error(errorMessage); // This will mark the job as failed
    }
  },
  { connection }
);

documentWorker.on('completed', (job: Job<DocumentJobData, DocumentJobResult>, result: DocumentJobResult) => {
  console.log(`Job ${job.id} (custom ID: ${job.data.jobId}) completed. Result: ${result.message}, Path: ${result.filePath}`);
  // Add logic here for post-completion tasks, e.g., notifying user, cleaning up.
});

documentWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} (custom ID: ${job.data.jobId}) failed after ${job.attemptsMade} attempts with error: ${err.message}`);
  } else {
    console.error(`A job failed with error: ${err.message}`);
  }
  // Add logic here for handling failed jobs, e.g., sending alerts.
});

console.log('Document generation worker started.');

// Function to add a document generation job to the queue
export const addDocumentJob = async (type: 'pdf' | 'docx', policyData: DocumentJobData['policyData']): Promise<Job<DocumentJobData, DocumentJobResult>> => {
  const jobId = `${type}-${policyData.title.replace(/\s+/g, '_')}-${Date.now()}`; // Simple unique ID
  const job = await documentQueue.add('generateDocument', { type, policyData, jobId });
  console.log(`Added job ${job.id} (custom ID: ${jobId}) to the ${type} document generation queue.`);
  return job;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down document queue and worker...');
  await documentWorker.close();
  await documentQueue.close();
  await connection.quit();
  console.log('Document queue and worker shut down.');
  process.exit(0);
});