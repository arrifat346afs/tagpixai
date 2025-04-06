import { Link, useLocation, } from "react-router-dom";
import "./navbar.css";
import applogo from "../../../TagpixAi3.png"

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
 
  let location = useLocation();
  let currentPage = location.pathname;

  return (
    <div className="nav-bar flex justify-between items-center h-9">
      <div className="flex">
        <div className="flex justify-center flex-row items-center p-1"><img src={applogo} alt="logo" className="h-8 w-9"/></div>
        <Link
          to={"/api-settings"}
          className={` ${
            currentPage === "/api-settings"
              ? "opacity-100 border-b bg-gradient-to-t from-gray-800 to-black"
              : "bg-black"
          } text-white`}
        >
          <button
            className="flex justify-center flex-row items-center w-10 h-9 cursor-pointer opacity-60"
            data-tooltip="API Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="30px"
              viewBox="0 -960 960 960"
              width="30px"
              fill="#e8eaed"
            >
              <path d="M280-280q-83.33 0-141.67-58.28Q80-396.56 80-479.82q0-83.26 58.33-141.72Q196.67-680 280-680q61.69 0 112.62 34.46 50.92 34.46 71.74 90.72H880v149.64h-88.1V-280H648.41v-125.18H464.36q-20.82 56.26-71.74 90.72Q341.69-280 280-280Zm0-33.85q67.79 0 109.41-42.52 41.62-42.53 49.66-82.66H683.9v125.18h74.15v-125.18h88.1v-81.94H439.03q-8-40.13-49.62-82.66-41.62-42.52-109.41-42.52-69.04 0-117.6 48.53-48.55 48.53-48.55 117.54 0 69 48.55 117.62 48.56 48.61 117.6 48.61Zm0-120.82q18.67 0 32-13.33 13.33-13.33 13.33-32T312-512q-13.33-13.33-32-13.33T248-512q-13.33 13.33-13.33 32T248-448q13.33 13.33 32 13.33Zm0-45.33Z" />
            </svg>
          </button>
        </Link>
      </div> 
      <div className="flex items-center">
        {/* Toggle buttons directly in the NavBar */}
        <div className="flex gap-4">
          <button
            onClick={toggleLeft}
            className="flex justify-center items-center h-9 rounded cursor-pointer"
          >
            {showLeft ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_5_91"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="25"
                  height="25"
                >
                  <rect
                    x="0.308167"
                    y="0.514221"
                    width="24"
                    height="24"
                    fill="#a1a1a1"
                  />
                </mask>
                <g mask="url(#mask0_5_91)">
                  <path
                    d="M5.15818 22.3142C4.40818 22.3142 3.77901 22.0601 3.27068 21.5517C2.76235 21.0434 2.50818 20.4142 2.50818 19.6642V5.36423C2.50818 4.61423 2.76235 3.98507 3.27068 3.47673C3.77901 2.9684 4.40818 2.71423 5.15818 2.71423H19.4582C20.2082 2.71423 20.8373 2.9684 21.3457 3.47673C21.854 3.98507 22.1082 4.61423 22.1082 5.36423V19.6642C22.1082 20.4142 21.854 21.0434 21.3457 21.5517C20.8373 22.0601 20.2082 22.3142 19.4582 22.3142H5.15818ZM8.15818 19.6642V5.36423H10.8082V19.6642H8.15818ZM10.8082 19.6642H19.4582V5.36423H10.8082V19.6642Z"
                    fill="#a1a1a1"
                  />
                </g>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#a1a1a1"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm120-80v-560H200v560h120Zm80 0h360v-560H400v560Zm-80 0H200h120Z" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleRight}
            className=" flex justify-center items-center h-9  ext-white rounded cursor-pointer"
          >
            {showRight ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_5_103"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                >
                  <rect width="24" height="24" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_5_103)">
                  <path
                    d="M4.85001 21.8C4.10001 21.8 3.47085 21.5458 2.96251 21.0375C2.45418 20.5292 2.20001 19.9 2.20001 19.15V4.85001C2.20001 4.10001 2.45418 3.47085 2.96251 2.96251C3.47085 2.45418 4.10001 2.20001 4.85001 2.20001H19.15C19.9 2.20001 20.5292 2.45418 21.0375 2.96251C21.5458 3.47085 21.8 4.10001 21.8 4.85001V19.15C21.8 19.9 21.5458 20.5292 21.0375 21.0375C20.5292 21.5458 19.9 21.8 19.15 21.8H4.85001ZM13.5 19.15V4.85001H4.85001V19.15H13.5Z"
                    fill="#a1a1a1"
                  />
                </g>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#a1a1a1"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm440-80h120v-560H640v560Zm-80 0v-560H200v560h360Zm80 0h120-120Z" />
              </svg>
            )}
          </button>
        </div>
        <button
          className="flex justify-center items-center  w-12 h-9 hover:bg-background/10"
          id="minimize"
          onClick={() => window.electron.minimize()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="16px"
            fill="#e8eaed"
            
          >
            <path d="M200-440v-80h560v80H200Z" />
          </svg>
        </button>
        <button
          className="flex justify-center items-center  w-12 h-9 hover:bg-background/10"
          id="maximize"
          onClick={() => window.electron.maximize()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="16px"
            fill="#e8eaed"
            
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z" />
          </svg>
        </button>
        <button
          className="flex justify-center items-center  w-12 h-9 hover:bg-red-600"
          id="close"
          onClick={() => window.electron.close()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16px"
            viewBox="0 -960 960 960"
            width="16px"
            fill="#e8eaed"
            
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default NavBar;
