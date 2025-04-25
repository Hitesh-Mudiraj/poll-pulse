import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import CreatePoll from "./pages/CreatePoll";
import MyPolls from "./pages/MyPolls";
import Discover from "./pages/Discover";
import ViewPoll from "./pages/ViewPoll";
import NotFound from "./pages/not-found";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import { useState } from "react";
import MobileMenu from "./components/MobileMenu";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen">
          <Sidebar isOpen={true} />
          <MobileHeader onMenuToggle={toggleSidebar} />
          <MobileMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Switch>
              <Route path="/" component={Dashboard}/>
              <Route path="/create-poll" component={CreatePoll}/>
              <Route path="/my-polls" component={MyPolls}/>
              <Route path="/discover" component={Discover}/>
              <Route path="/poll/:id" component={ViewPoll}/>
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
