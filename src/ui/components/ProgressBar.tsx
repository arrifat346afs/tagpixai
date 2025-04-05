import { useState, useEffect } from "react";

import { BatchProcessingStatus } from "@/services/batch-processing/types";
import { batchProcessor } from "@/services/batch-processing/processor";

interface ProgressBarProps {
  visible?: boolean;
}

const ProgressBar = ({ visible = false }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<BatchProcessingStatus | null>(null);

  useEffect(() => {
    batchProcessor.reset();
    return () => {
      batchProcessor.reset();
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
    <div className="col-span-3 row-start-4 ">
      {/* Progress bar container */}
      <div className="w-full h-4 rounded-md overflow-hidden relative">
        {/* Progress bar fill */}
        <div
          className="h-4 bg-cyan-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
        {/* Status text */}
        <div className="absolute inset-0 text-xs text-zinc-400 flex justify-between items-center p-2 select-none">
          <span>
            Processing: {(status?.completed ?? 0) + (status?.failed ?? 0)} of{" "}
            {status?.total} files
            {status?.failed &&
              status.failed > 0 &&
              ` (${status.failed} failed)`}
          </span>
          <span className="text-zinc-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
