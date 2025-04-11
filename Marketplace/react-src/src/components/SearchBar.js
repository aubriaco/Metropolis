/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { getLang } from "../shared/GLang";
import BaseCom from "./BaseCom"
import { withParamsAndNavigate } from "./WithParamsAndNavigate"

class SearchBar extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            search: {
                terms: this.props.params.terms ?? ''
            }
        };
        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        if(this.props.params.terms)
            this.setState({ search: {...this.state.search, terms: this.props.params.terms.replace(/-/g, ' ') ?? ''}});
    }

    componentDidUpdate(prevProps) {
        if(this.props.params.terms !== prevProps.params.terms)
            this.setState({ search: {...this.state.search, terms: this.props.params.terms ? this.props.params.terms.replace(/-/g, ' ') : ''}});
    }

    submit(e) {
        if (e) e.preventDefault();
        if(this.state.search.terms)
            this.props.navigate('/s/' + encodeURIComponent(this.state.search.terms));
        else
            this.props.navigate('/');
    }

    render() {
        return <form onSubmit={this.submit}>
            <div className="input-group flex-nowrap pb-3 pb-xl-0">
                <input name="terms" placeholder={getLang('Search for Products')} type="text" value={this.state.search.terms} className="form-control w-100 border-dark border border-3" onChange={e => this.setState({ search: { ...this.state.search, terms: e.target.value } })} />
                <button className="btn btn-dark btn-ecomm border-3" type="submit"> {getLang('Search')} </button>
            </div>
        </form>;
    }
}

export default withParamsAndNavigate(SearchBar);