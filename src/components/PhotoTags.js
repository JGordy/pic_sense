import React, { Component } from 'react';

export default class PhotoTags extends Component {

  render() {
    console.log("This.props", this.props);
    let tagList = this.props.tags.map((tag, index) => {
      return (
        <div key={index} className="imageTags" onClick={() => this.props.speak(tag.description)}>
          {tag.description}
        </div>
      )
    })
    return(
      <div className='photoTags'>
        {tagList}
      </div>
    )
  }
};
