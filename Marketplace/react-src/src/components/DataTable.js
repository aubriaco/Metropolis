/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import { Link } from "react-router-dom";
import BaseCom from "./BaseCom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import FormInput from "./FormInput";
import Globals from "../shared/Globals";

export default class DataTable extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: props.data,
            columns: [],
            filterValues: {},
            showFilters: props.showFilters,
            showCheckboxes: props.showCheckboxes,
            totalCount: props.totalCount
        };
        var n = 0;
        props.columns.forEach((i) => {
            if (typeof (i) == 'string')
                this.state.columns.push({ key: n, name: i, title: i, asc: false });
            else {
                i.key = n;
                if (i.asc === undefined)
                    i.asc = false;
                this.state.columns.push(i);
            }
            n++;
        });
        this.onFilter = props.onFilter;
        this.onSort = props.onSort;
        this.filters = props.filters;
        this.getFilterByName = this.getFilterByName.bind(this);
        if (this.filters) {
            var f;
            this.state.columns.forEach(i => {
                // eslint-disable-next-line no-cond-assign
                if (f = this.getFilterByName(i.name))
                    i.filter = f;
            });
        }
        this.processLink = this.processLink.bind(this);
        this.setSort = this.setSort.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.toggleCheckbox = this.toggleCheckbox.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data != this.props.data) {
            this.setState({ data: this.props.data });
        }
        if (prevProps.totalCount != this.props.totalCount) {
            this.setState({ totalCount: this.props.totalCount });
        }
        if (prevProps.loading != this.props.loading) {
            this.setState({ loading: this.props.loading });
        }
        if (prevProps.filters != this.props.filters) {
            var f;
            this.filters = this.props.filters;
            this.state.columns.forEach(i => {
                // eslint-disable-next-line no-cond-assign
                if (f = this.getFilterByName(i.name))
                    i.filter = f;
            });
            this.setState({ filters: this.props.filters });
        }
        if(prevProps.columns !== this.props.columns) {
            this.setState({ columns: this.props.columns });
        }
        if (prevProps.showFilters != this.props.showFilters)
            this.setState({ showFilters: this.props.showFilters });
        if (prevProps.showCheckboxes != this.props.showCheckboxes)
            this.setState({ showCheckboxes: this.props.showCheckboxes });

    }

    processLink(loc, row) {
        var rg = /\/:([^\/]+)/g;
        var matches = rg.exec(loc);
        if (matches === null)
            return loc;
        if (matches.length > 1) {
            if (row[matches[1]] !== undefined && row[matches[1]] !== null)
                loc = loc.replace(matches[0], '/' + row[matches[1]]);
        }
        return loc;
    }

    setSort(col) {

        this.state.columns.forEach(i => {
            if (i.key != col.key) {
                i.sort = false;
                i.asc = false;
            }
        });

        col.sort = true;
        col.asc = !col.asc;
        this.onSort(col);
    }

    setFilter(e, col) {
        col.filter.value = e;
        if (this.onFilter)
            this.onFilter(col);
        this.setState({ filterValues: { ...this.state.filterValues, [col.filter.name]: e } });
        console.log({ ...this.state.filterValues, [col.filter.name]: e });
    }

    getFilterByName(name) {
        var r = null;
        this.filters.forEach(i => {
            if (i.name === name)
                r = i;
        });
        return r;
    }

    toggleCheckbox(row) {
        row.selected = !row.selected;
        this.setState({ data: this.state.data });
    }

    format(col, data, row) {
        try {
            if (col.valueFunc)
                return col.valueFunc(row);
            if (col.format === 'datetime')
                return Globals.toMDYHMLocalDateString(new Date(Date.parse(data)));
            else if (col.format === 'date')
                return Globals.toMDYLocalDateString(new Date(Date.parse(data)));
            else if (col.format === 'bool')
                return data ? 'Yes' : 'No';
            else if(col.format === 'currency')
                return Globals.formatPrice(data);
        }
        catch { }
        return data;
    }

    render() {
        return (<>
            {/*this.state.columns.map((obj) => {
                if (obj.tooltip)
                    return (<Tooltip key={obj.key} anchorSelect={'.tt-' + obj.key} place="top" style={{ zIndex: 999 }}>
                        {obj.tooltip}
                    </Tooltip>)
                else
                    return '';
            })*/}

            {this.filters && this.state.showFilters ? <div className="p-3">
                <div className="row">
                    {this.state.columns.map((obj) => {
                        if (obj.filter) {
                            return <div className="col-md-2" key={obj.key}>
                                {obj.filter.type === 'select' ? <>
                                    <label className="form-label">{obj.filter.title}</label>
                                    <select className="form-control" onChange={e => this.setFilter(e.target.value, obj)}>
                                        <option value="">Select {obj.filter.title}</option>
                                        {obj.filter.options.map(i => <option key={i.id} value={i.id} selected={i.id === this.state.filterValues[obj.filter.name]}>{i.name}</option>)}
                                    </select></> : <FormInput model={obj.filter} label={obj.filter.title} name="value" type={obj.filter.type} options={obj.filter.options} onChange={e => { this.setFilter(e, obj) }} />}
                            </div>;
                        }
                        return null;
                    }
                    )}
                </div>

            </div> : ''}

            {this.state.totalCount !== undefined ? <div className="ps-3 pe-3 mb-3">There {this.state.totalCount === 1 ? 'is' : 'are'} a total of {this.state.totalCount} {this.state.totalCount === 1 ? 'item' : 'items'}.</div> : ''}

            <table className="table c-datatable">
                <thead>
                    <tr>
                        {this.state.showCheckboxes ? <th style={{ width: '25px' }}></th> : ''}
                        {this.state.columns.map((obj) => (

                            <th style={{ width: obj.width ? obj.width : (obj.icon ? '25px' : 'auto') }} key={obj.key} className={obj.className}>{obj.icon ? '' : (this.onSort ? <a href="#" className="pointer" onClick={e => { e.preventDefault(); this.setSort(obj); }}>{obj.title} {obj.sort ? (obj.asc ? <FontAwesomeIcon icon={fa.faCaretDown} /> : <FontAwesomeIcon icon={fa.faCaretUp} />) : ''}</a> : obj.title)}</th>)

                        )}
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.map((row) => (
                        <tr key={row.id} className={this.state.loading ? 'loading' : row.className} onClick={this.props.onRowClick ? () => this.props.onRowClick(row) : null}>
                            {this.state.showCheckboxes ? <td><div className="form-check"><input type="checkbox" className="form-check-input" onChange={(e) => { this.toggleCheckbox(row); }} checked={row.selected ? true : false} /></div></td> : ''}
                            {this.state.columns.map((col) => (
                                <td key={col.key} className={(col.className ?? '') + (col.icon ? ' text-center' : '')} style={col.style} onClick={col.onClick ? e => { e.preventDefault(); col.onClick(row); } : null}>
                                    {col.button ? <button type="button" className="btn btn-primary text-nowrap" onClick={() => col.onClick(row)}>{col.icon ? <><FontAwesomeIcon icon={fa['fa' + col.icon]} /> </> : ''}{col.button}</button>
                                        :
                                        col.name ? (<>{col.onClick ? (<a className={'pointer tt-' + col.key} title={col.linkTitle}  onClick={(e) => { e.preventDefault(); col.onClick(row, e); }} title={col.tootlip}>{this.format(col, col.name && row[col.name] ? row[col.name] : '', row)}</a>) : (col.link ? (col.linkTarget ? <a href={this.processLink(col.link, row)} title={col.linkTitle ?? col.tooltip} className={'tt-' + col.key} target={col.linkTarget}>{this.format(col, col.name && row[col.name] ? row[col.name] : '', row)}</a> : <Link to={this.processLink(col.link, row)} title={col.linkTitle ?? col.tooltip} className={'tt-' + col.key}>{this.format(col, col.name && row[col.name] ? row[col.name] : '', row)}</Link>) : (<>{this.format(col, col.name && row[col.name] ? row[col.name] : '', row)}</>))}</>) : (col.icon ? (
                                            col.onClick ? (<a className={'pointer tt-' + col.key} title={col.linkTitle} onClick={(e) => { e.preventDefault(); col.onClick(row, e); }} title={col.tooltip}><FontAwesomeIcon icon={fa['fa' + col.icon]} /></a>) : (col.linkTarget ? <a href={this.processLink(col.link, row)} title={col.linkTitle ?? col.tooltip} className={'tt-' + col.key} target={col.linkTarget}><FontAwesomeIcon icon={fa['fa' + col.icon]} /></a> : <Link to={this.processLink(col.link, row)} title={col.linkTitle ?? col.tooltip} className={'tt-' + col.key}><FontAwesomeIcon icon={fa['fa' + col.icon]} /></Link>)
                                        ) : '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>)
    }
}