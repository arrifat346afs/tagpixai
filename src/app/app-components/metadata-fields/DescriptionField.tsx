import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionFieldProps {
  description: string;
  descriptionCharCount: number;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => Promise<void>;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({
  description,
  descriptionCharCount,
  onDescriptionChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-zinc-400 select-none">Description</span>
        <span className="text-sm text-zinc-500 select-none">
          {descriptionCharCount} characters
        </span>
      </div>
      <Textarea
        value={description}
        onChange={onDescriptionChange}
        className="w-full min-h-[100px]"
      />
    </div>
  );
};

export default DescriptionField;