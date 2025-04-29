import { useState, useEffect } from "react";

import { BatchProcessingStatus } from "@/services/batch-processing/types";
import { batchProcessor } from "@/services/batch-processing/processor";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  visible?: boolean;
}

const ProgressBar = ({ visible = false }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<BatchProcessingStatus | null>(null);
  useEffect(() => {
    // Only cleanup on unmount if a process is in progress
    return () => {
      const currentStatus = batchProcessor.getStatus();
      if (currentStatus.inProgress) {
        batchProcessor.reset();
      }
    };
  }, []);

  useEffect(() => {
    const updateProgress = (status: BatchProcessingStatus) => {
      setStatus(status);
      if (status.total > 0) {
        const progressValue =
          ((status.completed + status.failed) / status.total) * 100;
        setProgress(progressValue);
      }
    };

    const unsubscribe = batchProcessor.subscribe(updateProgress);
    const currentStatus = batchProcessor.getStatus();
    if (currentStatus.inProgress) {
      updateProgress(currentStatus);
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="col-span-3 row-start-4">
      {/* Status text above progress bar */}
      <div className="mb-2 text-xs flex justify-between items-center">
        <span className="text-zinc-700 pl-1">
          Processing: {(status?.completed ?? 0) + (status?.failed ?? 0)}/{" "}
          {status?.total} files
          {status?.completed && status.failed > 0 && ` (${status.failed} failed)`}
        </span>
        <span className="text-zinc-700 ">
          {Math.round(progress)}%
        </span>
      </div>
      {/* Progress bar container */}
      <div className="w-full h-3 rounded-md overflow-hidden bg-transparent">
        {/* Progress bar fill */}
         <Progress value={progress} className="bg-transparent"/>

      </div>
    </div>
  );
};

export default ProgressBar;
