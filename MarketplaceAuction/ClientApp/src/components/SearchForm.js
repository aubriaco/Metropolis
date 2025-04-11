import BaseCom from "./BaseCom";
import FormInput from "./FormInput";
import { withParamsAndNavigate } from "./WithParamsAndNavigate";

class SearchForm extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            search: {}
        };
        this.submit = this.submit.bind(this);
    }

    submit(e) {
        if(e)
            e.preventDefault();

        this.props.navigate('/search/' + encodeURIComponent(this.state.search.query));
    }

    render() {
        return <form className="search-form" onSubmit={this.submit}>
            <fieldset className="form-group">
                <FormInput type="text" model={this.state.search} name="query" label="Search for item of vehicle" labelAsPlaceholder required />
            </fieldset>
        </form>;
    }
}

export default withParamsAndNavigate(SearchForm);