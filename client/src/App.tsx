import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page-fixed";
import ArticlePage from "@/pages/article-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageArticles from "@/pages/admin/manage-articles";
import CreateArticle from "@/pages/admin/create-article";
import ManageCategories from "@/pages/admin/manage-categories";
import ManageAdvertisements from "@/pages/admin/manage-advertisements";
import CreateAdvertisement from "@/pages/admin/create-advertisement";
import ClientDashboard from "@/pages/client-dashboard";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import TermsOfServicePage from "@/pages/terms-of-service";
import CookiesPolicyPage from "@/pages/cookies-policy";
import AdvertisePage from "@/pages/advertise";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import ProfilePage from "@/pages/profile";
import SitemapPage from "@/pages/sitemap";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { DatabaseStatusChecker } from "@/components/database-status-checker";


function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/cookies-policy" component={CookiesPolicyPage} />
      <Route path="/sitemap" component={SitemapPage} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/client-dashboard" component={ClientDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/articles" component={ManageArticles} />
      <ProtectedRoute path="/admin/articles/create" component={CreateArticle} />
      <ProtectedRoute path="/admin/articles/edit/:id" component={CreateArticle} />
      <ProtectedRoute path="/admin/categories" component={ManageCategories} />
      <ProtectedRoute path="/admin/manage-advertisements" component={ManageAdvertisements} />
      <ProtectedRoute path="/admin/advertisements/create" component={CreateAdvertisement} />
      <ProtectedRoute path="/admin/advertisements/edit/:id" component={CreateAdvertisement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-backgroundGray max-w-screen-xl mx-auto">
            <Header />
            <main className="flex-grow">
              <DatabaseStatusChecker>
                <Router />
              </DatabaseStatusChecker>
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
