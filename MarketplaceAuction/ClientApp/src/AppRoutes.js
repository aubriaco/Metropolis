import AboutPage from "./components/AboutPage";
import AdminApplianceListings from "./components/AdminApplianceListings";
import AdminAuctionPreview from "./components/AdminAuctionPreview";
import AdminAuditLog from "./components/AdminAuditLog";
import AdminVehicleListings from "./components/AdminVehicleListings";
import Articles from "./components/Articles";
import AuctionView from "./components/AuctionView";
import Home from "./components/Home";
import ListingQuestions from "./components/ListingQuestions";
import Listings from "./components/Listings";
import Login from "./components/Login";
import Logout from "./components/Logout";
import My from "./components/My";
import MyProfile from "./components/MyProfile";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Sell from "./components/Sell";
import SellAppliance from "./components/SellAppliance";
import SellSelect from "./components/SellSelect";
import SellVehicle from "./components/SellVehicle";
import TOS from "./components/TOS";
import Validate from "./components/Validate";
import WalletPage from "./components/WalletPage";

const AppRoutes = [
    {
        index: true,
        element: <Articles />
    },
    {
        path: '/vehicles',
        element: <Home />
    },
    {
        path: '/articles',
        element: <Articles />
    },
    {
        path: '/auction/vehicle/:id',
        element: <AuctionView />
    },
    {
        path: '/auction/article/:id',
        element: <AuctionView type="appliance" />
    },
    {
        path: '/auction/:id',
        element: <AuctionView />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/home/login',
        element: <Home showLoginModal />
    },
    {
        path: '/home/signup',
        element: <Home showSignupModal />
    },
    {
        path: '/home/post-signup',
        element: <Home showPostSignupModal />
    },
    {
        path: '/home/register-bid',
        element: <Home showRegisterCardModal />
    },
    {
        path: '/reset-password/:code',
        element: <Sell showSetPassword />
    },
    {
        path: '/search/:query',
        element: <Home search />
    },
    {
        path: '/about',
        element: <AboutPage />
    },
    {
        path: '/about/:section',
        element: <AboutPage />
    },
    {
        path: '/sell',
        element: <Sell />
    },
    {
        path: '/login',
        element: <Home showLoginModal />
    },
    {
        path: '/signup',
        element: <Home showSignupModal />
    },
    {
        path: '/logout',
        element: <Logout />
    },
    {
        path: '/sell/select',
        element: <SellSelect />
    },
    {
        path: '/sell/vehicle',
        element: <SellVehicle />
    },
    {
        path: '/sell/appliance',
        element: <SellAppliance />
    },
    {
        path: '/my',
        element: <My />
    },
    {
        path: '/my/profile',
        element: <MyProfile />
    },
    {
        path: '/my/listings',
        element: <Listings />
    },
    {
        path: '/my/questions',
        element: <ListingQuestions />
    },
    {
        path: '/my/wallet',
        element: <WalletPage />
    },
    {
        path: '/my/verify-email/:code',
        element: <Validate />
    },
    {
        path: '/admin/listings',
        element: <AdminVehicleListings />
    },
    {
        path: '/admin/listings/vehicle',
        element: <AdminVehicleListings />
    },
    {
        path: '/admin/listings/appliance',
        element: <AdminApplianceListings />
    },
    {
        path: '/admin/listings/item/:id',
        element: <AdminAuctionPreview type="vehicle" />
    },
    {
        path: '/admin/listings/appliance/item/:id',
        element: <AdminAuctionPreview type="appliance" />
    },
    {
        path: '/admin/auditlog',
        element: <AdminAuditLog />
    },
    {
        path: '/tos',
        element: <TOS />
    },
    {
        path: '/privacy-policy',
        element: <PrivacyPolicy />
    }
];

export default AppRoutes;
