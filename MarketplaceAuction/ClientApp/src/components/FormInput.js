//v3
import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fa from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import BaseCom from "./BaseCom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InputMask from 'react-input-mask';
import { DateRangePicker } from 'rsuite';
import { qreq } from "../shared/qrequest";
import Alert from "./Alert";
import Globals from "../shared/Globals";
import L from "./Lang";

export default class FormInput extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            model: props.model,
            value: '',
            numberValue: 0,
            boolValue: false,
            dateValue: new Date(),
            options: [],
            subModel: {},
            searchList: null,
            selectedList: [],
            dateAllowTime: props.dateAllowTime ?? false,
            preInput: props.preInput,
            disabled: props.disabled,
            min: props.min ?? 0,
            max: props.max ?? 100,
            step: props.step ?? 1
        };
        this.id = uuidv4();
        this.name = props.name;
        this.label = props.label;
        this.preAddon = props.preAddon;
        this.postpend = props.postpend;
        this.labelAsPlaceholder = props.labelAsPlaceholder ? props.labelAsPlaceholder : false;
        if (this.state.model[this.name]) {
            this.state.value = this.state.model[this.name];
            if (typeof this.state.model[this.name] == 'boolean') {
                this.state.boolValue = this.state.model[this.name];
            }
        }
        if (props.type)
            this.type = props.type;
        else
            this.type = 'text';

        this.state.options = props.options;
        this.useObjectValue = props.useObjectValue ?? false;

        if (this.type === 'number') {
            try {
                this.state.value = this.state.model[this.name];
                this.state.numberValue = Number(this.state.value);
            }
            catch { }
        }
        else if (this.type === 'date' || this.type === 'dateselect') {
            var c = -1;
            var dv = this.state.value;
            if (!dv)
                dv = Globals.toISODateString(new Date());
            else if ((c = dv.indexOf(' ')) >= 0) {
                dv = dv.substring(0, c);
            }
            var d = new Date(Date.parse(dv));
            this.state.dateValue = d;
            this.state.subModel.YYYY = String(d.getFullYear());
            this.state.subModel.MM = String(d.getMonth() + 1).padStart(2, '0');
            this.state.subModel.DD = String(d.getDate()).padStart(2, '0');

        }
        else if (this.type === 'multisearch') {
            if (props.model[props.name])
                this.state.selectedList = props.model[props.name];
        }
        else if (this.type === 'multiselect' && Array.isArray(this.state.value)) {
            var bringToTop = [];
            this.state.value.forEach(i => {
                this.state.options.forEach((j) => {
                    if (this.useObjectValue) {
                        if (i.id === j.id) {
                            j.selected = true;
                            bringToTop.push(j);
                        }
                    }
                    else {
                        if (i === j.id) {
                            j.selected = true;
                            bringToTop.push(j);
                        }
                    }
                });
            });
            bringToTop.forEach(i => {
                this.state.options.splice(this.state.options.indexOf(i), 1);
                this.state.options.unshift(i);
            });
        }
        else if (this.type === 'range') {
            if (!this.state.model[this.name] && this.state.model[this.name] !== 0)
                this.state.value = null;
            else if (this.postpend) {
                var s = String(this.state.model[this.name]);
                if (s.endsWith(this.postpend))
                    this.state.value = s.substring(0, s.length - this.postpend.length);
            }
        }
        this.searchUrl = props.searchUrl;
        this.required = props.required ? props.required : false;
        this.optionsName = props.optionsName ?? 'name';
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.setSelected = this.setSelected.bind(this);
        this.propOnChange = props.onChange;
        this.autoComplete = props.autoComplete;
        this.multi = props.multi ?? false;
        this.addUrl = props.addUrl;
        this.months = [];
        for (var n = 1; n <= 12; n++) {
            var s = String(n);
            if (s.length < 2)
                s = '0' + s;
            this.months.push({ id: s, name: s });
        }
        this.days = [];
        for (var n = 1; n <= 31; n++) {
            var s = String(n);
            if (s.length < 2)
                s = '0' + s;
            this.days.push({ id: s, name: s });
        }
        var nowYear = Number(new Date().getUTCFullYear());
        this.years = [];
        for (var n = nowYear; n > nowYear - 150; n--) {
            var s = String(n);
            this.years.push({ id: s, name: s });
        }
        this.onFileSelect = this.onFileSelect.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.name !== this.props.name) {
            this.name = this.props.name;
            this.setState({ value: '' });
        }
        if (prevProps.model !== this.props.model) {
            this.setState({ model: this.props.model, value: this.props.model[this.name] ?? '' });
        }
        else if (prevProps.model[this.name] !== this.props.model[this.name]) {
            this.setState({ value: this.props.model[this.name] });
        }
        if (prevProps.disabled !== this.props.disabled)
            this.setState({ disabled: this.props.disabled });
        if (prevProps.options !== this.props.options) {
            if (Array.isArray(this.state.value)) {
                this.state.value.forEach((i) => {
                    this.props.options.forEach((j) => {
                        if (this.useObjectValue) {
                            if (i.id === j.id)
                                j.selected = true;
                        }
                        else {
                            if (i === j.id)
                                j.selected = true;
                        }
                    });
                });
            }
            this.setState({ options: this.props.options });
        }

        if (this.state.selectedList !== this.props.model[this.name]) {
            if (this.type === 'multisearch') {
                if (this.props.model[this.name])
                    this.state.selectedList = this.props.model[this.name];
            }
        }


        if (this.state.options) {
            if (this.type === 'multiselect' && Array.isArray(this.state.value)) {
                this.state.value.forEach((i) => {
                    this.state.options.forEach((j) => {
                        if (this.useObjectValue) {
                            if (i.id === j.id)
                                j.selected = true;
                        }
                        else {
                            if (i === j.id)
                                j.selected = true;
                        }
                    });
                });
            }
        }

    }

    onChange(e) {
        if (this.type === 'multisearch') {
            this.setSelected(e, true);
            return;
        }
        else if (this.type === 'search') {
            this.setState({ searchList: null });
            if (e) {
                qreq.post(this.searchUrl, { search: e }, j => {
                    if (!j.errorCode)
                        this.setState({ searchList: j.list });
                    else
                        this.setState({ searchList: false });
                });
            }
            return;
        }
        else if (this.type === 'daterange') {
            this.state.model[this.name] = e;
            this.setState({ value: e });
            if (this.propOnChange)
                this.propOnChange(e);
            return;
        }
        else if (this.type === 'date') {
            if (e) {
                if (!this.state.dateAllowTime) {
                    e.setHours(0);
                    e.setMinutes(0);
                    e.setSeconds(0);
                }
                this.state.model[this.name] = Globals.toISODateString(e);
                this.setState({ value: Globals.toMDYDateString(e), dateValue: e });

                if (this.propOnChange)
                    this.propOnChange(e);
            }
            else {
                this.state.model[this.name] = null;
                this.setState({ value: '', dateValue: null });
                if (this.propOnChange)
                    this.propOnChange(null);
            }
            return;
        }
        else if (this.type === 'dateselect') {
            if (e) {
                var d = new Date(Date.parse(this.state.subModel.YYYY + '-' + this.state.subModel.MM + '-' + this.state.subModel.DD));
                this.state.model[this.name] = Globals.toISODateString(d);
                this.setState({ value: Globals.toMDYDateString(d), dateValue: d });
                if (this.propOnChange)
                    this.propOnChange(d);
            }
            else {
                this.state.model[this.name] = null;
                this.setState({ value: '', dateValue: null });
                if (this.propOnChange)
                    this.propOnChange(null);
            }
            return;
        }
        else if (this.type === 'switch') {
            this.set('boolValue', e.target.checked ? true : false);
            this.set('value', e.target.checked ? 'true' : 'false');
            this.state.model[this.name] = e.target.checked;
            if (this.propOnChange)
                this.propOnChange(e.target.checked);
        }
        else if (this.type === 'range') {
            this.set('value', e);
            if (this.postpend)
                this.state.model[this.name] = String(e) + this.postpend;
            else
                this.state.model[this.name] = e;
            if (this.propOnChange)
                this.propOnChange(e);
            return;
        }
        else {
            this.set('value', e.target.value);
            this.state.model[this.name] = e.target.value;
            if (this.propOnChange)
                this.propOnChange(e.target.value);
        }
        this.setState({ value: e.target.value });

    }

    onSelect(obj) {
        if (this.type === 'search') {
            if (!this.multi) {
                this.set('value', obj);
                if (obj) {
                    if (this.useObjectValue)
                        this.state.model[this.name] = obj;
                    else
                        this.state.model[this.name] = obj.id;
                }
                else
                    this.state.model[this.name] = null;
                this.setState({ model: this.state.model });
            }
            this.setState({ searchList: null, subModel: this.state.subModel, selectedItem: obj });
            if (this.propOnChange)
                this.propOnChange(obj);
        }
    }

    setSelected(obj, sel) {
        if (sel)
            this.state.selectedList.push(obj);
        else {
            var idx = this.state.selectedList.indexOf(obj);
            if (idx >= 0)
                this.state.selectedList.splice(this.state.selectedList.indexOf(obj), 1);
        }
        this.state.model[this.name] = this.state.selectedList;
        this.setState({ selectedList: this.state.selectedList, model: this.state.model });
        if (this.propOnChange)
            this.propOnChange(obj);
    }

    toggle(opt) {

        if (this.type === 'range') {
            if (opt.target.checked) {
                this.state.model[this.name] = null;
                this.setState({ value: null });
                if (this.propOnChange)
                    this.propOnChange(null);
            }
            else {
                if (this.postpend)
                    this.state.model[this.name] = String(0) + this.postpend;
                else
                    this.state.model[this.name] = 0;
                this.setState({ value: 0 });
                if (this.propOnChange)
                    this.propOnChange(0);
            }
        }
        else {
            opt.selected = !opt.selected;
            var selIds = [];
            var selObjs = [];
            this.state.options.forEach(i => {
                if (i.selected) {
                    selIds.push(i.id);
                    selObjs.push(i);
                }
            });
            if (this.useObjectValue)
                this.state.model[this.name] = selObjs;
            else
                this.state.model[this.name] = selIds;
            this.setState({ options: this.state.options });
        }
    }

    onAdd(obj) {
        var item = {};
        item[this.name] = obj.search;
        qreq.post(this.addUrl, item, j => {
            if (j.errorCode === 0) {
                this.onSelect(j.item);
            }
        });
    }

    onFileSelect(e) {
        e.preventDefault();
        this.setState({ uploading: true });

        var f = e.target.files[0];

        var reader = new FileReader();
        reader.readAsBinaryString(f);
        reader.onload = () => {
            var b64data = btoa(reader.result);
            var v = {
                base64Content: b64data, fileType: f.type, fileSize: f.size, fileName: f.name
            };
            this.state.model[this.name] = v;
            this.setState({ value: v, fileName: f.name, fileType: f.type, fileSize: f.size, model: this.state.model });
            if (this.propOnChange)
                this.propOnChange(v);
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
            e.target.value = '';
        };
    }

    render() {
        if (this.type === 'switch') {
            return (<div className="form-group mb-3"><div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={this.id} checked={this.state.boolValue} onChange={this.onChange} />
                <label className="form-check-label" htmlFor={this.id}><L>{this.label}</L></label>
            </div></div>);
        }

        return (<>
            {this.labelAsPlaceholder ? '' : (<label className="form-label">{this.props.required ? '* ' : ''}<L>{this.props.label}</L></label>)}
            <div className={(this.props.type === 'multiselect' ? 'mb-3' : 'input-group mb-3') + (this.props.className ? ' ' + this.props.className : '')}>
                {this.state.preInput ? <span className="input-group-text">{this.state.preInput}</span> : ''}
                {this.props.type === 'multisearch' ? <>
                    <FormInput model={this.state.subModel} name="selected" label="" labelAsPlaceholder={true} type="search" onChange={this.onChange} searchUrl={this.searchUrl} multi={true} />
                    <ul className="list-group">
                        {this.state.selectedList.map(obj => <li key={obj.id} className="list-group-item">{obj.name} <span className="badge bg-danger pointer c-hoverable" onClick={e => this.setSelected(obj, false)}><FontAwesomeIcon icon={fa.faTrash} /> <span className="c-visible-onhover">remove</span></span></li>)}
                    </ul>
                </> :
                    this.props.type === 'multiselect' ? (<ul className="list-group">
                        {this.state.options.map((opt) => (<li key={opt.id} className={'list-group-item' + (opt.selected ? ' list-group-item-success' : '')} onClick={(e) => this.toggle(opt)}><FontAwesomeIcon icon={opt.selected ? fa.faCheckSquare : fa.faSquare} /> {opt[this.optionsName]}</li>))}
                    </ul>)
                        : (<>
                            {this.props.preAddon ? (<div className="input-group-text">{this.props.preAddon}</div>) : ''}

                            {(this.props.type === 'select' ? (
                                <select className="form-control" value={this.state.value} onChange={this.onChange} required={this.required} style={this.props.inputStyle}>
                                    <option value="">{this.props.selectLabel ? Globals.getLang(this.props.selectLabel) : Globals.getLang(this.props.label)}</option>
                                    {this.state.options.map((opt) => (<option key={opt.id} value={opt.id}>{opt[this.optionsName]}</option>))}
                                </select>
                            ) :
                                this.props.type === 'search' ? <>{this.state.value && this.state.value.id ? <ul className="list-group"><li className="list-group-item" onClick={() => this.onSelect(null)} style={{ cursor: 'pointer' }}>{this.state.value.name} <small>click to change</small></li></ul>
                                    : <><FormInput model={this.state.subModel} name="search" label="Search keywords..." labelAsPlaceholder={true} type="text" onChange={this.onChange} />
                                        {this.state.searchList === null ? '' :
                                            this.state.searchList === false ? <Alert message="Unknown error." type="danger" /> :
                                                <>
                                                    <ul className="list-group c-searchlist c-list-position-md-absolute">
                                                        {this.state.searchList.map(obj => <li key={obj.id} className="list-group-item pointer" onClick={() => this.onSelect(obj)}>{obj.name}</li>)}
                                                        {this.addUrl ? <li className="list-group-item pointer" onClick={() => this.onAdd(this.state.subModel)}><i>Add '{this.state.subModel.search}'</i></li> : ''}
                                                    </ul>
                                                    {this.state.searchList.length === 0 && !this.addUrl ? <Alert message="No items found." /> : ''}</>
                                        }
                                    </>}
                                </> :
                                    (this.props.type === 'upload' || this.props.type === 'image-upload') ? <><div className="d-none"><input type="file" id={'c-upload-' + this.id} onChange={this.onFileSelect} /></div><div className="btn-group"><button type="button" className="btn btn-primary" onClick={() => document.getElementById('c-upload-' + this.id).click()} accept={this.props.type === 'image-upload' ? 'image/*' : null}><FontAwesomeIcon icon={fa.faUpload} /> Select {this.props.type === 'image-upload' ? 'Image' : 'File'}</button></div></> :
                                        this.props.type === 'range' ? <>{this.state.value !== null ? <><div className="d-block w-100"><input type="range" onChange={e => this.onChange(e.target.value)} value={this.state.value} min={this.state.min} max={this.state.max} step={this.state.step} /></div><div className="d-block w-100"><input type="number" onChange={e => this.onChange(e)} className="form-control" value={this.state.value} /></div></> : ''}<div className="d-block"><input type="checkbox" checked={this.state.value === null} onChange={this.toggle} /> No value.</div></> :
                                            this.props.type === 'dateselect' ? <><div className="row"><div className="col"><FormInput model={this.state.subModel} name="MM" label="MM" labelAsPlaceholder={true} type="select" options={this.months} onChange={this.onChange} preInput="M" /></div><div className="col"><FormInput model={this.state.subModel} name="DD" label="DD" labelAsPlaceholder={true} type="select" options={this.days} onChange={this.onChange} preInput="D" /></div><div className="col"><FormInput model={this.state.subModel} name="YYYY" label="YYYY" labelAsPlaceholder={true} type="select" options={this.years} onChange={this.onChange} preInput="Y" /></div></div></> :
                                                this.props.type === 'date' ? (<DatePicker showTimeInput={this.state.dateAllowTime} dateFormat={this.state.dateAllowTime ? 'MM/dd/yyyy hh:mm aa' : 'MM/dd/yyyy'} selected={this.state.dateValue} onChange={this.onChange} customInput={<InputMask className="form-control" mask={this.state.dateAllowTime ? '99/99/9999 99:99 aa' : '99/99/9999'} />} formatChars={{ 'a': '[APM]' }} />) :
                                                    (this.props.type === 'daterange' ? <DateRangePicker appearance="default" placeholder="Date Range" size="lg" onChange={this.onChange} /> :
                                                        (this.props.type === 'textarea' ? <textarea className="form-control" value={this.state.value} onChange={this.onChange} required={this.required} style={this.props.inputStyle} autoComplete={this.props.autoComplete} spellCheck={this.props.spellCheck} placeholder={this.labelAsPlaceholder ? this.props.label : ''}></textarea> : <input type={this.props.type} onClick={this.props.onClick} className="form-control" value={this.state.value} onChange={this.onChange} required={this.required} placeholder={this.props.placeholder ? this.props.placeholder : this.labelAsPlaceholder ? this.label : ''} disabled={this.state.disabled} autoComplete={this.autoComplete} style={this.props.style} step={this.props.step} />)))}
                            {this.props.postAddon ? (<div className="input-group-text">{this.props.postAddon}</div>) : ''}
                            </>)}
            </div></>);
    }
}