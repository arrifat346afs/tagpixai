import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import MatadataSettings from "./MatadataSettings";

import UserProfile from "./UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiSettings {
  provider: string;
  model: string;
  apiKey: string;
  requestInterval: number;
}

const DEFAULT_SETTINGS: ApiSettings = {
  provider: "MistralAI", 
  model: "",
  apiKey: "",
  requestInterval: 1,
};

const ApiSettings = () => {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electron.getSettings("api");
        if (savedSettings) {
          setSettings(savedSettings as ApiSettings);
        }
      } catch (error) {
        console.error("Failed to load API settings:", error);
        toast.error("Failed to load settings");
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await window.electron.saveSettings("api", settings);
      toast.success("API settings saved successfully", {
        style: {
          background: "black",
          color: "white",
          border: "1px solid #343333",
        },
      });
    } catch (error) {
      console.error("Failed to save API settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleClear = async () => {
    try {
      await window.electron.saveSettings("api", null);
      setSettings(DEFAULT_SETTINGS);
      toast.success("API settings cleared successfully", {
        style: {
          background: "black",
          color: "white",
          border: "1px solid #343333",
        },
      });
    } catch (error) {
      console.error("Failed to clear API settings:", error);
      toast.error("Failed to clear settings");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden border-t border-zinc-700/50">
      <div className="flex flex-col w-full h-full pt-1">
        <Link to="/">
          <Button variant="ghost" className="justify-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
              fill="currentColor"
            >
              <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
            </svg>
            Back
          </Button>
        </Link>
        <div className="h-full p-6">
          <Tabs defaultValue="api" className="w-full">
            <TabsList className="grid h-11 w-full grid-cols-3 border bg-background/50">
              <TabsTrigger value="api">API Settings</TabsTrigger>
              <TabsTrigger value="metadata">Metadata Settings</TabsTrigger>
              <TabsTrigger value="userprofile">User Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="mt-6">
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold text-gray-400">
                  API Settings
                </h2>

                {/* Provider Selection - Removed OpenAI */}
                <Select
                  value={settings.provider}
                  onValueChange={(value) =>
                    setSettings({ ...settings, provider: value, model: "" })
                  }
                >
                  <SelectTrigger className="w-80 border-background/20">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>{" "}
                  <SelectContent className="bg-black text-gray-400 border-background/20">
                    <SelectItem value="MistralAI">Mistral AI</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Groq">Groq</SelectItem>
                  </SelectContent>
                </Select>

                {/* Model Selection - Removed OpenAI models */}
                <Select
                  value={settings.model}
                  onValueChange={(value) =>
                    setSettings({ ...settings, model: value })
                  }
                >
                  <SelectTrigger className="w-80 border-background/20">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-gray-400 border-background/20">
                    {settings.provider === "MistralAI" && (
                      <>
                        <SelectItem value="pixtral-12b-2409">
                          Pixtral 12b
                        </SelectItem>
                        <SelectItem value="pixtral-large-2411">
                          Pixtral Large
                        </SelectItem>
                      </>
                    )}{" "}
                    {settings.provider === "Google" && (
                      <>
                        <SelectItem value="gemini-2.0-flash-lite">
                          Gemini 2.0 Flash Lite
                        </SelectItem>
                        <SelectItem value="gemini-2.0-flash">
                          Gemini 2.0 Flash
                        </SelectItem>
                      </>
                    )}
                    {settings.provider === "Groq" && (
                      <>
                        <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
                          Llama 4 Scout
                        </SelectItem>
                        <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">
                          Llama 4 Maverick
                        </SelectItem>

                      </>
                    )}
                  </SelectContent>
                </Select>

                {/* API Key Input */}
                <div className="w-80">
                  <Input
                    className="border-background/20"
                    type="password"
                    placeholder="Enter API Key"
                    value={settings.apiKey}
                    onChange={(e) =>
                      setSettings({ ...settings, apiKey: e.target.value })
                    }
                  />
                </div>

                {/* Request Interval Input */}
                <div className="w-80">
                  <Input
                    className="border-background/20"
                    type="number"
                    placeholder="Request interval (seconds)"
                    value={settings.requestInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        requestInterval: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between w-80 gap-4">
                  <Button
                    className="flex-1 text-black hover:bg-blue-800"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </div>

                {/* Info Text */}
                <h4 className="text-center mt-4 text-sm text-gray-500">
                  <span className="font-semibold text-orange-400">
                    Note: OpenAI is currently not supported. Because it's a
                    closedAI.
                  </span>
                </h4>
              </div>
            </TabsContent>

            <TabsContent value="metadata">
              <MatadataSettings />
            </TabsContent>

            <TabsContent value="userprofile">
              <UserProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
