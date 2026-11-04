import BaseCom from "./BaseCom";
import L from "./Lang";
import Logo from "./Logo";
import { Link } from "react-router-dom";

export default class Footer extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
    }


    render() {
        return <footer className="mb-auto pt-5">
            <div className="container mb-5">
                <div className="row">
                    <div className="col-md-12 text-center">
                        Copyright &copy; {new Date().getFullYear()}<br />
                        <L>All rights reserved.</L>
                    </div>
                </div>
            </div>
        </footer>;
    }
}