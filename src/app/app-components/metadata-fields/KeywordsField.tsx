import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeywordsFieldProps {
  keywords: string[];
  currentKeyword: string;
  onKeywordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => Promise<void>;
  onRemoveKeyword: (keyword: string) => Promise<void>;
}

const KeywordsField: React.FC<KeywordsFieldProps> = ({
  keywords,
  currentKeyword,
  onKeywordChange,
  onKeyDown,
  onRemoveKeyword,
}) => {
  return (
    <>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400 select-none">Keywords</span>
          <span className="text-sm text-zinc-400 select-none">
            {keywords.length} keywords
          </span>
        </div>
        <Input
          placeholder="Add keywords here (press Enter)"
          value={currentKeyword}
          onChange={onKeywordChange}
          onKeyDown={onKeyDown}
          className="w-full "
        />
      </div>

      <div className="flex flex-col gap-2">
        <ScrollArea className="rounded-md border">
          <div className="flex flex-wrap gap-2 p-2 h-[150px]">
            {keywords.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                No keywords
              </div>
            ) : (
              keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="flex h-6 items-center gap-1 text-white bg-accent/55 border border-accent hover:cursor-pointer hover:bg-primary/45 hover:border-2 hover:border-primary pointer-events-auto select-none"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveKeyword(keyword);
                    }}
                    className="flex items-center justify-center"
                  >
                    <X className="h-3 w-3 !cursor-pointer hover:text-red-400 hover:rotate-90 transition-all ease-in-out  pointer-events-auto" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default KeywordsField;