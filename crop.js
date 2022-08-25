function setImage(imageLink, cols, rows) {
  // load image into image element and use onload to crop it
  var image = new Image()
  image.crossOrigin = 'anonymous'

  image.onload = cutImageUp(cols, rows, image)
  image.src = imageLink
}
function fetchImageParametres() {
  let cols = document.querySelector('[data-control="cols"]')
    ? +document.querySelector('[data-control="cols"]').value
    : 4
  let rows = document.querySelector('[data-control="rows"]')
    ? +document.querySelector('[data-control="rows"]').value
    : 2
  let image = document.querySelector('[data-control="image"]')
    ? document.querySelector('[data-control="image"]').value
    : null
  if (image) {
    //--percent is a css variable so that we can decide how much width it should take to fit entire columns
    document
      .querySelector(':root')
      .style.setProperty('--percent', `${+(100 / cols)}%`)
    setImage(image, cols, rows)
  }
}
function getImageFromInput() {
  //onchange recalculate
  //get child events using event bubbling
  let controls = document.querySelector('[data-controls]')
  controls.addEventListener('change', fetchImageParametres)
  fetchImageParametres()
}
getImageFromInput()

function createImg(imagePieces) {
  // create image dynamically and set it in webpage
  let renderDiv = document.querySelector('[data-render="img8x8"]')
  if (imagePieces.length) {
    let images = imagePieces.map(
      (imagePiece) =>
        `<img data-pos="col-${imagePiece.pos.col}xrow-${imagePiece.pos.row}" src="${imagePiece.src}" />`,
    )
    renderDiv.innerHTML = images.join('')
  }
}
//sha function
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message)

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
//cutImageUp is the main function to crop
function cutImageUp(numColsToCut = 4, numRowsToCut = 2, image) {
  return async function () {
    let imagePieces = []
    let totalWidth = this.width
    let totalHeight = this.height
    let widthOfOnePiece = totalWidth / numColsToCut
    let heightOfOnePiece = totalHeight / numRowsToCut
    //divide entire image in row columns to cut
    for (var x = 0; x < numColsToCut; ++x) {
      for (var y = 0; y < numRowsToCut; ++y) {
        var canvas = document.createElement('canvas')
        canvas.width = widthOfOnePiece
        canvas.height = heightOfOnePiece
        var context = canvas.getContext('2d')
        context.drawImage(
          image,
          x * widthOfOnePiece,
          y * heightOfOnePiece,
          widthOfOnePiece,
          heightOfOnePiece,
          0,
          0,
          canvas.width,
          canvas.height,
        )
        let imageDetails = {}
        imageDetails.src = canvas.toDataURL()
        imageDetails.hash = await sha256(imageDetails.src)
        imageDetails.pos = {
          row: y,
          col: x,
        }
        imagePieces.push(imageDetails)
      }
    }
    //sort with the image column and row for the rendering
    imagePieces.sort(
      (img1, img2) =>
        img1.pos.col - img2.pos.col && img1.pos.row - img2.pos.row,
    )
    console.log(imagePieces)
    //imagePieces.sort((img1,img2) => b % 2 - a % 2 || a - b);
    createImg(imagePieces)
  }
}
