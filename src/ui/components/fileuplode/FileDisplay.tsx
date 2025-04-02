import { useContext, useEffect, useState } from 'react';
import { FileContext } from '../FileContext';
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { batchProcessor } from "@/services/batch-processing/processor";
import { toast } from 'sonner';

interface ThumbnailData {
    path: string;
    thumbnailUrl: string | null;
}

function FileDisplay() {
    const { selectedFiles, selectedFile, setSelectedFile, setSelectedFileMetadata } = useContext(FileContext);
    const [thumbnails, setThumbnails] = useState<ThumbnailData[]>([]);

    useEffect(() => {
        const loadThumbnails = async () => {
            const newThumbnails = await Promise.all(
                selectedFiles.map(async (file) => {
                    const thumbnailPath = await window.electron.generateThumbnail(file);
                    return {
                        path: file,
                        thumbnailUrl: typeof thumbnailPath === 'string' ? `local-file:///${thumbnailPath.replace(/\\/g, '/')}` : null,
                    };
                })
            );
            setThumbnails(newThumbnails);
        };

        loadThumbnails();
    }, [selectedFiles]);

    const handleFileSelect = async (file: string) => {
        console.log('Selected file:', file);
        
        setSelectedFile(file); // Set selected file immediately
        
        try {
            // Load metadata for the selected file
            const metadata = await window.electron.getFileMetadata(file);
            console.log('Loaded metadata:', metadata); // Debug log
            
            // Always set metadata, even if null
            setSelectedFileMetadata(metadata ? {
                title: metadata.title || '',
                description: metadata.description || '',
                keywords: metadata.keywords || []
            } : {
                title: '',
                description: '',
                keywords: []
            });
        } catch (error) {
            console.error('Failed to load metadata:', error);
            // Set empty metadata on error
            setSelectedFileMetadata({
                title: '',
                description: '',
                keywords: []
            });
            toast.error('Failed to load metadata');
        }
    };

    return (
        
            <ScrollArea className="col-span-3 row-start-3 p-2 flex flex-col justify-center select-none">
                <div className="flex flex-row gap-2">
                    {thumbnails.length > 0 ? (
                        thumbnails.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => handleFileSelect(item.path)}
                                className={cn(
                                    "group relative w-[180px] h-[120px]",
                                    "rounded-md overflow-hidden",
                                    "border",
                                    selectedFile === item.path ? "border-blue-500" : "border-zinc-700/50",
                                    "hover:border-blue-500",
                                    "transition-all duration-200",
                                    "cursor-pointer",
                                    "flex-shrink-0"
                                )}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src={item.thumbnailUrl || ''}
                                        alt={`Thumbnail for ${item.path}`}
                                        className={cn(
                                            "w-full h-full object-cover", // Changed to object-cover
                                            "group-hover:brightness-90 transition-all"
                                        )}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'placeholder-image-url.jpg';
                                        }}
                                    />
                                </div>
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
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full min-w-[200px] text-zinc-500">
                            No files selected
                        </div>
                    )}
                </div>
                <div className=' h-3 flex justify-center items-center'><ScrollBar orientation="horizontal" /></div>
                
            </ScrollArea>
       
    );
}

export default FileDisplay;
