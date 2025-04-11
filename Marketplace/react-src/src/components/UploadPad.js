/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid';
import './UploadPad.css';
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";
import L from "./Lang";
import Icon from "./Icon";

// Callbacks: onUploadBegin, onUploadEnd

export default class UploadPad extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            list: props.item[props.name] ?? [],
            queue: [],
            id: uuidv4(),
            progress: 0
        };

        this.state.item[props.name] = this.state.list;
        this.getProgress = this.getProgress.bind(this);
        /*
        this.upload = this.upload.bind();
        this.readFile = this.readFile.bind();
        this.triggerUpload = this.triggerUpload.bind();
        this.onFileDrop = this.onFileDrop.bind();
        this.onFileDragOver = this.onFileDragOver.bind();
        this.onFileDragLeave = this.onFileDragLeave.bind();
        this.fileToDataURL = this.fileToDataURL.bind();
        this.onFileSelect = this.onFileSelect.bind();
        */
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item)
            this.setState({ item: this.props.item, list: this.props.item[this.props.name] ?? [] });
    }
    
    componentDidMount() {
        document.addEventListener('drop', this.onFileDrop);
        document.addEventListener('dragover', this.onFileDragOver);
        document.addEventListener('dragleave', this.onFileDragLeave);
    }

    componentWillUnmount() {
        document.removeEventListener('drop', this.onFileDrop);
        document.removeEventListener('dragover', this.onFileDragOver);
        document.removeEventListener('dragleave', this.onFileDragLeave);
    }

    triggerUpload(id) {
        document.getElementById('UploadPad-' + id).click();
    }

    canUpload() {
        if (this.state.list.length > 0 && this.props.single)
            return false;
        return true;
    }

    upload(v) {
        this.setState({ uploading: true });
        if (this.props.onUploadBegin) this.props.onUploadBegin();
        var reader = new FileReader();
        reader.addEventListener('progress', e => {
            var percent = Math.round((e.loaded / e.total) * 100);
            v.progress = percent;
            this.setState({ list: this.state.list, queue: this.state.queue });
            console.log('progress', v);
        });
        reader.onload = () => {
            var b64data = btoa(reader.result);
            qreq.post('/api/storage/upload-encoded', { name: v.file.name, mimeType: v.file.type, dataSize: v.file.size, base64Content: b64data }, j => {
                v.id = j.item.id;
                v.ident = j.item.ident;
                v.uploading = false;
                if (j.errorCode === 0) {
                    this.setState({ uploading: false });
                }
                else {
                    this.alert(j.errorMessage);
                    this.setState({ uploading: false });
                }
                this.state.queue.splice(this.state.queue.indexOf(v), 1);
                this.setState({ list: this.state.list, queue: this.state.queue });
                if (this.props.onUploadEnd) this.props.onUploadEnd(j.item);
            }, () => {
                this.alert('Unknown error ocurred. Please try again.');
                v.uploading = false;
                this.state.queue.splice(this.state.queue.indexOf(v), 1);
                this.setState({ uploading: false, list: this.state.list, queue: this.state.queue  });
                if (this.props.onUploadEnd) this.props.onUploadEnd();
            });
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
        };
        reader.readAsBinaryString(v.file);

    }


    onFileDrop(e) {
        e.preventDefault();

        document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
            i.classList.remove('active');
        });

        if (e.dataTransfer && e.dataTransfer.items) {
            [...e.dataTransfer.items].forEach(i => {
                if (i.kind === "file") {
                    const file = i.getAsFile();
                    this.onFileSelect({
                        files: [file],
                        value: ''
                    });
                }
            });
        }

        document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
            i.classList.remove('active');
        });

    }

    onFileDragOver(e) {
        e.preventDefault();

        if (this.leaveTimeout)
            clearTimeout(this.leaveTimeout);
        document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
            i.classList.add('active');
        });
    }

    onFileDragLeave(e) {
        e.preventDefault();

        if (this.leaveTimeout)
            clearTimeout(this.leaveTimeout);
        this.leaveTimeout = setTimeout(() => {
            document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
                i.classList.remove('active');
            });
        }, 500);
    }

    readFile(f) {
        var key = uuidv4();
        var obj = { key: key, progress: 0 };
        this.state.list.push(obj);
        this.state.queue.push(obj);
        var reader = new FileReader();
        this.setState({ progress: 0 });
        reader.onload = () => {
            var b64data = btoa(reader.result);
            var find = obj;
            find.base64Content = b64data;
            find.fileType = f.type;
            find.fileSize = f.size;
            find.file = f;
            find.name = f.name;
            find.uploading = true;
            this.setState({ list: this.state.list, queue: this.state.queue });
            this.upload(find);
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
        };
        reader.readAsBinaryString(f);
    }

    getProgress() {
        var progress = 0;
        this.state.queue.forEach(i => {
            progress += i.progress;
        });
        return Math.round(progress / this.state.queue.length);
    }

    onFileSelect(e) {
        e.preventDefault();

        for (var n = 0; n < e.target.files.length; n++) {
            var f = e.target.files[n];
            console.log('Uploading: ' + f.name);
            this.readFile(f);
        };

        e.target.value = '';
    }

    fileToDataURL(v) {
        if (v.thumbUrl)
            return Globals.serverUrl + v.thumbUrl;
        else if (v.url)
            return Globals.serverUrl + v.url;
        return 'data:' + v.fileType + ';base64,' + v.base64Content;
    }

    remove(v) {
        qreq.post('/api/storage/delete', v, j => {
            if (j.errorMessage)
                this.alert(j.errorMessage);
        }, this.unkownErrorCallback);
        this.state.list.splice(this.state.list.indexOf(v), 1);
        this.setState({ list: this.state.list });
    }

    render() {
        return <div className="UploadPad"><div className="d-none">
            <input type="file" id={'UploadPad-' + this.state.id} onChange={(e) => {
                e.preventDefault();

                for (var n = 0; n < e.target.files.length; n++) {
                    var f = e.target.files[n];
                    console.log('Uploading: ' + f.name);
                    this.readFile(f);
                };

                e.target.value = '';
            }} multiple accept="image/*" />
        </div>

            {this.canUpload() ? <div className="UploadPad-dropzone" onClick={() => this.triggerUpload(this.state.id)}>
                <FontAwesomeIcon icon={fa.faCloudArrowUp} />
                <p>Click to select photos, or drag and drop here</p>
            </div> : ''}

            {/*this.getProgress() ? <div className="my-2 bg-light rounded">
                <div className="bg-dark p-1 text-light text-center rounded" style={{width: String(this.getProgress()) + '%'}}>
                    {String(this.getProgress()) + '%'}
                    {this.getProgress() === 100 ? <span> <L>Finalizing...</L></span> : ''}
                </div>
            </div> : ''*/}

            {this.state.queue.length ? <div className="my-2 p-1 bg-light">
                Uploading... Please wait...
                {this.state.queue.map(i => <div key={i.key} className="text-secondary">
                    <small>{i.name}</small>
                </div>)}
            </div> : ''}

            <div className="row mt-3">
                {this.state.list.map(i => <div key={i.id ?? i.key} className="col-md-3">
                    <div className={'position-relative o-img' + (i.uploading ? ' opacity-50' : '')} style={{ backgroundImage: 'url(\'' + this.fileToDataURL(i) + '\')' }}>
                        {i.uploading ? <div className="position-absolute ms-3"><Icon icon="faCloudArrowUp" /></div> : ''}
                        <button type="button" className="UploadPad-remove" onClick={() => this.remove(i)} disabled={!i.ident}></button>
                        <img src={this.fileToDataURL(i)} alt="" className="img-thumbnail d-none" />
                    </div>
                </div>)}
            </div>
        </div>;
    }
}