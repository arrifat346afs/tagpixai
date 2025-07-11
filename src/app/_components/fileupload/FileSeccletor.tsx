import { useContext } from "react";
import { FileContext } from "../context/FileContext";
import { Button } from "@/components/ui/button";
import { CgSoftwareUpload } from "react-icons/cg";

function FileSelector() {
  const { setSelectedFiles } = useContext(FileContext);

  const handleOpenDialog = async () => {
    const files = await window.electron.openFileDialog();
    setSelectedFiles(files);
  };

  return (
    <Button
      className="bg-transparent text-white hover:bg-accent"
      onClick={handleOpenDialog}
    >
      Upload
      <CgSoftwareUpload />
    </Button>
  );
}

export default FileSelector;
