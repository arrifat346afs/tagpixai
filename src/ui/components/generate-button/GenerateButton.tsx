import { Button } from '@/components/ui/button'
import { useContext, useState } from 'react'
import { FileContext } from '../FileContext'
import { toast } from 'sonner'
import { batchProcessor } from '@/services/batch-processing/processor'
import { BatchProcessingStatus, ProcessingResult, ProcessingSettings } from '@/services/batch-processing/types'

const GenerateButton = () => {
  const { selectedFiles } = useContext(FileContext)
  const [isProcessing, setIsProcessing] = useState(false)


  const updateStatus = (message: string) => {
    
    console.log('Status:', message)
    toast.info(message, { duration: 2000 })
  }

  const handleProgress = (status: BatchProcessingStatus) => {
    updateStatus(`Processing: ${status.completed}/${status.total} files`)
  }

  const handleFileComplete = (result: ProcessingResult) => {
    const fileName = result.filePath.split('\\').pop()
    if (result.success && result.metadata) {
      updateStatus(`Successfully processed ${fileName}`)
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
