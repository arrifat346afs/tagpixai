import { useContext, useEffect, useState } from 'react';
import { FileContext } from '../FileContext';
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { batchProcessor } from '@/services/batch-processing/processor';

interface ThumbnailData {
    path: string;
    thumbnailUrl: string | null;
    hasMetadata: boolean;
}

function FileDisplay() {
    const { selectedFiles, selectedFile, setSelectedFile, setSelectedFileMetadata, setSelectedFiles } = useContext(FileContext);
    const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);
    const [processedFiles, setProcessedFiles] = useState<Set<string>>(new Set());

    // Subscribe to individual file processing completion
    useEffect(() => {
        const unsubscribe = batchProcessor.subscribeToFileComplete((result) => {
            if (result.success) {
                setProcessedFiles(prev => new Set([...prev, result.filePath]));
            }
        });

        return () => unsubscribe();
    }, []);

    // Load thumbnails when files are selected
    useEffect(() => {
        const loadThumbnails = async () => {
            const newThumbnails = await Promise.all(
                selectedFiles.map(async (file) => {
                    try {
                        const thumbnailPath = await window.electron.generateThumbnail(file);
                        const thumbnailData = thumbnailPath 
                            ? await window.electron.readFileBase64(thumbnailPath)
                            : null;
                        
                        return {
                            path: file,
                            thumbnailUrl: thumbnailData,
                            hasMetadata: false // Always start as false
                        };
                    } catch (error) {
                        console.error('Error loading thumbnail for file:', file, error);
                        return {
                            path: file,
                            thumbnailUrl: null,
                            hasMetadata: false
                        };
                    }
                })
            );
            
            setThumbnails(newThumbnails);
            // Clear processed files when new files are loaded
            setProcessedFiles(new Set());
        };

        loadThumbnails();
    }, [selectedFiles]);

    const handleFileSelect = async (file: string) => {
        setSelectedFile(file);
        try {
            const metadata = await window.electron.getFileMetadata(file);
            setSelectedFileMetadata(metadata ? {
                filePath: file,
                title: metadata.title || '',
                description: metadata.description || '',
                keywords: metadata.keywords || []
            } : {
                filePath: file,
                title: '',
                description: '',
                keywords: []
            });
        } catch (error) {
            console.error('Failed to load metadata:', error);
            setSelectedFileMetadata({
                filePath: file,
                title: '',
                description: '',
                keywords: []
            });
            toast.error('Failed to load metadata');
        }
    };

    const handleRemoveFile = (filePath: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent triggering the thumbnail click

        // Remove from selected files
        const newSelectedFiles = selectedFiles.filter(file => file !== filePath);
        setSelectedFiles(newSelectedFiles);

        // If the removed file was selected, clear the selection
        if (selectedFile === filePath) {
            setSelectedFile(null);
            setSelectedFileMetadata({
                filePath: '',
                title: '',
                description: '',
                keywords: []
            });
        }

        toast.success('File removed');
    };

    return (
        <ScrollArea className=" p-4 flex flex-col justify-center select-none">
            <div className="flex flex-row gap-2">
                {thumbnails.length > 0 ? (
                    thumbnails.map((item, index) => {
                        const hasValidMetadata = processedFiles.has(item.path);
                        console.log(`File ${item.path} has valid metadata: ${hasValidMetadata}`); // Debug log
                        
                        return (
                            <div
                                key={index}
                                onClick={() => handleFileSelect(item.path)}
                                className={cn(
                                    "group relative w-[180px] h-[120px]",
                                    "rounded-md overflow-hidden",
                                    "border-2", // Make border slightly thicker
                                    {
                                        'border-blue-500': selectedFile === item.path,
                                        'border-green-500': hasValidMetadata && selectedFile !== item.path,
                                        'border-zinc-700/50': !hasValidMetadata && selectedFile !== item.path
                                    },
                                    "hover:border-blue-500",
                                    "transition-all duration-200",
                                    "cursor-pointer",
                                    "flex-shrink-0"
                                )}
                            >
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/20">
                                    {item.thumbnailUrl ? (
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={`Thumbnail for ${item.path.split('\\').pop()}`}
                                            className={cn(
                                                "w-full h-full object-cover",
                                                "group-hover:brightness-90 transition-all"
                                            )}
                                            onError={(e) => {
                                                console.error('Error loading thumbnail:', e);
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23cccccc"/></svg>';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-zinc-800/50">
                                            <span className="text-xs text-zinc-400">Loading...</span>
                                        </div>
                                    )}
                                </div>
                                {/* Remove button - appears on hover */}
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
                                <div className={cn(
                                    "absolute bottom-0 left-0 right-0",
                                    "bg-gradient-to-t from-black/80 to-transparent",
                                    "p-2",
                                    "transition-opacity duration-200"
                                )}>
                                    <p className="text-xs text-white truncate">
                                        {item.path.split('\\').pop()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-background/5 flex items-center justify-center h-30 min-w-[200px] rounded-md border border-zinc-800/50">
                        <p className="text-zinc-500">Image thumbnails</p>
                    </div>
                )}
            </div>

                <ScrollBar orientation="horizontal" />

        </ScrollArea>
    );
}

export default FileDisplay;
