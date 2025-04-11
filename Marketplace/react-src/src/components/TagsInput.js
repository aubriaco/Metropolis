/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 import BaseCom from "./BaseCom";
import { WithContext as ReactTags } from "react-tag-input";
import "./TagsInput.css";

class TagsInput extends BaseCom {

    constructor(props) {
        super(props);
        this.state = {
            tagCount: 0
        };
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleTagClick = this.handleTagClick.bind(this);
        this.restyle = this.restyle.bind(this);
    }

    componentDidMount() {
        this.restyle();
    }

    restyle() {
        var eles = document.querySelectorAll('.ReactTags__tagInputField');
        if (eles) {
            eles.forEach(i => {
                if (!i.classList.contains('form-control'))
                    i.classList.add('form-control');
            });
        }
    }

    handleDelete(i) {
        this.props.tags.splice(i, 1);
        if (this.props.onChange) this.props.onChange();
    };

    handleAddition(tag) {
        this.props.tags.push(tag);
        if (this.props.onChange) this.props.onChange();
    };

    handleDrag  (tag, currPos, newPos)  {
        const newTags = this.props.tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        // re-render
        this.props.tags = newTags;

        if (this.props.onChange) this.props.onChange();
    };

    handleTagClick (index)  {
    };

    render() {
        return <ReactTags
            tags={this.props.tags}
            suggestions={[]}
            delimiters={[188, 13, 9]}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            handleDrag={this.handleDrag}
            handleTagClick={this.handleTagClick}
            inputFieldPosition="bottom"
            autofocus={false}
            autocomplete
        />
    }
}

export default TagsInput;