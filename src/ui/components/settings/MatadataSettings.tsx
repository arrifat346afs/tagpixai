import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Default values
const DEFAULT_SETTINGS = {
  titleLimit: 150,
  descriptionLimit: 150,
  keywordLimit: 25,
};

function MatadataSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electron.getSettings("metadata");
        const savedOutputDirectory = await window.electron.getSettings("outputDirectory");
        
        if (!savedSettings) {
          await window.electron.saveSettings("metadata", DEFAULT_SETTINGS);
          setSettings(DEFAULT_SETTINGS);
        } else {
          const validatedSettings = {
            ...DEFAULT_SETTINGS,
            ...savedSettings,
            titleLimit: Number(savedSettings.titleLimit) || DEFAULT_SETTINGS.titleLimit,
            descriptionLimit: Number(savedSettings.descriptionLimit) || DEFAULT_SETTINGS.descriptionLimit,
            keywordLimit: Number(savedSettings.keywordLimit) || DEFAULT_SETTINGS.keywordLimit,
          };
          setSettings(validatedSettings);
        }

        // Set the saved output directory if it exists
        if (savedOutputDirectory) {
          setSelectedFilePath(savedOutputDirectory);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings!");
      }
    };
    loadSettings();
  }, []);

  const handleReset = async () => {
    try {
      await window.electron.saveSettings("metadata", DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      toast.success("Settings reset successfully!", {
        style: {
          background: "black",
          color: "white",
          border: "1px solid #343333",
        },
      });
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings!");
    }
  };

  const handleSave = async () => {
    try {
      // Ensure all values are numbers
      const settingsToSave = {
        titleLimit: Number(settings.titleLimit),
        descriptionLimit: Number(settings.descriptionLimit),
        keywordLimit: Number(settings.keywordLimit),
      };
      
      await window.electron.saveSettings("metadata", settingsToSave);
      toast.success("Settings saved successfully!", {
        style: {
          background: "black",
          color: "white",
          border: "1px solid #343333",
        },
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings!");
    }
  };

  const [selectedFilePath, setSelectedFilePath] = useState("");

  const handleFileSelect = async () => {
    try {
      console.log('Opening directory dialog...'); // Debug log
      const directories = await window.electron.openDirectoryDialog();
      console.log('Selected directories:', directories); // Debug log
      
      if (directories && Array.isArray(directories) && directories.length > 0) {
        const selectedPath = directories[0];
        setSelectedFilePath(selectedPath);
        
        // Save the output directory path to electron store
        await window.electron.saveSettings("outputDirectory", selectedPath);
        
        toast.success('Directory selected successfully!');
      } else {
        console.log('No directory selected or invalid response'); // Debug log
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      toast.error(`Failed to select directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 overflow-hidden border-t border-zinc-700/50 ">
        <div className="pb-2">
          <Link to="/">
            <Button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
              >
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
              </svg>
            </Button>
          </Link>
        </div>
      <div className="text-gray-400 w-screen h-screen p-4 flex flex-col gap-4 items-center">
        <div className="w-100 gap-4 flex flex-col">
          <div>
            <div className="flex gap-3 p-2">
              <h4>Title Limits</h4>
              <span className="text-sm">(In characters)</span>
            </div>
            <Input
              className="border-background/20"
              type="number"
              value={settings.titleLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  titleLimit: parseInt(e.target.value),
                })
              }
              min="5"
              max="200"
            />
          </div>
          <div>
            <div className="flex gap-3 p-2">
              <h4>Description Limits</h4>
              <span className="text-sm">(In characters)</span>
            </div>
            <Input
              className="border-background/20"
              type="number"
              value={settings.descriptionLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  descriptionLimit: parseInt(e.target.value),
                })
              }
              min="5"
              max="200"
            />
          </div>
          <div>
            <h4 className="p-2">Keyword Limits</h4>
            <Input
              className="border-background/20"
              type="number"
              value={settings.keywordLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  keywordLimit: parseInt(e.target.value),
                })
              }
              min="5"
              max="49"
            />
          </div>
          <div className="flex w-100 justify-between">
            <Button className="w-30" onClick={handleReset}>
              Reset
            </Button>
            <Button className="w-30" onClick={handleSave}>
              Save
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="p-2">Select Output Directory</h4>
            <div className="flex gap-2">
              <Input
                className="border-background/20 flex-grow"
                type="text"
                value={selectedFilePath}
                readOnly
                placeholder="No directory selected"
              />
              <Button
                className="w-30"
                onClick={handleFileSelect}
              >
                Browse
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatadataSettings;
