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
      Uplode
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#e3e3e3"
      >
        <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
      </svg>
    </Button>
  );
}

export default FileSelector;
