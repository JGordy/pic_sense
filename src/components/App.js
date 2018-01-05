import React, { Component } from 'react';
import '../styles/App.css';
import vision from "react-cloud-vision-api";
vision.init({ auth: 'AIzaSyAS_9EhaNTu1UtMPgKfNQt8-fOpe8DExOI'})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageURL: '',
      imageTags: [],
      imageText: []
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
    }, (err) => {
      console.log('Error: ', err)
    })

  };

  speakSelectedWord = (text) => {
    const awaitVoices = new Promise(done =>
    window.speechSynthesis.onvoiceschanged = done);

    awaitVoices.then(()=> {
      const synth = window.speechSynthesis;
      var voices = synth.getVoices();
      console.log("VOICES: ", voices);
      const utterance = new SpeechSynthesisUtterance();
      utterance.voice = voices[50];
      utterance.text = text;
      synth.speak(utterance);
    });
  }

  componentDidMount() {
    let video = document.getElementById('video'),
        canvas = document.getElementById('canvas'),
        synth = window.speechSynthesis,
        voices;

    this.speakSelectedWord('Face');

    // console.log("MSG: ", msg);
    console.log("Voices: ", voices);
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
  };

  render() {
    console.log("STATE IMAGE TAGS: ",this.state.imageTags);
    console.log("STATE IMAGE TEXT: ",this.state.imageText);
    return (
      <div className="App">

        <video id="video" width='' height='' autoPlay></video>

        <div id="canvas_container">
          <canvas id="canvas" width='' height=''></canvas>
          <div id="canvasButtons">
            <button id="delete" onClick={() => this.toggleCanvasPosition()}>
            <i className="material-icons">delete</i>
            </button>
            <button id="submit" onClick={() => this.submitPhoto()}>
              <i className="material-icons">send</i>
            </button>
          </div>
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
