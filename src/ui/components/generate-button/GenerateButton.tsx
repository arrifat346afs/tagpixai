import { Button } from '@/components/ui/button'
import { useContext, useState, useEffect } from 'react'
import { FileContext } from '../FileContext'
import { toast } from 'sonner'
import { batchProcessor } from '@/services/batch-processing/processor'
import { BatchProcessingStatus, ProcessingResult, ProcessingSettings } from '@/services/batch-processing/types'

const GenerateButton = () => {
  const { selectedFiles } = useContext(FileContext)
  const [isProcessing, setIsProcessing] = useState(false)

  // Add useEffect to reset processor state when component mounts
  useEffect(() => {
    batchProcessor.reset()
  }, [])

  const updateStatus = (message: string) => {
    
    console.log('Status:', message)
    toast.info(message, { duration: 2000 })
  }

  const handleProgress = (status: BatchProcessingStatus) => {
    batchProcessor.updateStatus(status)
    updateStatus(`Processing: ${status.completed}/${status.total} files`)
  }

  const handleFileComplete = async (result: ProcessingResult) => {
    const fileName = result.filePath.split('\\').pop()
    if (result.success && result.metadata) {
      // Save the metadata immediately after processing
      try {
        await window.electron.saveFileMetadata(result.filePath, {
          title: result.metadata.title || '',
          description: result.metadata.description || '',
          keywords: result.metadata.keywords || []
        });
        updateStatus(`Successfully processed ${fileName}`)
      } catch (error) {
        console.error('Failed to save metadata:', error);
        updateStatus(`Failed to save metadata for ${fileName}`)
      }
    } else {
      updateStatus(`Failed to process ${fileName}: ${result.error}`)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFiles.length) {
      toast.error('No files selected')
      return
    }

    try {
      setIsProcessing(true)
      batchProcessor.reset() // Reset before starting new process
      batchProcessor.updateStatus({
        inProgress: true,
        total: selectedFiles.length,
        completed: 0,
        failed: 0
      })
      updateStatus('Starting process...')
      
      updateStatus('Fetching API settings...')
      const apiSettings = await window.electron.getSettings('api')
      console.log('API Settings:', apiSettings)
      
      updateStatus('Fetching metadata settings...')
      const metadataSettings = await window.electron.getSettings('metadata')
      console.log('Metadata Settings:', metadataSettings)
      
      if (!apiSettings?.apiKey || !apiSettings?.provider || !apiSettings?.model) {
        toast.error('Please configure API settings first')
        return
      }

      if (!metadataSettings) {
        toast.error('Please configure metadata settings first')
        return
      }

      const settings: ProcessingSettings = {
        api: apiSettings,
        metadata: metadataSettings
      }

      updateStatus('Starting batch processing...')
      await batchProcessor.process(
        selectedFiles,
        settings,
        handleProgress,
        handleFileComplete
      )

      updateStatus('Processing completed')
      toast.success('Processing completed')
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      updateStatus(`Error: ${errorMessage}`)
      toast.error(`Failed to start generation process: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
      batchProcessor.reset() // Reset after completion or error
      batchProcessor.updateStatus({
        inProgress: false,
        total: 0,
        completed: 0,
        failed: 0
      })
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        onClick={handleGenerate} 
        disabled={isProcessing || !selectedFiles.length}
      >
        {isProcessing ? 'Processing...' : 'Generate'}
      </Button>
    </div>
  )
}

export default GenerateButton
