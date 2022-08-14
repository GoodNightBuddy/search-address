const form = document.querySelector('form') as HTMLFormElement;
const addressInput  = document.getElementById('address') as HTMLInputElement;
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

type Coordinates = {
  lat: number,
  lng: number
}

type GoogleGeocodingResponse = {
  results: {geometry: {location: Coordinates}}[],
  status: 'OK' | 'ZERO_RESULTS'
}

declare global {
  interface Window {
    initMap: (coords?: Coordinates) => void;
  }
}

let map: google.maps.Map;

function initMap(coordinates?: Coordinates): void {
  let zoom;
  if(!coordinates) {
    coordinates = {lat: 51.4982, lng: 31.28935}
    zoom = 12;
  }
  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: coordinates,
    zoom: zoom ?? 16,
  });
}
window.initMap = initMap;

var script = document.createElement('script') as HTMLScriptElement;
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&callback=initMap`;
script.async = true;
document.head.append(script);


function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAdress = addressInput.value;

 axios.get<GoogleGeocodingResponse>(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAdress)}&key=${process.env.API_KEY}`)
  .then(response => {
    if(response.data.status !== 'OK') {
      throw new Error('Could not fetch location!')
    }
    const coordinates = response.data.results[0].geometry.location;

    initMap(coordinates)

    new google.maps.Marker({
      position: coordinates,
      map: map,
    });

  })
  .catch(err => {
    alert(err.message);
    console.log(err);
  })
}

form.addEventListener('submit', searchAddressHandler);