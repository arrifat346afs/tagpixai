import { useState, useEffect, useRef } from "react";

import { BatchProcessingStatus } from "@/services/batch-processing/types";
import { batchProcessor } from "@/services/batch-processing/processor";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  visible?: boolean;
}

const ProgressBar = ({ visible = false }: ProgressBarProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<BatchProcessingStatus | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedData, setCompletedData] = useState<{
    completed: number;
    failed: number;
    total: number;
  } | null>(null);

  const hasStartedProcessing = useRef(false);

  useEffect(() => {
    // Reset when app is closed/unmounted only if process is actively running
    const handleBeforeUnload = () => {
      const currentStatus = batchProcessor.getStatus();
      if (currentStatus.inProgress) {
        batchProcessor.reset();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Only reset on component unmount if process is still in progress
      const currentStatus = batchProcessor.getStatus();
      if (currentStatus.inProgress) {
        batchProcessor.reset();
      }
    };
  }, []);

  useEffect(() => {
    const updateProgress = (newStatus: BatchProcessingStatus) => {
      // Detect if processing has started
      if (
        newStatus.inProgress ||
        (newStatus.total > 0 &&
          (newStatus.completed > 0 || newStatus.failed > 0))
      ) {
        hasStartedProcessing.current = true;
      }

      // If we're processing or have active status, update normally
      if (
        newStatus.inProgress ||
        (newStatus.total > 0 &&
          newStatus.completed + newStatus.failed < newStatus.total)
      ) {
        setStatus(newStatus);
        setIsCompleted(false);

        if (newStatus.total > 0) {
          const progressValue =
            ((newStatus.completed + newStatus.failed) / newStatus.total) * 100;
          setProgress(progressValue);
        }
      }
      // Detect completion: we were processing, now all files are done
      else if (
        hasStartedProcessing.current &&
        newStatus.total > 0 &&
        newStatus.completed + newStatus.failed === newStatus.total
      ) {
        // Process just completed
        setCompletedData({
          completed: newStatus.completed,
          failed: newStatus.failed,
          total: newStatus.total,
        });
        setIsCompleted(true);
        setProgress(100);
        setStatus(newStatus);
      }
      // If status gets reset (0 files) but we had completed a process, maintain completion state
      else if (
        hasStartedProcessing.current &&
        isCompleted &&
        completedData &&
        (newStatus.total === 0 ||
          (newStatus.completed === 0 && newStatus.failed === 0))
      ) {
        // Keep showing completed state, ignore the reset
        return;
      }
      // New process starting - clear completion state
      else if (
        newStatus.inProgress &&
        (newStatus.total > 0 || newStatus.completed > 0 || newStatus.failed > 0)
      ) {
        setIsCompleted(false);
        setCompletedData(null);
        hasStartedProcessing.current = true;
        setStatus(newStatus);

        if (newStatus.total > 0) {
          const progressValue =
            ((newStatus.completed + newStatus.failed) / newStatus.total) * 100;
          setProgress(progressValue);
        } else {
          setProgress(0);
        }
      }
    };

    const unsubscribe = batchProcessor.subscribe(updateProgress);
    const currentStatus = batchProcessor.getStatus();

    // Initialize with current status
    updateProgress(currentStatus);

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isCompleted, completedData]);

  if (!visible) return null;

  // Use completed data if available, otherwise use current status
  const displayData =
    isCompleted && completedData
      ? completedData
      : {
          completed: status?.completed ?? 0,
          failed: status?.failed ?? 0,
          total: status?.total ?? 0,
        };

  return (
    <div className="col-span-3 row-start-4 pt-1 select-none">
      {/* Status text above progress bar */}
      <div className="flex justify-center items-center">
        {" "}
        <span className="text-xs flex pb-2">
          <span className="text-zinc-600 pl-2">
            {isCompleted ? "Completed" : "Processing"}:{" "}
            {displayData.completed + displayData.failed}/{displayData.total}{" "}
            files
            {displayData.failed > 0 && ` (${displayData.failed} failed)`}
            {isCompleted && displayData.failed === 0 && " ✓"}
          </span>
          <span className="text-zinc-600 pl-2">{Math.round(progress)}%</span>
        </span>
      </div>

      {/* Progress bar container */}
      <div className="w-full h-3 rounded-md overflow-hidden">
        {/* Progress bar fill */}
        <Progress value={progress} />
      </div>
    </div>
  );
};

export default ProgressBar;
