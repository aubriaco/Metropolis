/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import ReactPaginate from 'react-paginate';
import { withParamsAndNavigate } from "./WithParamsAndNavigate";


class Paging extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            pageCount: props.pageCount,
            currentPage: props.currentPage - 1
        };
        this.nextLoc = null;
        this.baseLoc = props.baseLoc;
        this.onPageClick = props.onPageClick;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.pageCount !== this.props.pageCount) {
            this.setState({ pageCount: this.props.pageCount });
        }
        if (prevState.currentPage !== this.props.currentPage - 1) {
            this.setState({ currentPage: this.props.currentPage - 1 });
        }
    }



    render() {

        return (<ReactPaginate
            containerClassName="pagination"
            pageClassName="page-item"
            breakClassName="page-item"
            activeClassName="page-item active"
            previousClassName="page-item"
            nextClassName="page-item"
            pageLinkClassName="page-link"
            breakLinkClassName="page-link"
            activeLinkClassName="page-link"
            previousLinkClassName="page-link"
            nextLinkClassName="page-link"
            breakLabel="..."
            nextLabel="Next &gt;"
            onPageChange={(e) => { if (this.onPageClick) { var r = this.onPageClick(e); if (r) return; } this.props.navigate(this.baseLoc + (e.selected + 1)); }}
            pageRangeDisplayed={5}
            pageCount={this.state.pageCount}
            forcePage={this.state.currentPage}
            previousLabel="&lt; Previous"
            renderOnZeroPageCount={null}
        />);
    }
}
export default withParamsAndNavigate(Paging);
