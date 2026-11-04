import BaseCom from "./BaseCom";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class SearchForm extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            search: {}
        };
        this.search = this.search.bind(this);
    }

    search(e) {
        if (e) e.preventDefault();
        if (!this.state.search || !this.state.search.query)
            return;
        this.props.navigate('/search/' + encodeURIComponent(this.state.search.query));
        if (this.props.onSearch)
            this.props.onSearch(this.state.search);
    }

    render() {
        return <><div className="c-search me-2">
            <form onSubmit={this.search}>
                <input type="text" name="query" placeholder="Search..." className="form-control bg-dark text-light" onChange={e => this.setState({ search: { query: e.target.value } })} />
            </form>
        </div>
        </>;
    }
}

export default withParamsAndNavigate(SearchForm);
