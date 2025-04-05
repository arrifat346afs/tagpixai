import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import ActionButton from "./components/ActionButton";
import Catagory from "./components/Catagory";
import FileDisplay from "./components/fileuplode/FileDisplay";
import FilePreview from "./components/FilePreview";
import MetadataInput from "./components/MetadataInput";
import NavBar from "./components/NavBar";
import ProgressBar from "./components/ProgressBar";
import ApiSettings from "./components/settings/ApiSettings";
import MatadataSettings from "./components/settings/MatadataSettings";
import { Toaster } from "sonner";

function App() {
  // State for panel visibility
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const toggleLeft = () => {
    setShowLeft(!showLeft);
  };

  const toggleRight = () => {
    setShowRight(!showRight);
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <NavBar
        showLeft={showLeft}
        showRight={showRight}
        toggleLeft={toggleLeft}
        toggleRight={toggleRight}
      />
      <Toaster />
      <Routes>
        <Route path="api-settings" element={<ApiSettings />} />
        <Route path="metadata-settings" element={<MatadataSettings />} />
        <Route
          path=""
          element={
            <div className="h-full flex flex-col border-t border-zinc-700/50 overflow-hidden">
              {/* Main content area with flex layout - add h-[72%] to maintain fixed height */}
              <div className="flex h-[70%]">
                {/* Left panel */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    showLeft ? "w-[30%]" : "w-0"
                  }`}
                >
                  <Catagory />
                </div>

                {/* Middle panel - expands to fill available space */}
                <div
                  className={`transition-all duration-500 ${
                    showLeft && showRight
                      ? "w-[40%]"
                      : !showLeft && showRight
                      ? "w-[70%]"
                      : showLeft && !showRight
                      ? "w-[70%]"
                      : "w-full"
                  }`}
                >
                  <FilePreview />
                </div>

                {/* Right panel */}
                <div
                  className={`transition-all duration-500 overflow-y-auto ${
                    showRight ? "w-[30%]" : "w-0"
                  }`}
                >
                  <MetadataInput />
                </div>
              </div>

              {/* Bottom sections - maintain fixed heights */}
              <div className="h-[6%] flex-shrink-0">
                <ActionButton />
              </div>
              <div className="h-[20%] flex-shrink-0">
                <FileDisplay />
              </div>
              <div className="h-[4%] flex-shrink-0">
                <ProgressBar visible={true} />
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

