// import React from 'react'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiSettings {
  provider: string;
  model: string;
  apiKey: string;
  requestInterval: number;
}

interface ApiSettingsProps {
  onClose?: () => void;
}

const DEFAULT_SETTINGS: ApiSettings = {
  provider: "MistralAI",
  model: "",
  apiKey: "",
  requestInterval: 1,
};

const ApiSettings = ({ onClose }: ApiSettingsProps) => {
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
      toast.success("API settings saved successfully");
    } catch (error) {
      console.error("Failed to save API settings:", error);
      toast.error("Failed to save settings");
    }
  };

  const handleClear = async () => {
    try {
      await window.electron.saveSettings("api", null);
      setSettings(DEFAULT_SETTINGS);
      toast.success("API settings cleared successfully");
    } catch (error) {
      console.error("Failed to clear API settings:", error);
      toast.error("Failed to clear settings");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-2  text-white">
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Provider Selection - Removed OpenAI */}
        <Select
          value={settings.provider}
          onValueChange={(value) =>
            setSettings({ ...settings, provider: value, model: "" })
          }
        >
          <SelectTrigger className="w-full border-background/20">
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
          onValueChange={(value) => setSettings({ ...settings, model: value })}
        >
          <SelectTrigger className="w-full border-background/20">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent className="bg-black text-gray-400 border-background/20">
            {settings.provider === "MistralAI" && (
              <>
                <SelectItem value="pixtral-12b-2409">Pixtral 12b</SelectItem>
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
        <div className="w-full">
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
        <div className="w-full">
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
        <div className="flex justify-between w-full gap-4">
          <Button
            className="flex-1"
            onClick={async () => {
              await handleSave();
              onClose?.();
            }}
          >
            Save & Close
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {/* Info Text */}
        <h4 className="text-center mt-4 text-sm text-gray-500">
          <span className="font-semibold text-orange-400">
            Note: OpenAI is currently not supported. Because it's a closedAI.
          </span>
        </h4>
      </div>
    </div>
  );
};

export default ApiSettings;
