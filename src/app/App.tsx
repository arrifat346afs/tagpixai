import { useState, useEffect } from "react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import Home from "./app-components/Home";
import AuthReq from "./app-components/auth/AuthReq"; // import your verification component
import * as server from "@/sarver/index"; // Import server functions

function App() {
  // Track if user is verified
  // null = not checked yet, false = not verified, true = verified
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored email on app startup
  useEffect(() => {
    const checkStoredEmail = async () => {
      try {
        // Check if there's a stored email
        const storedEmail = await window.electron.getSettings("userEmail");

        if (storedEmail) {
          // Verify the stored email with the server
          const result = await server.checkUserSubscription(storedEmail);

          if (
            result &&
            result.isAuthenticated &&
            result.hasActiveSubscription
          ) {
            // Email is valid, set verified to true
            setIsVerified(true);
            // Also store in electron for quick access
            await window.electron.saveSettings("userEmail", storedEmail);
          } else {
            // Email is invalid or subscription expired, clear it
            await window.electron.saveSettings("userEmail", null);
            setIsVerified(false);
          }
        } else {
          // No stored email, set verified to false
          setIsVerified(false);
        }
      } catch (error) {
        // Error occurred, clear email and set verified to false
        console.error("Error verifying stored email:", error);
        await window.electron.saveSettings("userEmail", null);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredEmail();
  }, []);

  // Handler to update verification status from AuthReq
  // You’ll pass this down to AuthReq to call on success
  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  // Optionally, you can set `isVerified` false initially
  // or keep it null and let AuthReq handle

  // Show loading state while checking stored email
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <TooltipProvider>
        {isVerified ? (
          <Tooltip>
            <Home />
          </Tooltip>
        ) : (
          
          // Pass the callback to AuthReq so it can notify success
          <AuthReq onVerified={handleVerificationSuccess} />
        )}
      </TooltipProvider>
    </div>
  );
}

export default App;
