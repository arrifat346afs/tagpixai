import { useContext } from "react";
import { FileContext } from "../FileContext";
import { Button } from "@/components/ui/button";

function FileSelector() {
  const { setSelectedFiles } = useContext(FileContext);

  const handleOpenDialog = async () => {
    const files = await window.electron.openFileDialog();
    setSelectedFiles(files);
  };

  return (
    <Button className="bg-transparent" onClick={handleOpenDialog}>
      Select Files
    </Button>
  );
}

export default FileSelector;
