import { useContext, useEffect, useState, useRef } from "react";
import { FileContext } from "../FileContext";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { X, ImageIcon } from "lucide-react";
import scrollIntoView from "scroll-into-view-if-needed";
import { MdOutlineImageNotSupported } from "react-icons/md";
import '../css/Thumbnal.css'
interface ThumbnailData {
  path: string;
  thumbnailUrl: string | null;
  isVideo: boolean;
  isLoading: boolean;
  loadingFailed: boolean;
  retryCount: number;
  metadataStatus?: 'complete' | 'incomplete' | undefined;
  generationFailed?: boolean; 
}

function FileDisplay() {
  const {
    selectedFiles,
    selectedFile,
    setSelectedFile,
    setSelectedFileMetadata,
    setSelectedFiles,
  } = useContext(FileContext);
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const TIMEOUT_DURATION = 10000; // 10 seconds

  const loadSingleThumbnail = async (
    file: string,
    retryCount = 0
  ): Promise<string | null> => {
    try {
      const thumbnailPromise = async () => {
        try {
          const thumbnailPath = await window.electron.generateThumbnail(file);
          if (!thumbnailPath) {
            console.error("No thumbnail path returned for:", file);
            throw new Error("Thumbnail generation failed");
          }

          const base64Data = await window.electron.readFileBase64(
            thumbnailPath
          );
          if (!base64Data) {
            throw new Error("Failed to read thumbnail file");
          }

          return base64Data;
        } catch (error) {
          console.error("Thumbnail generation/reading error:", error);
          throw error;
        }
      };

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Thumbnail generation timed out")),
          TIMEOUT_DURATION
        );
      });

      return (await Promise.race([
        thumbnailPromise(),
        timeoutPromise,
      ])) as string;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Retrying thumbnail generation for ${file}, attempt ${retryCount + 1}`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * (retryCount + 1))
        ); // Exponential backoff
        return loadSingleThumbnail(file, retryCount + 1);
      }
      console.error(
        `Failed to generate thumbnail after ${MAX_RETRIES} retries:`,
        file
      );
      throw error;
    }
  };



  useEffect(() => {
    const loadThumbnails = async () => {
      const newThumbnails = await Promise.all(selectedFiles.map(async (file) => {
        const metadata = await window.electron.getFileMetadata(file);
        const isIncomplete = metadata && (
          !metadata.title ||
          !metadata.description ||
          !metadata.keywords?.length
        );

        return {
          path: file,
          thumbnailUrl: null,
          isVideo: ["mp4", "mov", "avi", "mkv"].includes(
            file.split(".").pop()?.toLowerCase() || ""
          ),
          isLoading: true,
          loadingFailed: false,
          retryCount: 0,
          metadataStatus: metadata ? (isIncomplete ? 'incomplete' : 'complete') : undefined
        } as ThumbnailData;
      }));

      setThumbnails(newThumbnails);

      // Process thumbnails in smaller batches
      const BATCH_SIZE = 2;
      for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
        const batch = selectedFiles.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (file, batchIndex) => {
            const index = i + batchIndex;
            try {
              const thumbnailData = await loadSingleThumbnail(file);
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        thumbnailUrl: thumbnailData,
                        isLoading: false,
                        loadingFailed: false,
                      }
                    : item
                )
              );
            } catch (error) {
              console.error("Final thumbnail loading error:", file, error);
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        isLoading: false,
                        loadingFailed: true,
                      }
                    : item
                )
              );
              toast.error(`Failed to load thumbnail for ${file.split("\\").pop()}`);
            }
          })
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    loadThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles]);

  const handleFileSelect = async (file: string) => {
    setSelectedFile(file);

    // For manual selection, we'll find the element directly and scroll it into view
    // This is more reliable than using the index
    const thumbnailElements = document.querySelectorAll('.thumbnail-container');
    for (let i = 0; i < thumbnailElements.length; i++) {
      const element = thumbnailElements[i] as HTMLElement;
      if (element.getAttribute('data-path') === file) {
        // Use scroll-into-view-if-needed for manual selection
        // But only if needed (user clicked on it, so it's likely already in view)
        scrollIntoView(element, {
          scrollMode: 'if-needed',
          block: 'nearest',
          inline: 'center',
          behavior: 'smooth',
        });
        break;
      }
    }

    try {
      const metadata = await window.electron.getFileMetadata(file);
      setSelectedFileMetadata(
        metadata
          ? {
              filePath: file,
              title: metadata.title || "",
              description: metadata.description || "",
              keywords: metadata.keywords || [],
            }
          : {
              filePath: file,
              title: "",
              description: "",
              keywords: [],
            }
      );
    } catch (error) {
      console.error("Failed to load metadata:", error);
      setSelectedFileMetadata({
        filePath: file,
        title: "",
        description: "",
        keywords: [],
      });
      toast.error("Failed to load metadata");
    }
  };

  const handleRemoveFile = (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the thumbnail click

    // Remove from selected files
    const newSelectedFiles = selectedFiles.filter((file) => file !== filePath);
    setSelectedFiles(newSelectedFiles);

    // If the removed file was selected, clear the selection
    if (selectedFile === filePath) {
      setSelectedFile(null);
      setSelectedFileMetadata({
        filePath: "",
        title: "",
        description: "",
        keywords: [],
      });
    }

    toast.success("File removed");
  };

  return (
    <ScrollArea className=" p-4 flex flex-col justify-center select-none">
      <div
        ref={scrollContainerRef}
        className="flex flex-row gap-2"
      >
        {thumbnails.length > 0 ? (
          thumbnails.map((item, index) => {
            // Removed hasValidMetadata variable
            return (
              <div
                className="relative group thumbnail-container"
                key={index}
                data-path={item.path}
              >
                <div
                  onClick={() => handleFileSelect(item.path)}
                  className={cn(
                    "group relative w-[180px] h-[120px]",
                    "rounded-md overflow-hidden",
                    "border-2", // Make border slightly thicker
                    {
                      "border-blue-500": selectedFile === item.path,
                      // Removed the green border condition
                      "border-zinc-800/50": selectedFile !== item.path,
                    },
                    "hover:border-gray-200",
                    "transition-all duration-200",
                    "cursor-pointer",
                    "flex-shrink-0"
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.isLoading ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : item.loadingFailed ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <ImageIcon className="h-8 w-8 text-zinc-500" />
                        <span className="text-xs text-zinc-400 mt-2">
                          Failed to load
                        </span>
                      </div>
                    ) : (
                      <img
                        src={
                          item.thumbnailUrl ||
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23cccccc"/></svg>'
                        }
                        alt={`Thumbnail for ${item.path.split("\\").pop()}`}
                        className={cn(
                          "w-full h-full object-cover",
                          "group-hover:brightness-90 transition-all"
                        )}
                        onError={(e) => {
                          console.error("Error loading thumbnail:", e);
                          setThumbnails((prev) =>
                            prev.map((thumb, i) =>
                              i === index
                                ? { ...thumb, loadingFailed: true }
                                : thumb
                            )
                          );
                        }}
                      />
                    )}
                  </div>

                  {/* Status indicators */}
                  <div className="absolute top-1 left-1 flex gap-1 z-20">
                    {/* Incomplete metadata warning */}
                    {item.metadataStatus === 'incomplete' && (
                      <div className="bg-yellow-500/80 text-white text-xs px-2 py-1 rounded-full">
                        !
                      </div>
                    )}
                    {/* Generation failed indicator */}
                    {item.generationFailed && (
                      <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-3 h-3">⚠️</span>
                        <span>AI Failed</span>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemoveFile(item.path, e)}
                    className={cn(
                      "absolute top-1 right-1",
                      "size-6 rounded-full",
                      "bg-black/60 hover:bg-black/80",
                      "flex items-center justify-center",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200",
                      "text-white",
                      "z-10"
                    )}
                  >
                    <X className="size-4" />
                  </button>

                  {/* Filename overlay */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0",
                      "bg-gradient-to-t from-black/80 to-transparent",
                      "p-2",
                      "transition-opacity duration-200"
                    )}
                  >
                    <p className="text-xs text-white truncate">
                      {item.path.split("\\").pop()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-background/5 text-5xl text-zinc-400 flex items-center justify-center h-30 min-w-[200px] rounded-md border border-zinc-800/50">
            <MdOutlineImageNotSupported />
          </div>
        )}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export default FileDisplay;