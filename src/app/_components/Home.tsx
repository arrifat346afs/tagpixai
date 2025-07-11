import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Category from "./Catagory/Catagory";
// import { ToastContainer} from 'react-toastify';
import NavBar from "./NavBar";
import ApiSettings from "./settings/Settings";
import MatadataSettings from "./settings/_components/MatadataSettings";
import FilePreview from "./FilePreview";
import MetadataInput from "./MetadataInput";
import ActionButton from "./Buttons/ActionButton";
import FileDisplay from "./fileupload/FileDisplay";
import ProgressBar from "./ProgressBar";
import { Toaster } from "@/components/ui/sonner"
const Home = () => {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  const toggleLeft = () => {
    setShowLeft(!showLeft);
  };

  const toggleRight = () => {
    setShowRight(!showRight);
  };

  return (
    <div className="flex flex-col w-full h-screen ">
      <NavBar
        showLeft={showLeft}
        showRight={showRight}
        toggleLeft={toggleLeft}
        toggleRight={toggleRight}
      />
      <Routes>
        <Route path="api-settings" element={<ApiSettings />} />
        <Route path="metadata-settings" element={<MatadataSettings />} />
        <Route
          path=""
          element={
            <div className="h-full flex flex-col border-t overflow-hidden">
              {/* Main content area with flex layout - add h-[72%] to maintain fixed height */}
              <div className="flex h-[64vh]">
                {/* Left panel */}
                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    showLeft ? "w-[30%]" : "w-0"
                  }`}
                >
                  <Category />
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
              <div className="h-[6vh] flex-shrink-0">
                <ActionButton />
              </div>
              <div className="h-[21vh]">
                <FileDisplay />
              </div>
              <div className="h-[4vh] flex-shrink-0">
                {/* Progress bar container */}
                <ProgressBar visible={true} />
              </div>
            </div>
          }
        />
      </Routes>
        <Toaster />
    </div>
  );
};

export default Home;
