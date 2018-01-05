import React, { Component } from 'react';
import PhotoTags from './PhotoTags';
import '../styles/App.css';
import vision from "react-cloud-vision-api";
vision.init({ auth: 'AIzaSyAS_9EhaNTu1UtMPgKfNQt8-fOpe8DExOI'})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageURL: '',
      imageTags: [],
      imageText: [],
      voice: {}
    }
  }

  convertCanvasToImage = (canvas) => {
    let image = new Image();

    image.src = canvas.toDataURL("image/png");
    let imgURL = image.src.replace("data:image/png;base64,", "")
    this.setState({imageURL: imgURL});

  }

  toggleCanvasPosition = () => {
    let canvasCont = document.getElementById('canvas_container'),
    snapButton = document.getElementById('button');

    canvasCont.classList.toggle('snapped');
    snapButton.classList.toggle('snapped');
  }

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
    }

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
  }

  submitPhoto = () => {
    let submit = document.getElementById('submit');
    submit.classList.toggle('submitting');

    // Google Vision API request
    const req = new vision.Request({
      image: new vision.Image({
        base64: this.state.imageURL,
      }),
      features: [
        new vision.Feature('LABEL_DETECTION', 5),
        new vision.Feature('TEXT_DETECTION', 10),
      ]
    })

    // the actual request to the API
    vision.annotate(req).then((res) => {
      // setting response to this.state.imageTags
      this.setState({
        imageTags: res.responses[0].labelAnnotations,
        imageText: res.responses[0].textAnnotations
      });
      submit.classList.toggle('submitting');
      this.speak(res.responses[0].labelAnnotations[0].description);
    }, (err) => {
      console.log('Error: ', err)
    })

  };

  getVoices = () => {

    let awaitVoices = new Promise(done =>
    window.speechSynthesis.onvoiceschanged = done
    );


    awaitVoices.then(()=> {
      let synth = window.speechSynthesis;
      let voices = synth.getVoices();
      this.setState({voice: voices[50]});
    });
  }

  speak = (text) => {
    let synth = window.speechSynthesis;
    let msg = new SpeechSynthesisUtterance();
    msg.voice = this.state.voice;
    msg.text = text;
    synth.speak(msg);
  }

  componentDidMount() {
    let video = document.getElementById('video'),
        canvas = document.getElementById('canvas');

    // camera access
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          video.src = window.URL.createObjectURL(stream);
          video.play();
        });
    }
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
    }

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

        <img src='' id='image' alt=""/>

        <div id="button">
          <button id="snap" onClick={() => this.snapPhoto(window.innerWidth, window.innerHeight)}>
            <i className="material-icons">photo_camera</i>
          </button>
        </div>

      </div>
    );
  }
}

export default App;
