import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as server from "@/sarver/index";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CreditCard, LogOut, User } from "lucide-react";

interface Subscription {
  status: string;
  renewalDate: string;
  amount: number;
  currency: string;
  interval: string;
  startedAt: string;
  cancelAtPeriodEnd: boolean;
}

interface Profile {
  name: string;
  email: string;
  createdAt: string;
}

interface UserData {
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  email: string;
  userId: string;
  subscription?: Subscription;
  profile?: Profile;
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await window.electron.getSettings("userEmail");
        if (!email) {
          setError("No user email found. Please log in again.");
          setLoading(false);
          return;
        }

        const data = await server.checkUserSubscription(email);
        if (!data) {
          setError("Failed to fetch user data");
          await window.electron.saveSettings("userEmail", null); // Clear invalid email
          setLoading(false);
          return;
        }

        if (!data.isAuthenticated || !data.hasActiveSubscription) {
          setError("Your session has expired. Please verify your email again.");
          await window.electron.saveSettings("userEmail", null); // Clear invalid session
          setLoading(false);
          return;
        }

        setUserData(data);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("isAuthenticated", JSON.stringify(data.isAuthenticated));
        localStorage.setItem("hasActiveSubscription", JSON.stringify(data.hasActiveSubscription));
        if (data.subscription) {
          localStorage.setItem("subscription", JSON.stringify(data.subscription));
        }
        if (data.profile) {
          localStorage.setItem("profile", JSON.stringify(data.profile));
        }
        setLoading(false);
      } catch (err) {
        setError("An error occurred while fetching user data");
        localStorage.removeItem("userEmail"); // Clear on error
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    // Remove from localStorage
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("hasActiveSubscription");
    localStorage.removeItem("subscription");
    localStorage.removeItem("profile");

    // Also remove from Electron store
    try {
      await window.electron.saveSettings("userEmail", null);
    } catch (error) {
      console.error("Failed to clear user email from Electron store:", error);
      // Continue with logout even if this fails
    }

    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const UserInfoCard = () => (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-4 h-4 mr-2" />
          User Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-between">
          <p className="text-sm font-medium">Name:</p>
          <p className="text-sm">{userData?.profile?.name || "N/A"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">Email:</p>
          <p className="text-sm">{userData?.email || "N/A"}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">Created:</p>
          <p className="text-sm">
            {userData?.profile?.createdAt
              ? formatDate(userData.profile.createdAt)
              : "N/A"}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-medium">User ID:</p>
          <p className="text-sm truncate" title={userData?.userId}>
            {userData?.userId || "N/A"}
          </p>
        </div>
        <Button variant="outline" className="mt-4" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </CardContent>
    </Card>
  );

  const SubscriptionCard = () => (
    <Card className="w-full bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 mr-2" />
          Subscription Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {userData?.subscription ? (
          <>
            <div className="flex justify-between">
              <p className="text-sm font-medium">Status:</p>
              <Badge
                variant={
                  userData.subscription.status === "active"
                    ? "default"
                    : "destructive"
                }
              >
                {userData.subscription.status.charAt(0).toUpperCase() +
                  userData.subscription.status.slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium">Plan Amount:</p>
              <p className="text-sm">
                {formatCurrency(
                  userData.subscription.amount / 100,
                  userData.subscription.currency
                )}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium">Billing Interval:</p>
              <p className="text-sm">{userData.subscription.interval}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm font-medium">Next Billing:</p>
              <p className="text-sm">
                {formatDate(userData.subscription.renewalDate)}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm">No subscription data available.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex overflow-hidden justify-center p-4 space-y-4 gap-4">
      <UserInfoCard />
      {userData?.subscription && <SubscriptionCard />}
    </div>
  );
};

export default UserProfile;
