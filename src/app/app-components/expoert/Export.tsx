import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useState, useContext } from "react"
import { FileContext } from "../FileContext"
import { toast } from "sonner"

const Export = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("adobeStock")
  const { selectedFiles } = useContext(FileContext)

  const getFilenameFromPath = (filePath: string) => {
    // Handle both forward and backward slashes and preserve the file extension
    const normalizedPath = filePath.replace(/\\/g, '/');
    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    return lastSlashIndex !== -1 ? normalizedPath.slice(lastSlashIndex + 1) : normalizedPath;
  }

  const generateCSV = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected for export")
      return
    }

    try {
      const outputDirectory = await window.electron.getSettings("outputDirectory")

      if (!outputDirectory) {
        toast.error("Please select an output directory in Metadata Settings first")
        return
      }

      // Debug: Log file names for verification
      console.log('Files to be exported:', selectedFiles.map(file => ({
        original: file,
        extracted: getFilenameFromPath(file)
      })));

      // Debug: Log all temp categories to see what's available
      console.log('Exporting files, checking all temp categories first...');

      // Get all categories from the store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allCategories: Record<string, any> = {};

      for (const filePath of selectedFiles) {
        const tempCats = await window.electron.getTempCategories(filePath);
        console.log(`File: ${getFilenameFromPath(filePath)}, Temp Categories:`, tempCats);

        if (tempCats) {
          allCategories[filePath] = tempCats;
        }
      }

      console.log('All categories from store:', allCategories);

      const rows = []
      const headers = selectedPlatform === "adobeStock"
        ? "Filename,Title,Description,Keywords,Category"
        : "Filename,Title,Description,Keywords,Categories"

      rows.push(headers)

      for (const filePath of selectedFiles) {
        const metadata = await window.electron.getFileMetadata(filePath)
        if (!metadata) {
          console.log(`No metadata found for file: ${filePath}`);
          continue;
        }

        const filename = getFilenameFromPath(filePath)
        console.log(`Processing file: ${filePath} -> ${filename}`); // Debug log

        const { title, description, keywords } = metadata

        // Get temporary categories from the Electron store
        const tempCategories = await window.electron.getTempCategories(filePath) as {
          adobe?: string;
          shutter1?: string;
          shutter2?: string;
        } | null;

        console.log(`Retrieved temp categories for ${filename}:`, tempCategories);

        if (selectedPlatform === "adobeStock") {
          // Use the adobe category from temp store if available
          let category = "1"; // Default to Animals

          if (tempCategories && tempCategories.adobe) {
            category = tempCategories.adobe;
            console.log(`Using temp category for ${filename}: ${category}`);
          } else if (metadata.category) {
            category = metadata.category;
            console.log(`Using metadata category for ${filename}: ${category}`);
          } else {
            console.log(`Using default category for ${filename}: ${category}`);
          }

          const row = [
            filename,
            `"${title.replace(/"/g, '""')}"`,
            `"${description.replace(/"/g, '""')}"`,
            `"${keywords.join(',')}"`,
            category
          ].join(',')
          rows.push(row)
        } else {
          // Use the shutterstock categories from temp store if available
          let category1 = "Miscellaneous";
          let category2 = "Miscellaneous";

          if (tempCategories) {
            if (tempCategories.shutter1) {
              category1 = tempCategories.shutter1;
              console.log(`Using temp shutter1 category for ${filename}: ${category1}`);
            }
            if (tempCategories.shutter2) {
              category2 = tempCategories.shutter2;
              console.log(`Using temp shutter2 category for ${filename}: ${category2}`);
            }
          }

          const categories = `${category1},${category2}`;

          const row = [
            filename,
            `"${title.replace(/"/g, '""')}"`,
            `"${description.replace(/"/g, '""')}"`,
            `"${keywords.join(',')}"`,
            `"${categories}"`
          ].join(',')
          rows.push(row)
        }
      }

      const csvContent = rows.join('\n')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const platform = selectedPlatform === "adobeStock" ? "adobe-stock" : "shutter-stock"
      const filename = `${platform}-export-${timestamp}.csv`

      const fullPath = `${outputDirectory}/${filename}`.replace(/\\/g, '/')
      await window.electron.saveCsvFile(fullPath, csvContent)

      toast.success("Export completed successfully")
    } catch (error) {
      console.error('Export error:', error)
      toast.error("Failed to export metadata")
    }
  }

  // Debug function to check all temp categories
  // const debugCategories = async () => {
  //   try {
  //     console.log('DEBUG: Checking all temp categories...');

  //     // Get all categories from the store
  //     const allCategories: Record<string, any> = {};

  //     for (const filePath of selectedFiles) {
  //       const tempCats = await window.electron.getTempCategories(filePath);
  //       console.log(`DEBUG: File: ${getFilenameFromPath(filePath)}, Temp Categories:`, tempCats);

  //       if (tempCats) {
  //         allCategories[filePath] = tempCats;
  //       }
  //     }

  //     console.log('DEBUG: All categories from store:', allCategories);
  //     toast.info('Check console for category debug info');
  //   } catch (error) {
  //     console.error('Debug error:', error);
  //     toast.error('Failed to debug categories');
  //   }
  // };

  return (
    <div className=" flex gap-4 justify-center items-center h-full my-2">
      <div className="flex gap-2">
        <Button
          className="bg-transparent text-white hover:bg-accent"
          onClick={generateCSV}
          disabled={selectedFiles.length === 0}
        >
          Export
          
        </Button>
      </div>
      <Separator orientation="vertical" className="bg-zinc-700/50"/>
      <div className="w-full flex justify-center items-center p-3">
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-full border-background/20 border-1 text-center">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#191818] text-gray-300">
            <SelectItem value="adobeStock">Adobe Stock</SelectItem>
            <SelectItem value="shutterStock">Shutter Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Export
