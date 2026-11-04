import {
    useLocation
} from "react-router-dom";

export default function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        return (
            <Component
                {...props}
                location={useLocation()}
            />
        );
    }

    return ComponentWithRouterProp;
}