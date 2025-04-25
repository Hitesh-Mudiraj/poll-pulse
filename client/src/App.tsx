import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import MyPolls from "@/pages/my-polls";
import Discover from "@/pages/discover";
import About from "@/pages/about";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { isLoggedIn } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-polls">
        {isLoggedIn ? <MyPolls /> : <Home />}
      </Route>
      <Route path="/discover" component={Discover} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
