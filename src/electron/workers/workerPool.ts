import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkerTask {
  operation: string;
  filePath: string;
  options?: any;
}

interface WorkerResult {
  success: boolean;
  result?: any;
  error?: string;
}

class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Array<{
    task: WorkerTask;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private maxWorkers: number;

  constructor(maxWorkers: number = 2) {
    this.maxWorkers = Math.min(maxWorkers, 4); // Limit to 4 workers max
  }

  private createWorker(): Worker {
    const workerPath = path.join(__dirname, 'imageWorker.js'); // Will be compiled to .js
    const worker = new Worker(workerPath);
    
    worker.on('error', (error) => {
      console.error('Worker error:', error);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      // Remove from workers array
      this.workers = this.workers.filter(w => w !== worker);
      this.availableWorkers = this.availableWorkers.filter(w => w !== worker);
    });

    return worker;
  }

  private getAvailableWorker(): Worker | null {
    if (this.availableWorkers.length > 0) {
      return this.availableWorkers.pop()!;
    }
    
    if (this.workers.length < this.maxWorkers) {
      const worker = this.createWorker();
      this.workers.push(worker);
      return worker;
    }
    
    return null;
  }

  private processNextTask(): void {
    if (this.taskQueue.length === 0) return;
    
    const worker = this.getAvailableWorker();
    if (!worker) return;
    
    const { task, resolve, reject } = this.taskQueue.shift()!;
    
    const timeout = setTimeout(() => {
      reject(new Error('Worker task timeout'));
    }, 30000); // 30 second timeout
    
    const messageHandler = (result: WorkerResult) => {
      clearTimeout(timeout);
      worker.off('message', messageHandler);
      this.availableWorkers.push(worker);
      
      if (result.success) {
        resolve(result.result);
      } else {
        reject(new Error(result.error || 'Worker task failed'));
      }
      
      // Process next task
      this.processNextTask();
    };
    
    worker.on('message', messageHandler);
    worker.postMessage(task);
  }

  async executeTask(task: WorkerTask): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processNextTask();
    });
  }

  async terminate(): Promise<void> {
    const terminationPromises = this.workers.map(worker => worker.terminate());
    await Promise.all(terminationPromises);
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }
}

// Export singleton instance
export const imageWorkerPool = new WorkerPool(2);

// Cleanup on process exit
process.on('exit', () => {
  imageWorkerPool.terminate();
});

process.on('SIGINT', () => {
  imageWorkerPool.terminate().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  imageWorkerPool.terminate().then(() => process.exit(0));
});
