import { useLocation } from "react-router-dom";

export default function withLocation(Component) {
    return props => <Component {...props} location={useLocation()} />;
}