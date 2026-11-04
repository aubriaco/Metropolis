import Logout from "./components/Logout";
import { Home } from "./components/Home";
import TableList from "./components/TableList";
import TableManage from "./components/TableManage";
import EditData from "./components/EditData";
import AdminVehicleListings from "./components/Auction/AdminVehicleListings";
import AdminApplianceListings from "./components/Auction/AdminApplianceListings";
import AdminAuctionPreview from "./components/Auction/AdminAuctionPreview";
import AdminAuditLog from "./components/Auction/AdminAuditLog";

const AppRoutes = [
    {
        index: true,
        element: <Home />
    },
    {
        path: '/logout',
        element: <Logout />
    },
    {
        path: '/manage',
        element: <TableList />
    },
    {
        path: '/manage/:name',
        element: <TableManage />
    },
    {
        path: '/manage/:name/new',
        element: <EditData />
    },
    {
        path: '/manage/:name/:id',
        element: <EditData />
    },
    // Auction
    {
        path: '/auction/vehicle/list',
        element: <AdminVehicleListings />
    },
    {
        path: '/auction/appliance/list',
        element: <AdminApplianceListings />
    },
    {
        path: '/auction/log',
        element: <AdminAuditLog />
    },
    {
        path: '/auction/vehicle/item',
        element: <AdminAuctionPreview type="vehicle" />
    },
    {
        path: '/auction/appliance/item',
        element: <AdminAuctionPreview type="appliance" />
    }
];

export default AppRoutes;
