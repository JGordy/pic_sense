import React, { Component } from 'react';
import './App.css';

class App extends Component {

  triggerPhoto = () => {
    console.log('snapped!!');

    let canvas = document.getElementById('canvas');
    console.log("canvas: ",canvas);
    let context = canvas.getContext('2d');
    console.log("context: ", context);
    let video = document.getElementById('video');

    context.drawImage(video, 0, 0, 640, 480);
  }

  componentDidMount() {
    let video = document.getElementById('video');
    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
          video.src = window.URL.createObjectURL(stream);
          video.play();
      });
    }
  }

  render() {
    return (
      <div className="App">
        <video id="video" width="640" height="480" autoPlay></video>
        <button id="snap" onClick={this.triggerPhoto}>Snap Photo</button>
        <canvas id="canvas" width="640" height="480"></canvas>
      </div>
    );
  }
}

export default App;
