//GLOBALS
let storeCenter = { lng: -80.2736907, lat: 25.933373 }
let delivery_areas = localStorage.getItem('delivery_areas') ? JSON.parse(localStorage.getItem('delivery_areas')) : []
let currentLayers = []
let colorCount = 0
let initialMap = false
let modalMap = false 
// let activeEdit = false use for later ? 
let editing = false
let clickedId = 0 

localStorage.setItem('delivery_areas', JSON.stringify(delivery_areas))

if(initialMap === false) { //ENSURES RENDERS ONLY ONCE
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
    $(`<div class="area" id=${element.id}>${element.areaName}</div>`).appendTo('div.deliveryAreas').append('<a class="remove">remove</a>')
    $(`#${element.id}`).css({ 'border-color': `${element.color}` })


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


 //MODAL FUNCTIONS 

  //ADD NEW AREA OR EDIT - button will operate differently depending on editing being true or false 
  $('button.save').click(function(event){ 

    if(editing === false) { 
    console.log('creating new delivery area')
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
     $(`<div class="area" id=${newArea.id}>${newArea.areaName}</div>`).appendTo('div.deliveryAreas').append('<a class="remove">remove</a>')
     $(`#${newArea.id}`).css({'border-color': `${newArea.color}`})
    
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
  } else {

    console.log('editing delivery area')
  let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 
  deliveryAreasCopy.forEach((element, index)=> {
    if(element.id == clickedId) {
      let areaName = $('#area-name').val()
      let minimumOrder = $('#minimum-order').val()
      let deliveryCharge = $('#delivery-charge').val()
      let maximumTime = $('#maximum-time').val()

      element.areaName = areaName
      element.minimumOrder = minimumOrder
      element.deliveryCharge = deliveryCharge
      element.maximumTime = maximumTime

      $(`#${element.id}`).replaceWith(`<div class="area" id=${element.id}>${element.areaName}</div>`)
      $(`#${element.id}`).append('<a class="remove">remove</a>')
      $(`#${element.id}`).css({ 'border-color': `${newArea.color}` })
    }
   })
   localStorage.setItem('delivery_areas', JSON.stringify(deliveryAreasCopy)) 
   editing = false 
  }
})
  
  //EDIT DELIVERY AREAS 
  $(document).on('click', '.area', function(event){
  editing = true
    
  let id = $(this).attr('id') 
  clickedId = id //Used for conditional in button 
  let deliveryAreasCopy = JSON.parse(localStorage.getItem('delivery_areas')) 

  deliveryAreasCopy.forEach((element,index) => {

    if(element.id == id) {  //this will open a modal with the elements properties in the input bar 
    $('#newAreaModal').modal()
    $('#newAreaModal').on('shown.bs.modal', function() {
      $('#area-name').val(`${element.areaName}`)
      $('#minimum-order').val(`${element.minimumOrder}`)
      $('#delivery-charge').val(`${element.deliveryCharge}`)
      $('#maximum-time').val(`${element.maximumTime}`)
    })

    let areaName = $('#area-name').val()
    let minimumOrder = $('#minimum-order').val()
    let deliveryCharge = $('#delivery-charge').val()
    let maximumTime = $('#maximum-time').val()
    console.log(element)

      // currentLayers[index].setRadius(activeEdit.details*1000); add in later 
      }
  })
})



      

