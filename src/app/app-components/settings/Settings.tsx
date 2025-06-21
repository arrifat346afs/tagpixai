
import MatadataSettings from "./MatadataSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogTitle, DialogHeader } from "@/components/ui/dialog";
import ApiSettings from "./ApiSettings";

// interface ApiSettings {
//   provider: string;
//   model: string;
//   apiKey: string;
//   requestInterval: number;
// }

// interface ApiSettingsProps {
//   onClose?: () => void;
// }

// const DEFAULT_SETTINGS: ApiSettings = {
//   provider: "MistralAI",
//   model: "",
//   apiKey: "",
//   requestInterval: 1,
// };

const Settings = () => {
  // const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);

  // useEffect(() => {
  //   const loadSettings = async () => {
  //     try {
  //       const savedSettings = await window.electron.getSettings("api");
  //       if (savedSettings) {
  //         setSettings(savedSettings as ApiSettings);
  //       }
  //     } catch (error) {
  //       console.error("Failed to load API settings:", error);
  //       toast.error("Failed to load settings");
  //     }
  //   };
  //   loadSettings();
  // }, []);

  // const handleSave = async () => {
  //   try {
  //     await window.electron.saveSettings("api", settings);
  //     toast.success("API settings saved successfully");
  //   } catch (error) {
  //     console.error("Failed to save API settings:", error);
  //     toast.error("Failed to save settings");
  //   }
  // };

  // const handleClear = async () => {
  //   try {
  //     await window.electron.saveSettings("api", null);
  //     setSettings(DEFAULT_SETTINGS);
  //     toast.success("API settings cleared successfully");
  //   } catch (error) {
  //     console.error("Failed to clear API settings:", error);
  //     toast.error("Failed to clear settings");
  //   }
  // };
  
  return (
    <div className="flex flex-col h-full">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          Settings
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto pt-4">
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid h-11 w-full grid-cols-2 border bg-background/50">
            <TabsTrigger value="api">API Settings</TabsTrigger>
            <TabsTrigger value="metadata">Metadata Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="mt-6">
            <ApiSettings/>
          </TabsContent>

          <TabsContent value="metadata">
            <MatadataSettings />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
