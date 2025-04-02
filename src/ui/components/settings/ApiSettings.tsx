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

interface ApiSettings {
  provider: string;
  model: string;
  apiKey: string;
  requestInterval: number;
}

const DEFAULT_SETTINGS: ApiSettings = {
  provider: "OpenAI",
  model: "",
  apiKey: "",
  requestInterval: 1
};

const ApiSettings = () => {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electron.getSettings('api');
        if (savedSettings) {
          setSettings(savedSettings as ApiSettings);
        }
      } catch (error) {
        console.error('Failed to load API settings:', error);
        toast.error('Failed to load settings');
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await window.electron.saveSettings('api', settings);
      toast.success('API settings saved successfully', {
        style: {
          background: 'black',
          color: 'white',
          border: '1px solid #343333',
        },
      });
    } catch (error) {
      console.error('Failed to save API settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleClear = async () => {
    try {
      await window.electron.saveSettings('api', null);
      setSettings(DEFAULT_SETTINGS);
      toast.success('API settings cleared successfully', {
        style: {
          background: 'black',
          color: 'white',
          border: '1px solid #343333',
        },
      });
    } catch (error) {
      console.error('Failed to clear API settings:', error);
      toast.error('Failed to clear settings');
    }
  };

  return (
    <div className="p-4">
      <div>
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
        <div className="flex gap-4 justify-center flex-col items-center text-gray-400">
          <h2 className="text-2xl font-bold ">API Settings</h2>
          <Select 
            value={settings.provider}
            onValueChange={(value) => setSettings({...settings, provider: value, model: ""})}>
            <SelectTrigger className="w-80 border-background/20">
              <SelectValue placeholder="Select Provider" />
            </SelectTrigger>
            <SelectContent className="bg-black text-gray-400 border-background/20">
              <SelectItem value="MistralAI">Mistral AI</SelectItem>
              <SelectItem value="OpenAI">OpenAI</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={settings.model}
            onValueChange={(value) => setSettings({...settings, model: value})}>
            <SelectTrigger className="w-80 border-background/20">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent className="bg-black text-gray-400 border-background/20">
              {settings.provider === "MistralAI" ? (
                <>
                  <SelectItem value="pixtral-12b-2409">Pixtral 12b</SelectItem>
                  <SelectItem value="pixtral-large-2411">Pixtral Large</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <div className="w-80">
            <Input 
              className="border-background/20" 
              type="password" 
              placeholder="Enter API Key"
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
            />
          </div>
          <div className="w-80">
            <Input 
              className="border-background/20" 
              type="number" 
              placeholder="Request interval (seconds)"
              value={settings.requestInterval}
              onChange={(e) => setSettings({...settings, requestInterval: Number(e.target.value)})}
            />
          </div>
          <div className="flex justify-between w-75">
            <Button 
              className="w-30 bg-gray-200 hover:bg-gray-900 hover:text-white text-black"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button 
              className="w-30 hover:bg-gray-200 hover:text-black"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
          <h4 className="text-center mt-4 text-sm text-gray-500">
            Exciting updates coming soon!<br></br>
            We're expanding our AI capabilities to include more providers and features.<br></br>
            <span className="font-semibold text-orange-400">Note: OpenAI is currently not supported.</span>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
