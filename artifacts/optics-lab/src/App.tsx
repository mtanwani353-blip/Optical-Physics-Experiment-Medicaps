import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Diffraction from "@/pages/Diffraction";
import Grating from "@/pages/Grating";
import FiberNA from "@/pages/FiberNA";
import NewtonsRings from "@/pages/NewtonsRings";
import BeamDivergence from "@/pages/BeamDivergence";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/diffraction" component={Diffraction} />
        <Route path="/grating" component={Grating} />
        <Route path="/fiber-na" component={FiberNA} />
        <Route path="/newtons-rings" component={NewtonsRings} />
        <Route path="/beam-divergence" component={BeamDivergence} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
