import Cart from "./components/Cart";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import Connect from "./components/Connect";
import Login from "./components/Login";
import Logout from "./components/Logout";
import ManageMenu from "./components/ManageMenu";
import ManagePage from "./components/ManagePage";
import ManageQR from "./components/ManageQR";
import ManageTables from "./components/ManageTables";
import MenuCategoryEdit from "./components/MenuCategoryEdit";
import MenuItemEdit from "./components/MenuItemEdit";
import MenuItemView from "./components/MenuItemView";
import MenuView from "./components/MenuView";
import Order from "./components/Order";
import Orders from "./components/Orders";
import Pricing from "./components/Pricing";
import SetPassword from "./components/SetPassword";
import SignUp from "./components/SignUp";
import TableEdit from "./components/TableEdit";
import Validate from "./components/Validate";
import VendorSettings from "./components/VendorSettings";
import PrivacyPolicy from "./components/PrivacyPolicy";
import EULA from "./components/EULA";
import Wallet from "./components/Wallet";
import Subscription from "./components/Subscription";
import About from "./components/About";
import Contact from "./components/Contact";

const AppRoutes = [
    {
        index: true,
        path: '/',
        element: <Home />,
        front: true
    },
    {
        path: '/pricing',
        element: <Pricing />,
        front: true
    },
    {
        path: '/about',
        element: <About />,
        front: true
    },
    {
        path: '/contact',
        element: <Contact />,
        front: true
    },
    {
        path: '/signup',
        element: <SignUp />,
        front: true
    },
    {
        path: '/signup/:data',
        basePath: '/signup',
        element: <SignUp />,
        front: true
    },
    {
        path: '/eula',
        element: <EULA />,
        front: true
    },
    {
        path: '/privacy-policy',
        element: <PrivacyPolicy />,
        front: true
    },
    {
        path: '/my/verify-email/:code',
        element: <Validate />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/logout',
        element: <Logout />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/reset-password/:code',
        element: <SetPassword />
    },
    {
        path: '/qr/:qr',
        element: <MenuView />
    },
    {
        path: '/qr/:qr/category/:categoryID',
        element: <MenuView />
    },
    {
        path: '/qr/:qr/category/:categoryID/item/:itemID',
        element: <MenuItemView />
    },
    {
        path: '/qr/:qr/cart',
        element: <Cart />
    },
    {
        path: '/qr/:qr/order/:orderMasterID',
        element: <Order />
    },
    {
        path: '/wallet',
        element: <Wallet />
    },
    {
        path: '/orders',
        element: <Orders />
    },
    {
        path: '/orders/:orderMasterID',
        element: <Order manageView />
    },
    {
        path: '/manage/orders',
        element: <Orders />
    },
    {
        path: '/manage',
        element: <ManagePage mainView />
    },
    {
        path: '/manage/subscription',
        element: <Subscription />
    },
    {
        path: '/manage/settings',
        element: <VendorSettings />
    },
    {
        path: '/manage/connect',
        element: <Connect />
    },
    {
        path: '/manage/menu',
        element: <ManageMenu />
    },
    {
        path: '/manage/menu/category/:categoryID',
        element: <ManageMenu />
    },
    {
        path: '/manage/menu/category/:categoryID/edit',
        element: <MenuCategoryEdit />
    },
    {
        path: '/manage/menu/category/:categoryID/new-item',
        element: <MenuItemEdit />
    },
    {
        path: '/manage/menu/category/:categoryID/item/:itemID',
        element: <MenuItemEdit />
    },
    {
        path: '/manage/menu/new-category',
        element: <MenuCategoryEdit />
    },
    {
        path: '/manage/tables',
        element: <ManageTables />
    },
    {
        path: '/manage/tables/new',
        element: <TableEdit />
    },
    {
        path: '/manage/tables/:tableID/edit',
        element: <TableEdit />
    },
    {
        path: '/manage/qr',
        element: <ManageQR />
    }
];

export default AppRoutes;
