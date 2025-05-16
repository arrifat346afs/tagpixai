import React from 'react'

const demo = () => {
  return (
    <div>
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
    </div>
  )
}

export default demo
