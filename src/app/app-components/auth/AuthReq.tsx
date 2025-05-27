import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import * as server from "@/sarver/index"; // your server API logic
import AuthNav from "./AuthNav";

interface AuthReqProps {
  onVerified: () => void;
}

const AuthReq: React.FC<AuthReqProps> = ({ onVerified }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const verifyEmail = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await server.checkUserSubscription(email);

      if (!result.isAuthenticated) {
        setError("Email not found or not registered.");
        setSuccess(false);
        return;
      }

      if (!result.hasActiveSubscription) {
        setError("You do not have an active subscription.");
        setSuccess(false);
        return;
      }      
      // Also store in Electron's store for main process access
      try {
        await window.electron.saveSettings("userEmail", email);
      } catch (storeErr) {
        console.error("Failed to save email to Electron store:", storeErr);
        // Continue even if this fails, as we have the email in localStorage
      }

      setSuccess(true);
      onVerified(); // Notify parent component
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden h-screen">
      <AuthNav />
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              Enter your email address to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <p className="text-green-600 text-sm">
                  ✔️ Verified successfully!
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={verifyEmail} disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthReq;
