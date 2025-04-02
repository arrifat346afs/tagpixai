import { ProcessingResult, BatchProcessingStatus, ProcessingSettings, AIRequestPayload } from './types';
import { analyzeImage } from '@/api/ai-api';
import fs from 'fs/promises';

class BatchProcessor {
  private status: BatchProcessingStatus = {
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false
  };

  private async convertToBase64(filePath: string): Promise<string> {
    try {
      console.log('Resizing image for AI processing...');
      const base64Data = await window.electron.resizeImageForAI(filePath) as string;
      
      if (!base64Data) {
        throw new Error('Failed to resize and convert image');
      }
      
      // Size check is still good to have as a safeguard
      const fileSizeInMB = (base64Data.length * 3/4) / (1024 * 1024);
      if (fileSizeInMB > 10) {
        throw new Error(`Resized image is still too large (${fileSizeInMB.toFixed(2)}MB). Please try a smaller image.`);
      }
      
      return base64Data;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processFile(
    filePath: string, 
    settings: ProcessingSettings
  ): Promise<ProcessingResult> {
    try {
      console.log(`Starting to process file: ${filePath}`);
      
      console.log('Converting file to base64...');
      const base64Data = await this.convertToBase64(filePath);
      console.log('Base64 conversion complete');
      
      if (!base64Data) {
        throw new Error('Failed to convert file to base64');
      }
      
      console.log('Calling AI API...');
      const aiResult = await analyzeImage(base64Data, settings);
      console.log('AI API response received:', aiResult);
      
      if (!aiResult) {
        throw new Error('No response from AI API');
      }
      
      return {
        filePath,
        success: true,
        metadata: {
          title: aiResult.title,
          description: aiResult.description,
          keywords: aiResult.keywords
        }
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        filePath,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async process(
    files: string[], 
    settings: ProcessingSettings,
    onProgress?: (status: BatchProcessingStatus) => void,
    onFileComplete?: (result: ProcessingResult) => void
  ): Promise<ProcessingResult[]> {
    console.log('Starting batch process with files:', files)
    console.log('Using settings:', settings)

    if (this.status.inProgress) {
      throw new Error('Batch processing already in progress')
    }

    this.status = {
      total: files.length,
      completed: 0,
      failed: 0,
      inProgress: true
    }

    onProgress?.(this.status)
    const results: ProcessingResult[] = []

    for (const file of files) {
      console.log(`Processing file ${files.indexOf(file) + 1}/${files.length}: ${file}`)
      const result = await this.processFile(file, settings)
      
      if (result.success) {
        this.status.completed++
        console.log(`Successfully processed file: ${file}`)
      } else {
        this.status.failed++
        console.log(`Failed to process file: ${file}`, result.error)
      }

      results.push(result)
      onFileComplete?.(result)
      onProgress?.(this.status)

      if (settings.api.requestInterval > 0 && files.indexOf(file) < files.length - 1) {
        console.log(`Waiting ${settings.api.requestInterval} seconds before next file...`)
        await new Promise(resolve => 
          setTimeout(resolve, settings.api.requestInterval * 1000)
        )
      }
    }

    this.status.inProgress = false
    onProgress?.(this.status)
    console.log('Batch processing completed')

    return results
  }

  getStatus(): BatchProcessingStatus {
    return { ...this.status };
  }
}

export const batchProcessor = new BatchProcessor();



















