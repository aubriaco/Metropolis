import MyProfile from "./components/MyProfile";
import CarProfile from "./components/CarProfile";
import { Home } from "./components/Home";
import MyGarage from "./components/MyGarage";
import AdminRaceTrack from "./components/AdminRaceTrack";
import RaceTracks from "./components/RaceTracks";
import RaceTrackProfile from "./components/RaceTrackProfile";
import UserProfile from "./components/UserProfile";
import Logout from "./components/Logout";
import Validate from "./components/Validate";
import SearchResults from "./components/SearchResults";

const AppRoutes = [
    {
        index: true,
        element: <Home />
    },
    {
        path: '/search/:q',
        element: <SearchResults />
    },
    {
        path: '/race-tracks',
        element: <RaceTracks />
    },
    {
        path: '/race-tracks/:id',
        element: <RaceTrackProfile />
    },
    {
        path: '/my/garage',
        element: <MyGarage />
    },
    {
        path: '/my/profile',
        element: <UserProfile my />
    },
    {
        path: '/u/:username',
        element: <UserProfile />
    },
    {
        path: '/garage/:username/:id',
        element: <CarProfile />
    },
    {
        path: '/admin/race-track',
        element: <AdminRaceTrack />
    },
    {
        path: '/my/verify-email/:code',
        element: <Validate />
    },
    {
        path: '/logout',
        element: <Logout />
    }
];

export default AppRoutes;
