import React, { Component } from 'react';

export default class PhotoTags extends Component {

  render() {
    let tagList = this.props.tags.map((tag, index) => {
      let score = tag.score * 100,
      scoreStyle;

      // changing background color of each button based on the confidence score
      if (score >= 95) {
        scoreStyle = {backgroundColor: 'rgba(70, 130, 180, 0.8)'}
      }
      else if (score >= 85) {
        scoreStyle = {backgroundColor: "rgba(60, 179, 113, 0.8)"}
      } else {
        scoreStyle = {backgroundColor: "rgba(255, 99, 71, 0.7)"}
      }
      return (
        <div key={index} style={scoreStyle} className="imageTags" onClick={() => this.props.speak(tag.description)}>
          <h3>{tag.description}</h3><h5>{score.toFixed(0)}% sure</h5>
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
