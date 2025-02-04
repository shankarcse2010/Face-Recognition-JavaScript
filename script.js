const imageUpload = document.getElementById('imageUpload')
const video = document.getElementById('video')
let faceMatcher;
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
   faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  console.log(faceMatcher);
  startVideo()
  // let image
  // let canvas
  // document.body.append('Loaded')
  // imageUpload.addEventListener('change', async () => {
  //   if (image) image.remove()
  //   if (canvas) canvas.remove()
  //   image = await faceapi.bufferToImage(imageUpload.files[0])
  //   container.append(image)
  //   canvas = faceapi.createCanvasFromMedia(image)
  //   container.append(canvas)
  //   const displaySize = { width: image.width, height: image.height }
  //   faceapi.matchDimensions(canvas, displaySize)
  //   const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
  //   const resizedDetections = faceapi.resizeResults(detections, displaySize)
  //   const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
  //   results.forEach((result, i) => {
  //     const box = resizedDetections[i].detection.box
  //     const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
  //     drawBox.draw(canvas)
  //   })
  // })
}
function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
    // faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Gowrishankar']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`http://127.0.0.1:5500/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
