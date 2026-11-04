import { qreq } from '../shared/qrequest';
import BaseCom from './BaseCom';
import FormInput from './FormInput';
import Icon from './Icon';

export default class SearchBar extends BaseCom {
    constructor(props) {
        super(props);
        this.state = {
            info: {}
        };
    }

    componentDidMount() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
                qreq.get('/api/geo/address?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude, j => {
                    if (j.item)
                        console.log('Address :', j.item);
                });
            });
        }
    }

    render() {
        return <div className="SearchBar">
            <FormInput model={this.state.info} name="terms" label="What are you looking for?" type="text" size="lg" labelAsPlaceholder preAddon={<Icon icon="faMagnifyingGlass" />} />
        </div>;
    }
}