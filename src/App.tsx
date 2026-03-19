import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import MobileGuard from "./components/MobileGuard";

// Lazy-loaded pages — split into separate chunks to reduce initial bundle
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RegisterPet = lazy(() => import("./pages/RegisterPet"));
const PetProfile = lazy(() => import("./pages/PetProfile"));
const StorePage = lazy(() => import("./pages/StorePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminPets = lazy(() => import("./pages/AdminPets"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminPageBuilder = lazy(() => import("./pages/AdminPageBuilder"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const PetExpert = lazy(() => import("./pages/PetExpert"));
const PetHealth = lazy(() => import("./pages/PetHealth"));
const DashboardAdoption = lazy(() => import("./pages/DashboardAdoption"));
const DashboardMembership = lazy(() => import("./pages/DashboardMembership"));
const AdoptionPage = lazy(() => import("./pages/AdoptionPage"));
const AdminAdoptions = lazy(() => import("./pages/AdminAdoptions"));
const LostPetsPage = lazy(() => import("./pages/LostPetsPage"));
const DashboardLostReports = lazy(() => import("./pages/DashboardLostReports"));
const AdminLostReports = lazy(() => import("./pages/AdminLostReports"));
const LostFlyerBuilder = lazy(() => import("./pages/LostFlyerBuilder"));
const AdminFlyerTemplates = lazy(() => import("./pages/AdminFlyerTemplates"));
const BusinessDirectory = lazy(() => import("./pages/BusinessDirectory"));
const BusinessProfile = lazy(() => import("./pages/BusinessProfile"));
const DashboardDirectory = lazy(() => import("./pages/DashboardDirectory"));
const AdminDirectory = lazy(() => import("./pages/AdminDirectory"));
const AdminMemberships = lazy(() => import("./pages/AdminMemberships"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminDonations = lazy(() => import("./pages/AdminDonations"));
const DashboardInbox = lazy(() => import("./pages/DashboardInbox"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const PetMapPage = lazy(() => import("./pages/PetMapPage"));

// Lazy-loaded mobile pages
const MobileLayout = lazy(() => import("./components/mobile/MobileLayout"));
const MobileHome = lazy(() => import("./pages/mobile/MobileHome"));
const MobileSearch = lazy(() => import("./pages/mobile/MobileSearch"));
const MobileAdopt = lazy(() => import("./pages/mobile/MobileAdopt"));
const MobileStore = lazy(() => import("./pages/mobile/MobileStore"));
const MobileLostPets = lazy(() => import("./pages/mobile/MobileLostPets"));
const MobileDirectory = lazy(() => import("./pages/mobile/MobileDirectory"));
const MobileDashboard = lazy(() => import("./pages/mobile/MobileDashboard"));
const MobileInbox = lazy(() => import("./pages/mobile/MobileInbox"));
const MobilePetExpert = lazy(() => import("./pages/mobile/MobilePetExpert"));
const MobileMembership = lazy(() => import("./pages/mobile/MobileMembership"));
const MobileScan = lazy(() => import("./pages/mobile/MobileScan"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Desktop routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/pet/:id" element={<PetProfile />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/pet-expert" element={<ProtectedRoute><PetExpert /></ProtectedRoute>} />
              <Route path="/pet-map" element={<PetMapPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/register-pet" element={<ProtectedRoute><RegisterPet /></ProtectedRoute>} />
              <Route path="/dashboard/health" element={<ProtectedRoute><PetHealth /></ProtectedRoute>} />
              <Route path="/dashboard/adoption" element={<ProtectedRoute><DashboardAdoption /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
              <Route path="/dashboard/lost-reports" element={<ProtectedRoute><DashboardLostReports /></ProtectedRoute>} />
              <Route path="/dashboard/flyer-builder" element={<ProtectedRoute><LostFlyerBuilder /></ProtectedRoute>} />
              <Route path="/dashboard/directory" element={<ProtectedRoute><DashboardDirectory /></ProtectedRoute>} />
              <Route path="/dashboard/membership" element={<ProtectedRoute><DashboardMembership /></ProtectedRoute>} />
              <Route path="/dashboard/inbox" element={<ProtectedRoute><DashboardInbox /></ProtectedRoute>} />
              <Route path="/adopt" element={<AdoptionPage />} />
              <Route path="/directory" element={<BusinessDirectory />} />
              <Route path="/directory/:id" element={<BusinessProfile />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/lost-pets" element={<LostPetsPage />} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/pets" element={<ProtectedRoute adminOnly><AdminPets /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/adoptions" element={<ProtectedRoute adminOnly><AdminAdoptions /></ProtectedRoute>} />
              <Route path="/admin/lost-reports" element={<ProtectedRoute adminOnly><AdminLostReports /></ProtectedRoute>} />
              <Route path="/admin/flyer-templates" element={<ProtectedRoute adminOnly><AdminFlyerTemplates /></ProtectedRoute>} />
              <Route path="/admin/directory" element={<ProtectedRoute adminOnly><AdminDirectory /></ProtectedRoute>} />
              <Route path="/admin/memberships" element={<ProtectedRoute adminOnly><AdminMemberships /></ProtectedRoute>} />
              <Route path="/admin/contacts" element={<ProtectedRoute adminOnly><AdminContacts /></ProtectedRoute>} />
              <Route path="/admin/donations" element={<ProtectedRoute adminOnly><AdminDonations /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/page-builder" element={<ProtectedRoute adminOnly><AdminPageBuilder /></ProtectedRoute>} />

              {/* Mobile routes */}
              <Route path="/m" element={<MobileGuard />}>
                <Route element={<MobileLayout />}>
                <Route index element={<MobileHome />} />
                <Route path="search" element={<MobileSearch />} />
                <Route path="scan" element={<MobileScan />} />
                <Route path="adopt" element={<MobileAdopt />} />
                <Route path="store" element={<MobileStore />} />
                <Route path="lost-pets" element={<MobileLostPets />} />
                <Route path="directory" element={<MobileDirectory />} />
                <Route path="pet-expert" element={<MobilePetExpert />} />
                <Route path="membership" element={<MobileMembership />} />
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<ProtectedRoute><MobileDashboard /></ProtectedRoute>} />
                <Route path="dashboard/inbox" element={<ProtectedRoute><MobileInbox /></ProtectedRoute>} />
                <Route path="dashboard/register-pet" element={<ProtectedRoute><RegisterPet /></ProtectedRoute>} />
                <Route path="dashboard/health" element={<ProtectedRoute><PetHealth /></ProtectedRoute>} />
                <Route path="dashboard/adoption" element={<ProtectedRoute><DashboardAdoption /></ProtectedRoute>} />
                <Route path="dashboard/lost-reports" element={<ProtectedRoute><DashboardLostReports /></ProtectedRoute>} />
                <Route path="dashboard/directory" element={<ProtectedRoute><DashboardDirectory /></ProtectedRoute>} />
                <Route path="dashboard/membership" element={<ProtectedRoute><DashboardMembership /></ProtectedRoute>} />
                <Route path="dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
