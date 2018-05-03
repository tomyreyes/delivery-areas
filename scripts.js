let storeCenter = { lng: -80.2736907, lat: 25.933373 }

initMap = () => {
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let marker = new google.maps.Marker({
    position: storeCenter,
    map: map
  })

  let map2 = new google.maps.Map(document.getElementById('modal-map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let marker2 = new google.maps.Marker({
    position: storeCenter,
    map: map2
  })
}

let delivery_areas = []
localStorage.setItem('delivery_areas', JSON.stringify(delivery_areas))

$('window').on('load', function(){
  console.log('loaded')
})

const loadAreas = () => {
  let newLayers = []
  let bounds = new window.google.maps.LatLngBounds()
  delivery_areas = localStorage.getItem('delivery_areas')

  if (delivery_areas.length > 0) {
    delivery_areas.forEach(element => {
      if (element.type === 'radius') {
        let newShape = new window.google.maps.Circle({
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: map,
          center: element.coordinates,
          radius: element.details * 1000
        })
        window.google.maps.event.addListener(newShape, 'mouseover', function() {
          this.setOptions({ fillOpacity: 0.6 })
        }) //refactor to jQuery
        window.google.maps.event.addListener(newShape, 'mouseout', function() {
          this.setOptions({ fillOpacity: 0.25 }) //refactor
        })
        newLayers.push(newShape)
      } else {
        let newShape = new window.google.maps.Polygon({
          paths: element.coordinates,
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: map
        })
      }
    })
  }
}
