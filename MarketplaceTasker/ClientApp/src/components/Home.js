import React from 'react';
import BaseCom from './BaseCom';
import SearchBar from './SearchBar';

export class Home extends BaseCom {

    render() {
        return (
            <div>
                <SearchBar />
            </div>
        );
    }
}
