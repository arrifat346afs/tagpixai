import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import Home from "./_components/Home";

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
