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
        if (
          typeof savedSettings === "object" &&
          savedSettings !== null &&
          "titleLimit" in savedSettings &&
          "descriptionLimit" in savedSettings &&
          "keywordLimit" in savedSettings &&
          typeof savedSettings.titleLimit === "number" &&
          typeof savedSettings.descriptionLimit === "number" &&
          typeof savedSettings.keywordLimit === "number"
        ) {
          setSettings(savedSettings as typeof DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings!");
      }
    };
    loadSettings();
  }, []);

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success("Settings reset successfully!", {
      style: {
        background: "black",
        color: "white",
        border: "1px solid #343333",
      },
    });
  };

  const handleSave = async () => {
    try {
      await window.electron.saveSettings("metadata", settings);
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

  return (
    <div className="p-4">
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
        </div>
      </div>
    </div>
  );
}

export default MatadataSettings;
