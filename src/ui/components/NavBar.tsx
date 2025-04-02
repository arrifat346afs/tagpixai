import { useNavigate } from 'react-router-dom';
import "./navbar.css"

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="nav-bar flex justify-between items-center h-9">
      <div className="flex">
        <button 
          className="flex justify-center flex-row items-center w-10 h-9 cursor-pointer" 
          data-tooltip="API Settings"
          onClick={() => navigate('/api-settings')}
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
        <button className="flex justify-center flex-row items-center w-10 h-9 cursor-pointer" data-tooltip="Metadeta Settings"
        onClick={() => navigate('/metadata-settings')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#e8eaed"
          >
            <path d="m410.72-120-15.59-114.87q-21.1-6.59-46.12-20.51-25.01-13.93-42.42-29.88l-106.03 47.03-69.43-122.41 93.51-69.69q-1.92-11.67-3.15-24.45t-1.23-24.45q0-10.9 1.23-23.55 1.23-12.66 3.15-26.89l-93.51-70.2 69.43-120.36 105.26 45.74q19.72-16.2 43.23-29.74 23.51-13.54 45.31-20.23L410.72-840h138.56l15.59 115.64q24.44 8.9 45.43 20.82 20.98 11.92 40.8 29.05l108.85-45.74 68.92 120.36-96.59 71.69q3.46 13.36 4.18 25.24.72 11.89.72 22.94 0 10.28-1.1 22.09-1.11 11.81-3.87 26.96l95.56 70.31-69.44 122.41-107.23-47.8q-20.48 17.49-42 30.59-21.51 13.11-44.23 19.8L549.28-120H410.72Zm28.15-33.85h81.16l14.76-110.25q30.54-8 55.71-22.45t51.06-39.07l101.88 43.83 39.92-69.13-89.8-66.9q4.34-18.05 6.29-32.81 1.95-14.75 1.95-29.37 0-15.9-1.88-29.88-1.87-13.99-6.36-30.76l91.34-68.44-39.93-69.13-104.17 43.9q-18.83-20.9-49.04-39.14-30.22-18.24-57.73-22.45l-12.9-110.25h-82.18l-12.46 109.48q-31.72 6.31-57.79 21.14-26.06 14.84-51.29 40.38l-102.38-43.06-39.93 69.13 89.54 66.05q-4.85 14.29-6.92 30.29-2.08 16-2.08 33.51 0 15.9 2.08 31.13 2.07 15.23 6.15 30.28l-88.77 66.9 39.93 69.13 101.61-43.13q23.85 24.43 50.17 39.01 26.32 14.58 58.91 22.58l13.15 109.48Zm39.23-229.23q40.72 0 68.82-28.1 28.11-28.1 28.11-68.82 0-40.72-28.11-68.82-28.1-28.1-68.82-28.1-40.28 0-68.6 28.1-28.32 28.1-28.32 68.82 0 40.72 28.32 68.82 28.32 28.1 68.6 28.1ZM480-480Z" />
          </svg>
        </button>
      </div>
      <div className="flex items-center">
       
          <button 
            className="flex justify-center items-center w-10 h-9 hover:bg-background/10" 
            id="minimize"
            onClick={() => window.electron.minimize()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e8eaed"
            >
              <path d="M200-440v-80h560v80H200Z" />
            </svg>
          </button>
          <button 
            className="flex justify-center items-center w-10 h-9 hover:bg-background/10" 
            id="maximize"
            onClick={() => window.electron.maximize()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e8eaed"
            >
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Z" />
            </svg>
          </button>
          <button 
            className="flex justify-center items-center w-10 h-9 hover:bg-red-600" 
            id="close"
            onClick={() => window.electron.close()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
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
