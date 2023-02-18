function parseDocument(file) {
  let fileReader = new FileReader()
  let result = extractGoogleCoords(e.target.result)

    //Do something with result object here
  console.log(result)

  fileReader.readAsText(file)
}

function extractGoogleCoords(plainText) {
  let parser = new DOMParser()
  let xmlDoc = parser.parseFromString(plainText, "text/xml")
  let googlePolygons = []
  let googleMarkers = []

  if (xmlDoc.documentElement.nodeName == "kml") {

    for (const item of xmlDoc.getElementsByTagName('Placemark') any) {
      let placeMarkName = item.getElementsByTagName('name')[0].childNodes[0].nodeValue.trim()
      let polygons = item.getElementsByTagName('Polygon')
      let markers = item.getElementsByTagName('Point')

      /** POLYGONS PARSE **/        
      for (const polygon of polygons) {
        let coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
        let points = coords.split(" ")

        let googlePolygonsPaths = []
        for (const point of points) {
          let coord = point.split(",")
          googlePolygonsPaths.push({ lat: +coord[1], lng: +coord[0] })
        }
        googlePolygons.push(googlePolygonsPaths)
      }

      /** MARKER PARSE **/    
      for (const marker of markers) {
        var coords = marker.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
        let coord = coords.split(",")
        googleMarkers.push({ lat: +coord[1], lng: +coord[0] })
      }
    }
  } else {
    throw "error while parsing"
  }

  return { markers: googleMarkers, polygons: googlePolygons }

}