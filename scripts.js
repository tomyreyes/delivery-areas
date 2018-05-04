//GLOBALS
let storeCenter = { lng: -80.2736907, lat: 25.933373 }
let delivery_areas = localStorage.getItem('delivery_areas') ? JSON.parse(localStorage.getItem('delivery_areas')) : []
let currentLayers = []
let colorCount = 0
let initialMap = false
let modalMap = false 
let activeEdit = false
let editing = false

localStorage.setItem('delivery_areas', JSON.stringify(delivery_areas))

if(initialMap === false) {
  initialMap = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let marker = new google.maps.Marker({
    position: storeCenter,
    map: initialMap
  })
}

  modalMap = new google.maps.Map(document.getElementById('modal-map'), {
    zoom: 12,
    center: { lat: 25.933373, lng: -80.2736907 }
  })
  let modalMarker = new google.maps.Marker({
    position: storeCenter,
    map: modalMap
  })

  google.maps.event.addListenerOnce(modalMap, 'idle', function() {
    loadAreas()
  })


const getRandomColor = () => {
   let colors = [
    '#630460',
    '#c500c7',
    '#ed145b',
    '#ed1c24',
    '#ff5300',
    '#ffff00',
    '#63c000',
    '#00882a',
    '#005ec7',
    '#00145f'
  ];
  let thisColor = colors[colorCount];
  colorCount++;
  if(colorCount === 9) {
    colorCount = 0;
  }
  return thisColor;
}

const loadAreas = () => { 
  console.log('loadAreas called')
  let newLayers = []
  let bounds = new google.maps.LatLngBounds() 
  delivery_areas = JSON.parse(localStorage.getItem('delivery_areas'))

  if (delivery_areas.length > 0) {
    delivery_areas.forEach(element => {
    $(`<div class="area">${element.areaName}</div>`).attr({id: `${element.id}`}).appendTo('div.deliveryAreas').append('<a class="remove">remove</a>')
    // $('div.area').attr({id: `${element.id}`})

      if (element.type === 'radius') {
        let newShape = new google.maps.Circle({
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: initialMap,
          center: element.coordinates,
          radius: element.details * 1000
        })
        google.maps.event.addListener(newShape,"mouseover",function(){
          this.setOptions({fillOpacity: 0.6});
        });
        google.maps.event.addListener(newShape,"mouseout",function(){
          this.setOptions({fillOpacity: 0.25});
        });
        newLayers.push(newShape)
      } else {
        let newShape = new google.maps.Polygon({
          paths: element.coordinates,
          strokeColor: element.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: element.color,
          fillOpacity: 0.25,
          map: initialMap
        })
      }
    })
  }

  for (var i=0; i < newLayers.length; i++){
      if(delivery_areas[i].type!=='radius') {
        var paths = newLayers[i].getPaths();
         paths.forEach(path => {
           var ar = path.getArray();
           for(var i=0, l = ar.length; i <l; i++) {
              bounds.extend(ar[i]);
            }
        })
      } else {
        bounds.union(newLayers[i].getBounds());
      }
    }
    if(newLayers.length > 0) {
      initialMap.fitBounds(bounds); 
    } else {
      initialMap.setCenter(storeCenter);
    }
    currentLayers = newLayers;
  }


  //modal functions

  //In place of AddNewArea() 
  $('button.save').click(function(event){
    let areaName = $('#area-name').val()
    let minimumOrder = $('#minimum-order').val()
    let deliveryCharge = $('#delivery-charge').val()
    let maximumTime = $('#maximum-time').val()

    let newArea = {
      id : new Date().getUTCMilliseconds(),
      areaName,
      minimumOrder,
      deliveryCharge,
      maximumTime,
      type : 'radius',
      new : true,
      details: 0.4828032,
      color: getRandomColor()
    }
     $(`<div class="area">${newArea.areaName}</div>`).attr({id: `${newArea.id}`}).appendTo('div.deliveryAreas').append('<a class="remove">remove</a>')
    
    let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas'))
    deliveryAreasCopy.push(newArea)
    localStorage.setItem('delivery_areas', JSON.stringify(deliveryAreasCopy))

    var newShape = new google.maps.Circle({
      strokeColor: newArea.color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: newArea.color,
      fillOpacity: 0.25,
      map: initialMap,
      center: newArea.coordinates,
      radius: newArea.details * 1000 * 0.621371 // in miles
    })
       google.maps.event.addListener(newShape,"mouseover",function(){
      this.setOptions({fillOpacity: 0.6});
    });
    google.maps.event.addListener(newShape,"mouseout",function(){
      this.setOptions({fillOpacity: 0.25});
    });
    let currentLayers = currentLayers
    currentLayers.push(newShape);

  })
  
  //when user is editing delivery areas 
  $(document).on('click', '.area', function(event){
    
  let id = $(this).attr('id')
  console.log(id)
  let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 

  deliveryAreasCopy.forEach((element,index,array) => {

    if(element.id == id) { 
    $('#newAreaModal').modal()
    $('#newAreaModal').on('shown.bs.modal', function() {
      $('#area-name').val(`${element.areaName}`)
      $('#minimum-order').val(`${element.minimumOrder}`)
      $('#delivery-charge').val(`${element.deliveryCharge}`)
      $('#maximum-time').val(`${element.maximumTime}`)
    })
 

    // let areaName = $('#area-name').val()
    // let minimumOrder = $('#minimum-order').val()
    // let deliveryCharge = $('#delivery-charge').val()
    // let maximumTime = $('#maximum-time').val()
    


      // currentLayers[index].setRadius(activeEdit.details*1000);
      }
  })


  
  
})



      

