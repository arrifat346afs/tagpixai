import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface TitleFieldProps {
  title: string;
  titleCharCount: number;
  onTitleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => Promise<void>;
}

const TitleField: React.FC<TitleFieldProps> = ({
  title,
  titleCharCount,
  onTitleChange,
}) => {
  return (
    <div className="flex flex-col gap-2 h-[13vh]">
      <div className="flex justify-between items-center">
        <span className="text-sm text-zinc-400 select-none">Title</span>
        <span className="text-sm text-zinc-500 select-none">
          {titleCharCount} characters
        </span>
      </div>
      
        <Textarea
          value={title}
          onChange={onTitleChange}
          className="w-full min-h-[60px] max-h-[60px] overflow-y-auto scrollbartaxt"
        />
      
    </div>
  );
};

export default TitleField;
