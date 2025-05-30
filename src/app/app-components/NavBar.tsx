// import { Link, useLocation } from "react-router-dom";
import "./css/navbar.css";
import applogo from "../../../TagpixAi3.png";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscLayoutSidebarRight,
  VscLayoutSidebarRightOff,
} from "react-icons/vsc";
import { useState, useEffect, useCallback } from "react";
import { IoSettings, IoSettingsOutline } from "react-icons/io5";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApiSettings from "./settings/ApiSettings";

interface NavBarProps {
  showLeft: boolean;
  showRight: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

const NavBar = ({
  showLeft,
  showRight,
  toggleLeft,
  toggleRight,
}: NavBarProps) => {


  const [isMaximized, setIsMaximized] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Set up window state event listeners
    window.electron.onMaximized(() => {
      setIsMaximized(true);
    });

    window.electron.onUnmaximized(() => {
      setIsMaximized(false);
    });

    // Initial window state check
    const checkMaximized = async () => {
      try {
        const maximized = await window.electron.isMaximized();
        setIsMaximized(maximized);
      } catch (error) {
        console.error("Error checking maximized state:", error);
      }
    };
    checkMaximized();

    // Focus state handling
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Initial focus check
    setIsFocused(document.hasFocus());

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Handle window maximize/restore
  const handleMaximizeClick = useCallback(() => {
    window.electron.maximize();
  }, []);

  // Get appropriate icon color based on focus state
  const iconColor = isFocused ? "text-zinc-300" : "text-zinc-500";
  const hoverColor = isFocused ? "hover:text-zinc-100" : "hover:text-zinc-400";
  const hoverBg = isFocused ? "hover:bg-zinc-500/30" : "hover:bg-zinc-600/20";

  return (
    <div className="nav-bar flex justify-between items-center h-8">
      <div className="flex">
        <div className="flex justify-center flex-row items-center p-1 pr-3">
          <img src={applogo} alt="logo" className="h-7 w-7" />
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <button
              className={`text-xl flex justify-center items-center h-9 text-zinc-300 hover:text-zinc-100 ${iconColor}`}
            >
              {showSettings ? <IoSettings /> : <IoSettingsOutline />}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] bg-background">
            <ApiSettings onClose={() => setShowSettings(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center h-full">
        {/* Toggle buttons directly in the NavBar */}
        <div className="flex gap-4 p-2 w-auto">
          <button
            onClick={toggleLeft}
            className={`flex justify-center items-center h-full w-full p-1 rounded cursor-pointer ${iconColor} ${hoverColor} ${hoverBg}`}
          >
            {showLeft ? <VscLayoutSidebarLeft /> : <VscLayoutSidebarLeftOff />}
          </button>

          <button
            onClick={toggleRight}
            className={`flex justify-center items-center h-full w-full p-1 rounded cursor-pointer ${iconColor} ${hoverColor} ${hoverBg}`}
          >
            {showRight ? (
              <VscLayoutSidebarRight />
            ) : (
              <VscLayoutSidebarRightOff />
            )}
          </button>
        </div>
        <button
          className={`flex justify-center items-center w-12 h-full ${hoverBg}`}
          id="minimize"
          onClick={() => window.electron.minimize()}
        >
          <span
            className={`flex items-center justify-center w-full h-full ${iconColor} ${hoverColor}`}
          >
            <VscChromeMinimize />
          </span>
        </button>
        <button
          className={`flex justify-center items-center w-12 h-full ${hoverBg}`}
          id="maximize"
          onClick={handleMaximizeClick}
        >
          <span
            className={`flex items-center justify-center w-full h-full ${iconColor} ${hoverColor}`}
          >
            {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
          </span>
        </button>
        <button
          className={`flex justify-center items-center w-12 h-full hover:bg-red-600`}
          id="close"
          onClick={() => window.electron.close()}
        >
          <span
            className={`flex items-center justify-center w-full h-full ${iconColor} ${hoverColor}`}
          >
            <VscChromeClose />
          </span>
        </button>
      </div>
    </div>
  );
};
export default NavBar;
