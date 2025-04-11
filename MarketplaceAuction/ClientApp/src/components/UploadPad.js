import BaseCom from "./BaseCom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as fa from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from 'uuid';
import './UploadPad.css';
import { qreq } from "../shared/qrequest";
import Globals from "../shared/Globals";

export default class UploadPad extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            list: props.item[props.name] ?? [],
            id: uuidv4()
        };

        this.state.item[props.name] = this.state.list;
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

    upload(v) {
        this.setState({ uploading: true });
        if (this.props.onUploadBegin) this.props.onUploadBegin();
        var reader = new FileReader();
        reader.readAsBinaryString(v.file);
        reader.onload = () => {
            var b64data = btoa(reader.result);
            qreq.post('/api/storage/upload-encoded', { name: v.file.name, mimeType: v.file.type, dataSize: v.file.size, base64Content: b64data }, j => {
                v.id = j.item.id;
                if (j.errorCode === 0) {
                    this.setState({ uploading: false });
                }
                else {
                    this.alert(j.errorMessage);
                    this.setState({ uploading: false });
                }
                if (this.props.onUploadEnd) this.props.onUploadEnd();
            }, () => {
                this.alert('Unknown error ocurred. Please try again.');
                this.setState({ uploading: false });
                if (this.props.onUploadEnd) this.props.onUploadEnd();
            });
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
        };

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
        if (!this.state.edit)
            return;

        if (this.leaveTimeout)
            clearTimeout(this.leaveTimeout);
        document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
            i.classList.add('active');
        });
    }

    onFileDragLeave(e) {
        e.preventDefault();
        if (!this.state.edit)
            return;


        if (this.leaveTimeout)
            clearTimeout(this.leaveTimeout);
        this.leaveTimeout = setTimeout(() => {
            document.querySelectorAll('.UploadPad-dropzone').forEach(i => {
                i.classList.remove('active');
            });
        }, 500);
    }

    readFile(f) {
        var reader = new FileReader();
        reader.readAsBinaryString(f);
        reader.onload = () => {
            var b64data = btoa(reader.result);
            var v = {
                base64Content: b64data, fileType: f.type, fileSize: f.size, file: f
            };
            this.state.list.push(v);
            this.setState({ list: this.state.list });
            this.upload(v);
        };
        reader.onerror = (error) => {
            console.log('Error: ', error);
            this.setState({ uploading: false });
        };
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

            <div className="UploadPad-dropzone" onClick={() => this.triggerUpload(this.state.id)}>
                <FontAwesomeIcon icon={fa.faCloudArrowUp} />
                <p>Click to select photos, or drag and drop here</p>
            </div>

            <div className="row mt-3">
                {this.state.list.map(i => <div key={i.id ?? i.key} className="col-md-3">
                    <div className="position-relative o-img" style={{ backgroundImage: 'url(\'' + this.fileToDataURL(i) + '\')' }}>
                        <button type="button" className="UploadPad-remove" onClick={() => this.remove(i)}></button>
                        <img src={this.fileToDataURL(i)} alt="" className="img-thumbnail d-none" />
                    </div>
                </div>)}
            </div>
        </div>;
    }
}