import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import Home from "./app-components/Home";

function App() {
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <Home />
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default App;
