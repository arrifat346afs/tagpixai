import { Routes, Route } from 'react-router-dom';
import ActionButton from "./components/ActionButton";
import Catagory from "./components/Catagory";
import FileDisplay from "./components/fileuplode/FileDisplay";
import FilePreview from "./components/FilePreview";
import MetadataInput from "./components/MetadataInput";
import NavBar from "./components/NavBar";
import ProgressBar from "./components/ProgressBar";
import ApiSettings from "./components/settings/ApiSettings";
import MatadataSettings from './components/settings/MatadataSettings';
import { Toaster} from 'sonner'
function App() {
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <Toaster />
      <Routes>
        <Route path="/api-settings" element={<ApiSettings />} />
        <Route path="/metadata-settings" element={<MatadataSettings />} />
        <Route path="/" element={
          <div className="h-full grid grid-cols-[20%_50%_30%] grid-rows-[70%_7%_20%] items-center">
            <Catagory />
            <FilePreview />
            <MetadataInput />
            <ActionButton />
            <FileDisplay />
            <ProgressBar />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;


