
import "../css/navbar.css";
import applogo from "../../../../TagpixAi3.png";
// import { Tooltip } from "react-tooltip";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscChromeRestore,

} from "react-icons/vsc";
import { useState, useEffect, useCallback } from "react";


const AuthNav = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

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
    <div>
      <div className="nav-bar flex justify-between items-center h-8">
      <div className="flex">
        <div className="flex justify-center flex-row items-center p-1 pr-3">
          <img src={applogo} alt="logo" className="h-7 w-7" />
        </div>

      </div>
      <div className="flex items-center h-full">
        {/* Toggle buttons directly in the NavBar */}

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
    </div>
  )
}

export default AuthNav;
