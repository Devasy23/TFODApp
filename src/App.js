import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";
import { drawRect } from "./utilities";

function App() {
  
  // const [image, setImage] = useState(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    // Load network
    const net = await tf.loadGraphModel(
      "https://raw.githubusercontent.com/Devasy23/Tech_Think_tank/main/model_330.json"
    );
    //check if model is loaded
    console.log("model loaded");
    // Run detection
    detect(net);
  };
  const detect = async (net) => {
    // Check data is available
    console.log(image);
    if (image) {
      // Get Image Properties
      const imgWidth = image.width;
      const imgHeight = image.height;

      // Set canvas height and width
      canvasRef.current.width = imgWidth;
      canvasRef.current.height = imgHeight;

      // Make Detections
      const img = tf.browser.fromPixels(image);
      const resized = tf.image.resizeBilinear(img, [640, 480]);
      const casted = resized.cast("int32");
      const expanded = casted.expandDims(0);
      const obj = await net.executeAsync(expanded);

      // console.log(await obj[3].array());
      // console.log(await obj[4].array());
      // Get boxes and classes
      const boxes = await obj[3].array();
      const classes = await obj[7].array();
      const scores = await obj[2].array();

      // console.log(boxes, classes, scores);
      // Draw the bounding boxes
      const labelMap = {
        1:{name:'chashma', color:'red'},
        2:{name:'utensil', color:'yellow'},
        3:{name:'laptop', color:'lime'},
        4:{name:'papercup', color:'blue'},
    }
      const drawRect = (ctx, ymin, xmin, height, width, label) => {
        // ctx.drawImage(image, 0, 0);
        ctx.beginPath();
        ctx.rect(xmin, ymin, width, height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.fillText(label, xmin + 5, ymin + 20);
      };
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(image, 0, 0);
      boxes[0].forEach((box, i) => {
        if (scores[0][i] > 0.7) {
          const ymin = box[0] * imgHeight;
          const xmin = box[1] * imgWidth;
          const ymax = box[2] * imgHeight;
          const xmax = box[3] * imgWidth;
          // const canvas = canvasRef.current;
        // const ctx = canvas.getContext("2d");
          drawRect(
            ctx,
            ymin,
            xmin,
            ymax - ymin,
            xmax - xmin,
            `${classes[0][i]} ${Math.round(scores[0][i] * 100)}%`
          );
        }
      });

    }
    const saveImage = () => {
  const dataURL = canvasRef.current.toDataURL("image/png");
  fetch("/save-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dataURL }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
};
// saveImage();
  };

  // Handle image upload

// const [image, setImage] = useState(null);
let image = null;
const handleImageUpload = (event) => {
  console.log("Handling image upload...");
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    console.log("Image loaded...");
    const img = new Image();
    img.onload = () => {
      console.log("Image object created...");
      // console.log(img);
      // setImage(img);
      image = img;
      // check if image is set in state
      if(image) {
        console.log("Image set in state...");}
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
      runCoco();
    };
    img.src = reader.result;
    // const container = document.getElementById("image-container");
    // if (container) {
    //   container.appendChild(img); // add image to container
    // } else {
    //   console.error("Image container not found!");
    // }
  };
  reader.readAsDataURL(file);
};

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {/* <div id="image-container"></div> */}
      <canvas
  ref={canvasRef}
  width={image ? image.width : 0}
  height={image ? image.height : 0}
></canvas>
    </div>
  );
}
export default App;
