import { Link, useLocation } from "react-router-dom";
import "./navbar.css";
import applogo from "../../../TagpixAi3.png";

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
        <div className="flex justify-center flex-row items-center p-1">
          <img src={applogo} alt="logo" className="h-8 w-9" />
        </div>
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
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#FFFFFF"
            >
              <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
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
