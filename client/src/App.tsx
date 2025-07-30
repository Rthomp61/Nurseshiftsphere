import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { NotificationToast } from "@/components/notification-toast";
import Landing from "@/pages/landing";
import NurseDashboard from "@/pages/nurse-dashboard";
import CoordinatorDashboard from "@/pages/coordinator-dashboard";
import NotFound from "@/pages/not-found";
import UserFlowDemo from "@/pages/user-flow-demo";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/">
            {(user as any)?.role === 'coordinator' ? <CoordinatorDashboard /> : <NurseDashboard />}
          </Route>
          <Route path="/user-flow" component={UserFlowDemo} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationToast />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
