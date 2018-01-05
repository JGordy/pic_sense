import React, { Component } from 'react';
import PhotoTags from './PhotoTags';
import '../styles/App.css';
let rp = require('request-promise');

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageURL: '',
      imageTags: [],
      imageText: [],
      voice: {}
    }
  };

  // converting the canvas image into base64
  convertCanvasToImage = (canvas) => {
    let image = new Image();

    image.src = canvas.toDataURL("image/png");
    let imgURL = image.src.replace("data:image/png;base64,", "")
    this.setState({imageURL: imgURL});

  };

  // moving the canvas position when clicked
  toggleCanvasPosition = () => {
    let canvasCont = document.getElementById('canvas_container'),
    snapButton = document.getElementById('button');

    canvasCont.classList.toggle('snapped');
    snapButton.classList.toggle('snapped');
  };

  snapPhoto = (width, height) => {
    let canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
        video = document.getElementById('video'),
        imageWidth,
        imageHeight;

    if (width <= 850) {
      imageWidth = width;
      imageHeight = height;
    } else {
      imageWidth = width / 2;
      imageHeight = height / 1.45;
    };

    context.drawImage(video, 0, 0, imageWidth, imageHeight);
    this.toggleCanvasPosition();
    this.convertCanvasToImage(canvas);
  };

  removePhoto = () => {
    this.toggleCanvasPosition();
    this.setState({
      imageTags: [],
      imageText: []
    })
  };

  //submitting the converted image to Google Cloud Vision API
  submitPhoto = () => {
    let submit = document.getElementById('submit');
    submit.classList.toggle('submitting');

    // Google Vision API request
    // fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAS_9EhaNTu1UtMPgKfNQt8-fOpe8DExOI', {
    //       method: "POST",
    //       body: requestBody,
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     })
    //     .then(res => {
    //       console.log("RESPONSE: ", res);
    //     })

    let options = { method: 'POST',
      url: 'https://vision.googleapis.com/v1/images:annotate',
      qs: { key: 'AIzaSyAS_9EhaNTu1UtMPgKfNQt8-fOpe8DExOI' },
      headers:
       {
         'Content-Type': 'application/json' },
      body:
       { requests:
          [ { image: { content: `${this.state.imageURL}` },
              features: [ { type: 'LABEL_DETECTION', maxResults: 5 } ] } ] },
      json: true };

    rp(options, function (error, response, body) {
      if (error) throw new Error(error);
      submit.classList.toggle('submitting');
    }).then(body => {
        this.setState({imageTags: body.responses[0].labelAnnotations});
        this.speak(body.responses[0].labelAnnotations[0].description)
      })
      .catch(err => {
        console.log("Error: ", err);
      });

  };

  // getting the voice list from the speechSynthesis API
  getVoices = () => {
    let awaitVoices = new Promise(done =>
    window.speechSynthesis.onvoiceschanged = done
    );

    awaitVoices.then(()=> {
      let synth = window.speechSynthesis;
      let voices = synth.getVoices();
      this.setState({voice: voices[50]});
    });
  };

  // onclick speak the given text
  speak = (text) => {
    let synth = window.speechSynthesis;
    let msg = new SpeechSynthesisUtterance();
    msg.voice = this.state.voice;
    msg.text = text;
    synth.speak(msg);
  };

  componentDidMount() {
    let video = document.getElementById('video'),
        canvas = document.getElementById('canvas');

    // getting device camera access
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          video.src = window.URL.createObjectURL(stream);
          video.play();
        });
    };

    // for mobile use
    if(window.innerWidth <= 850) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      video.width = window.innerWidth;
      video.height = window.innerHeight;
    } else {
      video.width = window.innerWidth / 2;
      video.height = 480;
      canvas.width = video.width;
      canvas.height = video.height;
    };

    // triggering the getVoice function upon the component loading
    this.getVoices();
  };

  render() {

    return (
      <div className="App">

        <video id="video" width='' height='' autoPlay></video>

        <div id="canvas_container">
          <canvas id="canvas" width='' height=''></canvas>
          <div id="canvasButtons">
            <button id="delete" onClick={() => this.removePhoto()}>
            <i className="material-icons">delete</i>
            </button>
            <button id="submit" onClick={() => this.submitPhoto()}>
              <i className="material-icons">send</i>
            </button>
          </div>

          <PhotoTags tags={this.state.imageTags} text={this.state.imageText}
          speak={this.speak}  />
        </div>

        <div id="button">
          <button id="snap" onClick={() => this.snapPhoto(window.innerWidth, window.innerHeight)}>
            <i className="material-icons">photo_camera</i>
          </button>
        </div>

      </div>
    );
  }
};

export default App;
