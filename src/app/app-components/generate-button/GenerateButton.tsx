import { Button } from "@/components/ui/button";
import { useContext, useState, useEffect } from "react";
import { FileContext } from "../FileContext";
import { toast } from "sonner";
import { batchProcessor } from "@/services/batch-processing/processor";
import {
  BatchProcessingStatus,
  ProcessingResult,
  ProcessingSettings,
} from "@/services/batch-processing/types";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import scrollIntoView from "scroll-into-view-if-needed";



const GenerateButton = () => {
  const { selectedFiles, setSelectedFile, setSelectedFileMetadata } =
    useContext(FileContext);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add useEffect to reset processor state when component mounts
  useEffect(() => {
    batchProcessor.reset();
  }, []);

  const updateStatus = (message: string) => {
    console.log("Status:", message);
    // toast.info(message, { duration: 2000 })
  };

  const handleProgress = (status: BatchProcessingStatus) => {
    batchProcessor.updateStatus(status);
    updateStatus(`Processing: ${status.completed}/${status.total} files`);
  };

  const handleFileComplete = async (result: ProcessingResult) => {
    const fileName = result.filePath.split("\\").pop();
    if (result.success && result.metadata) {
      try {
        // Check if any metadata field is missing or empty
        const isIncomplete =
          !result.metadata.title ||
          !result.metadata.description ||
          !result.metadata.keywords?.length;

        const metadata = {
          title: result.metadata.title || "",
          description: result.metadata.description || "",
          keywords: result.metadata.keywords || [],
          status: isIncomplete ? "incomplete" : "complete",
          generationFailed: false, // Add this field
        };

        // Save the metadata with status
        await window.electron.saveFileMetadata(result.filePath, metadata);

        // Embed metadata in the file
      const embedResult = await window.electron.embedMetadata(result.filePath, {
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.keywords,
      }) as { success: boolean; error?: string };

      if (!embedResult.success) {
        console.error(`Failed to embed metadata: ${embedResult.error}`);
        toast.error(`Failed to embed metadata in ${fileName}`);
      }

        setTimeout(() => {
          scrollThumbnailIntoView(result.filePath);
        }, 300);
        // Use a longer delay to ensure the UI has time to update before selecting the file
        // This helps with scrolling the selected file into view
        setTimeout(() => {
          console.log(
            `Setting selected file to ${result.filePath} (AI selection)`
          );

          setSelectedFile(result.filePath);
          setSelectedFileMetadata({
            filePath: result.filePath,
            ...metadata,
          });
        }, 300);

        if (isIncomplete) {
          updateStatus(
            `Partially processed ${fileName} - some fields are missing`
          );
        } else {
          updateStatus(`Successfully processed ${fileName}`);
        }
      } catch (error) {
        console.error("Failed to save metadata:", error);
        updateStatus(`Failed to save metadata for ${fileName}`);
      }
    } else {
      // Mark the file as failed generation
      try {
        const metadata = {
          title: "",
          description: "",
          keywords: [],
          status: "incomplete",
          generationFailed: true, // Mark as failed
        };

        await window.electron.saveFileMetadata(result.filePath, metadata);
          setTimeout(() => {
            scrollThumbnailIntoView(result.filePath);
          }, 300);
        // Update UI to reflect the failure
        // Use a longer delay to ensure the UI has time to update
        setTimeout(() => {
          console.log(
            `Setting selected file (failed) to ${result.filePath} (AI selection)`
          );

          setSelectedFile(result.filePath);
          setSelectedFileMetadata({
            filePath: result.filePath,
            ...metadata,
          });

          // Find and scroll to the thumbnail after a delay to ensure the UI has updated

        }, 300);
      } catch (error) {
        console.error("Failed to save failed status:", error);
      }

      updateStatus(`Failed to process ${fileName}: ${result.error}`);
      toast.error(`AI generation failed for ${fileName}`, {

      });
    }
  };

  // Helper function to scroll a thumbnail into view when selected by AI
  const scrollThumbnailIntoView = (filePath: string) => {
    // Find all thumbnail elements
    const thumbnailContainers = document.querySelectorAll(
      ".thumbnail-container"
    );

    // Find the one that matches our file path
    for (let i = 0; i < thumbnailContainers.length; i++) {
      const container = thumbnailContainers[i] as HTMLElement;
      const dataPath = container.getAttribute("data-path");

      if (dataPath === filePath) {
        console.log(`Found thumbnail for ${filePath}, scrolling into view`);

        // Use scroll-into-view-if-needed for reliable scrolling
        scrollIntoView(container, {
          scrollMode: "always", // Always scroll for AI selections
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        });

        // Add a second attempt with a delay
        setTimeout(() => {
          scrollIntoView(container, {
            scrollMode: "always",
            block: "nearest",
            inline: "center",
            behavior: "smooth",
          });
        }, 500);

        return;
      }
    }

    console.log(`Could not find thumbnail element for ${filePath}`);
  };

  const handleGenerate = async () => {
    if (!selectedFiles.length) {
      toast.error("No files selected");
      return;
    }

    try {
      setIsProcessing(true);
      batchProcessor.reset(); // Reset before starting new process
      batchProcessor.updateStatus({
        inProgress: true,
        total: selectedFiles.length,
        completed: 0,
        failed: 0,
      });
      updateStatus("Starting process...");

      updateStatus("Fetching API settings...");
      const apiSettings = await window.electron.getSettings("api");
      console.log("API Settings:", apiSettings);

      updateStatus("Fetching metadata settings...");
      const metadataSettings = await window.electron.getSettings("metadata");
      console.log("Metadata Settings:", metadataSettings);

      if (
        !apiSettings?.apiKey ||
        !apiSettings?.provider ||
        !apiSettings?.model
      ) {
        toast.error("Please configure API settings first");
        return;
      }

      if (!metadataSettings) {
        toast.error("Please configure metadata settings first");
        return;
      }

      const settings: ProcessingSettings = {
        api: apiSettings,
        metadata: metadataSettings,
      };

      updateStatus("Starting batch processing...");
      await batchProcessor.process(
        selectedFiles,
        settings,
        handleProgress,
        handleFileComplete
      );

      updateStatus("Processing completed");
      toast.success("Processing completed");


    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      updateStatus(`Error: ${errorMessage}`);
      toast.error(`Failed to start generation process: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      batchProcessor.reset(); // Reset after completion or error
      batchProcessor.updateStatus({
        inProgress: false,
        total: 0,
        completed: 0,
        failed: 0,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        className="bg-transparent text-white hover:bg-accent"
        onClick={handleGenerate}
        disabled={isProcessing || !selectedFiles.length}
      >
        {isProcessing ? <TextShimmer>Generating...</TextShimmer> : "Generate"}
      </Button>
    </div>
  );
};

export default GenerateButton;
