// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import { initializeApp } from 'firebase/app';

import { nextFrame } from "@tensorflow/tfjs";
import { getDatabase, ref, set } from "firebase/database";

// 2. TODO - Import drawing utility here
import {drawRect} from "./utilities"; 

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    // const net = await tf.loadGraphModel('https://directionstfod.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json')  // working link
    const net = await tf.loadGraphModel('https://raw.githubusercontent.com/Devasy23/Tech_Think_tank/main/model_330.json')  // our link
    
    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 16.7);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)
      
      // console.log(obj[3].array())
      const boxes = await obj[3].array()
      const classes = await obj[7].array()
      const scores = await obj[2].array()
    
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      const firebaseConfig = {
        apiKey: "AIzaSyDor4fdlvcYG7GZ3XhEByHdX28lyf9oKcY",
        authDomain: "proj1-ef411.firebaseapp.com",
        databaseURL: "https://proj1-ef411-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "proj1-ef411",
        storageBucket: "proj1-ef411.appspot.com",
        messagingSenderId: "752074190055",
        appId: "1:752074190055:web:ee38817d34239dfbcc8642",
        measurementId: "G-C11431NPZ6"
      };
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);

      // function to count the number of objects detected and return the dictionary
      updateToDatabase(countObjects(boxes, classes, scores, 0.7), "1");
      function countObjects(boxes, classes, scores, threshold){
        var dict = { "chashma": 0, "utensil": 0, "laptop": 0, "papercup": 0 }
        for (var i = 0; i < boxes.length; i++){
          if (scores[0][i] > threshold){
            if (classes[0][i] === 1){
              dict["chashma"] += 1
            }
            else if (classes[0][i] === 2){
              dict["utensil"] += 1
            }
            else if (classes[0][i] === 3){
              dict["laptop"] += 1
            }
            else if (classes[0][i] === 4){
              dict["papercup"] += 1
            }
          }
        }
        return dict
      }
      function updateToDatabase(dictionary, userId){
        const db = getDatabase();
        set(ref(db, 'user/' + userId), {
            "chashma": dictionary["chashma"],
            "utensil": dictionary["utensil"],
            "laptop": dictionary["laptop"],
            "papercup": dictionary["papercup"]
        })
      }


      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], 0.7, videoWidth, videoHeight, ctx)}); 

      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
