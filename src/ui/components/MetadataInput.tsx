import React, { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIAnalysisResult } from "@/api/ai-api";
import { toast } from "sonner";
import { batchProcessor } from "@/services/batch-processing/processor";
import { FileContext } from "./FileContext";

interface MetadataInputProps {
  onMetadataChange?: (metadata: AIAnalysisResult) => void;
}

const MetadataInput: React.FC<MetadataInputProps> = ({ onMetadataChange }) => {
  const { selectedFile, selectedFileMetadata } = useContext(FileContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Update local state when context metadata changes
  useEffect(() => {
    if (selectedFileMetadata) {
      setTitle(selectedFileMetadata.title);
      setDescription(selectedFileMetadata.description);
      setKeywords(selectedFileMetadata.keywords);
    } else {
      // Clear the fields if no metadata
      setTitle("");
      setDescription("");
      setKeywords([]);
    }
  }, [selectedFileMetadata]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(currentKeyword.trim())) {
        const newKeywords = [...keywords, currentKeyword.trim()];
        setKeywords(newKeywords);
        const newMetadata = {
          title,
          description,
          keywords: newKeywords
        };
        onMetadataChange?.(newMetadata);
        if (selectedFile) {
          await window.electron.saveFileMetadata(selectedFile, newMetadata);
        }
      }
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter((keyword) => keyword !== keywordToRemove);
    setKeywords(newKeywords);
    onMetadataChange?.({
      title,
      description,
      keywords: newKeywords
    });
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const newMetadata = {
      title: newTitle,
      description,
      keywords
    };
    onMetadataChange?.(newMetadata);
    if (selectedFile) {
      await window.electron.saveFileMetadata(selectedFile, newMetadata);
    }
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    const newMetadata = {
      title,
      description: newDescription,
      keywords
    };
    onMetadataChange?.(newMetadata);
    if (selectedFile) {
      await window.electron.saveFileMetadata(selectedFile, newMetadata);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    try {
      setIsGenerating(true);
      
      const [apiSettings, metadataSettings] = await Promise.all([
        window.electron.getSettings('api'),
        window.electron.getSettings('metadata')
      ]);
      
      if (!apiSettings?.apiKey || !apiSettings?.provider || !apiSettings?.model) {
        toast.error('Please configure API settings first');
        return;
      }

      if (!metadataSettings) {
        toast.error('Please configure metadata settings first');
        return;
      }

      const settings = {
        api: apiSettings,
        metadata: metadataSettings
      };

      const result = await batchProcessor.process(
        [selectedFile],
        settings,
        (status) => console.log('Progress:', status),
        (result) => {
          if (result.success && result.metadata) {
            const metadata = result.metadata;
            // Directly update the UI state
            setTitle(metadata.title || '');
            setDescription(metadata.description || '');
            setKeywords(metadata.keywords || []);
            // Also notify parent component
            onMetadataChange?.({
              title: metadata.title || '',
              description: metadata.description || '',
              keywords: metadata.keywords || []
            });
          }
        }
      );

      if (result[0].success) {
        // Update UI with the final result data
        const finalMetadata = result[0].metadata;
        if (finalMetadata) {
          const validMetadata = {
            title: finalMetadata.title || '',
            description: finalMetadata.description || '',
            keywords: finalMetadata.keywords || []
          };
          setTitle(validMetadata.title);
          setDescription(validMetadata.description);
          setKeywords(validMetadata.keywords);
          onMetadataChange?.(validMetadata);
        }
        toast.success('Metadata generated successfully');
      } else {
        toast.error(`Failed to generate metadata: ${result[0].error}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full p-4 border-l border-zinc-700/50 overflow-auto transition-all duration-300 h-full">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-zinc-400">Title</span>
        <Textarea 
          value={title}
          onChange={handleTitleChange}
          className="w-full bg-background/5 border-zinc-800 text-white" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-zinc-400">Description</span>
        <Textarea 
          value={description}
          onChange={handleDescriptionChange}
          className="w-full min-h-[100px] bg-background/5 border-zinc-800 text-white" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Keywords</span>
          <span className="text-sm text-zinc-400">
            {keywords.length} keywords
          </span>
        </div>
        <Input
          placeholder="Add keywords (press Enter)"
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-background/5 border-zinc-800 text-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <div className="min-h-[9rem] max-h-[calc(100vh-20rem)] overflow-y-auto rounded-md border border-zinc-800 bg-background/5">
            <div className="flex flex-wrap gap-2 p-2">
              {keywords.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  No keywords
                </div>
              ) : (
                keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="flex items-center gap-1 bg-background/10"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeKeyword(keyword);
                      }}
                      className="flex items-center justify-center"
                    >
                      <X className="h-3 w-3 !cursor-pointer hover:text-red-400 transition-colors pointer-events-auto" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="absolute right-2 bottom-2 text-xs text-zinc-500">
            {keywords.length > 0 && "Scroll to see more"}
          </div>
        </div>
      </div>
      <div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !selectedFile}
        >
          {isGenerating ? 'Generating...' : 'Generate Metadata'}
        </Button>
      </div>
    </div>
  );
};

export default MetadataInput;










