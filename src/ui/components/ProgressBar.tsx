import { Progress } from "@/components/ui/progress"
import { useContext, useState, useEffect } from "react"
import { FileContext } from "./FileContext"
import { BatchProcessingStatus } from "@/services/batch-processing/types"
import { batchProcessor } from "@/services/batch-processing/processor"

const ProgressBar = () => {
  const { selectedFiles } = useContext(FileContext)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<BatchProcessingStatus | null>(null)

  useEffect(() => {
    // Reset progress when selected files change
    setProgress(0)
    setStatus(null)
  }, [selectedFiles])

  useEffect(() => {
    const updateProgress = (status: BatchProcessingStatus) => {
      setStatus(status)
      if (status.total > 0) {
        const progressValue = ((status.completed + status.failed) / status.total) * 100
        setProgress(progressValue)
      }
    }

    // Subscribe to batch processor status updates
    const interval = setInterval(() => {
      const currentStatus = batchProcessor.getStatus()
      if (currentStatus.inProgress) {
        updateProgress(currentStatus)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!status?.inProgress && progress === 0) {
    return null
  }

  return (
    <div className="col-span-3 row-start-4 pt-1 h-max flex flex-col gap-2 justify-center items-center">
      <Progress value={progress} className="w-1/2"/>
      {status && (
        <div className="text-xs text-zinc-400">
          Processing: {status.completed + status.failed} of {status.total} files
          {status.failed > 0 && ` (${status.failed} failed)`}
        </div>
      )}
    </div>
  )
}

export default ProgressBar
