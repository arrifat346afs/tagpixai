"use client"

import type React from "react"

import { useContext, useEffect, useState, useRef } from "react"
import { FileContext } from "../context/FileContext"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { X, ImageIcon } from "lucide-react"
import scrollIntoView from "scroll-into-view-if-needed"
import { MdOutlineImageNotSupported } from "react-icons/md"
import { batchProcessor } from "@/services/batch-processing/processor"
// import { batchProcessor } from "./processor" // Add this import
// import "../css/index.css"


interface ThumbnailData {
  path: string
  thumbnailUrl: string | null
  isVideo: boolean
  isLoading: boolean
  loadingFailed: boolean
  retryCount: number
  metadataStatus?: "complete" | "incomplete" | "failed" | "pending" | undefined
  generationFailed?: boolean
  metadataAttempted?: boolean // Track if metadata generation was attempted
}

function FileDisplay() {
  const { selectedFiles, selectedFile, setSelectedFile, setSelectedFileMetadata, setSelectedFiles } =
    useContext(FileContext)
  const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [activeThumbnailRequests, setActiveThumbnailRequests] = useState(0)

  const MAX_RETRIES = 3
  const RETRY_DELAY = 2000 // 2 seconds
  const TIMEOUT_DURATION = 15000 // 15 seconds (increased for worker processing)
  const MAX_CONCURRENT_THUMBNAILS = 3 // Limit concurrent thumbnail generation

  const loadSingleThumbnail = async (file: string, retryCount = 0): Promise<string | null> => {
    try {
      // Wait if too many concurrent requests
      while (activeThumbnailRequests >= MAX_CONCURRENT_THUMBNAILS) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setActiveThumbnailRequests(prev => prev + 1);

      const thumbnailPromise = async () => {
        try {
          const thumbnailPath = await window.electron.generateThumbnail(file)
          if (!thumbnailPath) {
            console.error("No thumbnail path returned for:", file)
            throw new Error("Thumbnail generation failed")
          }

          const base64Data = await window.electron.readFileBase64(thumbnailPath)
          if (!base64Data) {
            throw new Error("Failed to read thumbnail file")
          }

          return base64Data
        } catch (error) {
          console.error("Thumbnail generation/reading error:", error)
          throw error
        } finally {
          setActiveThumbnailRequests(prev => prev - 1);
        }
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          setActiveThumbnailRequests(prev => prev - 1);
          reject(new Error("Thumbnail generation timed out"));
        }, TIMEOUT_DURATION)
      })

      return (await Promise.race([thumbnailPromise(), timeoutPromise])) as string
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying thumbnail generation for ${file}, attempt ${retryCount + 1}`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1))) // Exponential backoff
        return loadSingleThumbnail(file, retryCount + 1)
      }
      console.error(`Failed to generate thumbnail after ${MAX_RETRIES} retries:`, file)
      throw error
    }
  }

  const checkMetadataStatus = async (file: string): Promise<"complete" | "incomplete" | "pending"> => {
    try {
      const metadata = await window.electron.getFileMetadata(file)
      
      if (!metadata) {
        return "pending" // No metadata yet, but not necessarily failed
      }

      // Check if metadata is complete
      const isIncomplete = !metadata.title || !metadata.description || !metadata.keywords?.length
      return isIncomplete ? "incomplete" : "complete"
    } catch (error) {
      console.error("Failed to check metadata status:", error)
      return "pending" // Default to pending on error
    }
  }

  // Add method to update thumbnail status when processing completes
  const updateThumbnailStatus = (filePath: string, success: boolean) => {
    setThumbnails((prev) =>
      prev.map((item) =>
        item.path === filePath
          ? {
              ...item,
              metadataStatus: success ? "complete" : "failed",
              generationFailed: !success,
              metadataAttempted: true, // Mark that generation was attempted
            }
          : item
      )
    )
  }

  // Add method to retry metadata generation for a specific file
  const retryMetadataGeneration = async (filePath: string) => {
    // Set loading state
    setThumbnails((prev) =>
      prev.map((item) =>
        item.path === filePath
          ? {
              ...item,
              metadataStatus: "pending",
              generationFailed: false,
              metadataAttempted: false,
            }
          : item
      )
    )

    // Re-check metadata status
    try {
      const metadataStatus = await checkMetadataStatus(filePath)
      setThumbnails((prev) =>
        prev.map((item) =>
          item.path === filePath
            ? {
                ...item,
                metadataStatus,
                generationFailed: false,
                metadataAttempted: metadataStatus !== "pending",
              }
            : item
        )
      )
    } catch (error) {
      console.error("Failed to retry metadata check:", error)
      setThumbnails((prev) =>
        prev.map((item) =>
          item.path === filePath
            ? {
                ...item,
                metadataStatus: "pending",
                generationFailed: false,
                metadataAttempted: false,
              }
            : item
        )
      )
    }
  }

  useEffect(() => {
    // Subscribe to batch processor file completion events
    const unsubscribe = batchProcessor.subscribeToFileComplete((result) => {
      updateThumbnailStatus(result.filePath, result.success)
      
      // Also update the metadata status based on the result
      if (result.success && result.metadata) {
        const isIncomplete = !result.metadata.title || !result.metadata.description || !result.metadata.keywords?.length
        setThumbnails((prev) =>
          prev.map((item) =>
            item.path === result.filePath
              ? {
                  ...item,
                  metadataStatus: isIncomplete ? "incomplete" : "complete",
                  generationFailed: false,
                  metadataAttempted: true,
                }
              : item
          )
        )
      } else {
        // Mark as failed and attempted
        setThumbnails((prev) =>
          prev.map((item) =>
            item.path === result.filePath
              ? {
                  ...item,
                  metadataStatus: "failed",
                  generationFailed: true,
                  metadataAttempted: true,
                }
              : item
          )
        )
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const loadThumbnails = async () => {
      // Initialize thumbnails with loading state
      const newThumbnails = selectedFiles.map((file) => ({
        path: file,
        thumbnailUrl: null,
        isVideo: ["mp4", "mov", "avi", "mkv"].includes(file.split(".").pop()?.toLowerCase() || ""),
        isLoading: true,
        loadingFailed: false,
        retryCount: 0,
        metadataStatus: undefined,
        generationFailed: false,
        metadataAttempted: false, // Initially no metadata generation attempted
      } as ThumbnailData))

      setThumbnails(newThumbnails)

      // Process thumbnails and metadata in smaller batches with delays
      const BATCH_SIZE = 2
      for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
        const batch = selectedFiles.slice(i, i + BATCH_SIZE)

        // Add a small delay between batches to allow UI updates
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await Promise.all(
          batch.map(async (file, batchIndex) => {
            const index = i + batchIndex
            
            // Load thumbnail
            try {
              const thumbnailData = await loadSingleThumbnail(file)
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        thumbnailUrl: thumbnailData,
                        isLoading: false,
                        loadingFailed: false,
                      }
                    : item,
                ),
              )
            } catch (error) {
              console.error("Final thumbnail loading error:", file, error)
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        isLoading: false,
                        loadingFailed: true,
                      }
                    : item,
                ),
              )
              toast.error(`Failed to load thumbnail for ${file.split("\\").pop()}`)
            }

            // Check metadata status
            try {
              const metadataStatus = await checkMetadataStatus(file)
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        metadataStatus,
                        generationFailed: false, // Don't mark as failed on initial load
                        metadataAttempted: metadataStatus !== "pending", // Only mark attempted if we found existing metadata
                      }
                    : item,
                ),
              )
            } catch (error) {
              console.error("Failed to check metadata:", error)
              setThumbnails((prev) =>
                prev.map((item, idx) =>
                  idx === index
                    ? {
                        ...item,
                        metadataStatus: "pending",
                        generationFailed: false,
                        metadataAttempted: false,
                      }
                    : item,
                ),
              )
            }
          }),
        )
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Auto-select the first file if there's no selection yet
      if (selectedFiles.length > 0 && !selectedFile) {
        handleFileSelect(selectedFiles[0], true)
      }
    }

    loadThumbnails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiles])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current

    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.shiftKey) {
        // Prevent default vertical scrolling
        e.preventDefault()

        // Scroll horizontally based on the wheel delta
        scrollContainer.scrollLeft += e.deltaY
      }
    }

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const handleFileSelect = async (file: string, isAutoSelect = false) => {
    setSelectedFile(file)

    // Find the thumbnail element
    const thumbnailElements = document.querySelectorAll(".thumbnail-container")
    for (let i = 0; i < thumbnailElements.length; i++) {
      const element = thumbnailElements[i] as HTMLElement
      if (element.getAttribute("data-path") === file) {
        // Use different scroll behavior based on whether it's auto-select or manual
        scrollIntoView(element, {
          scrollMode: isAutoSelect ? "always" : "if-needed",
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        })

        // Add a subtle highlight animation for auto-selection
        if (isAutoSelect) {
          // Remove any existing animation classes first
          element.classList.remove("auto-selected")

          // Force a reflow to restart the animation
          // void element.offsetWidth

          // Add the animation class
          element.classList.add("auto-selected")

          // Remove the class after animation completes
          setTimeout(() => {
            element.classList.remove("auto-selected")
          }, 1500)
        }

        break
      }
    }

    try {
      const metadata = await window.electron.getFileMetadata(file)
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
            },
      )
    } catch (error) {
      console.error("Failed to load metadata:", error)
      setSelectedFileMetadata({
        filePath: file,
        title: "",
        description: "",
        keywords: [],
      })
      toast.error("Failed to load metadata")
    }
  }

  const handleRemoveFile = (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the thumbnail click

    // Remove from selected files
    const newSelectedFiles = selectedFiles.filter((file) => file !== filePath)
    setSelectedFiles(newSelectedFiles)

    // If the removed file was selected, clear the selection
    if (selectedFile === filePath) {
      setSelectedFile(null)
      setSelectedFileMetadata({
        filePath: "",
        title: "",
        description: "",
        keywords: [],
      })
    }

    toast.success("File removed")
  }

  const getBorderColor = (item: ThumbnailData) => {
    if (selectedFile === item.path) {
      // If selected, use primary color but with red tint if failed after attempt
      return (item.generationFailed && item.metadataAttempted) ? "border-red-500" : "border-primary"
    }
    
    // If not selected, use red only for failed attempts, default for others
    if (item.generationFailed && item.metadataAttempted) {
      return "border-red-500/70"
    }
    
    return "border-zinc-800/50"
  }

  return (
    <div className="w-full mx-auto select-none">
      {/* Custom scrolling container with styled scrollbar */}
      <div
        className="w-full rounded-md  relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          ref={scrollContainerRef}
          className={cn("w-full h-full overflow-x-auto custom-scrollbar", isHovering ? "show-scrollbar" : "hide-scrollbar")}
        >
          <div className="flex gap-2 min-w-max p-4 pb-1.5">
            {thumbnails.length > 0 ? (
              thumbnails.map((item, index) => (
                <div className="relative group thumbnail-container" key={index} data-path={item.path}>
                  <div
                    onClick={() => handleFileSelect(item.path)}
                    className={cn(
                      "group relative w-[26vh] h-[17vh]",
                      "rounded-md overflow-hidden",
                      "border-2", // Make border slightly thicker
                      getBorderColor(item),
                      "hover:border-accent-foreground",
                      "transition-all duration-200",
                      "cursor-pointer",
                      "flex-shrink-0",
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
                          <span className="text-xs text-zinc-400 mt-2">Failed to load</span>
                        </div>
                      ) : (
                        <img
                          src={
                            item.thumbnailUrl ||
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23cccccc"/></svg>' ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={`Thumbnail for ${item.path.split("\\").pop()}`}
                          className={cn("w-full h-full object-cover", "group-hover:brightness-90 transition-all")}
                          onError={(e) => {
                            console.error("Error loading thumbnail:", e)
                            setThumbnails((prev) =>
                              prev.map((thumb, i) => (i === index ? { ...thumb, loadingFailed: true } : thumb)),
                            )
                          }}
                        />
                      )}
                    </div>

                    {/* Status indicators */}
                    <div className="absolute top-1 left-1 flex gap-1 z-20">
                      {/* Incomplete metadata warning */}
                      {item.metadataStatus === "incomplete" && (
                        <div className="bg-yellow-500/80 text-white text-xs px-2 py-1 rounded-full" title="Incomplete metadata">
                          !
                        </div>
                      )}
                      {/* Generation failed indicator with retry button - only show if attempted */}
                      {item.generationFailed && item.metadataAttempted && (
                        <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1" title="Metadata generation failed - Click to retry">
                          <span className="text-xs">⚠</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              retryMetadataGeneration(item.path)
                            }}
                            className="hover:bg-red-600/80 px-1 rounded"
                            title="Retry metadata generation"
                          >
                            ↻
                          </button>
                        </div>
                      )}
                      {/* Pending metadata indicator - show for files without metadata that haven't been processed */}
                      {item.metadataStatus === "pending" && !item.metadataAttempted && (
                        <div className="bg-gray-500/80 text-white text-xs px-2 py-1 rounded-full" title="Metadata not generated yet">
                          ...
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
                        "z-10",
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
                        "transition-opacity duration-200",
                      )}
                    >
                      <p className="text-xs text-white truncate">{item.path.split("/").pop()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-background/5 text-5xl flex items-center justify-center w-[26vh] h-[17vh] rounded-md border">
                <MdOutlineImageNotSupported />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileDisplay