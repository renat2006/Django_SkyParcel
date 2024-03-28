var requestOptions = {
  method: 'GET',
};

fetch("https://api.geoapify.com/v1/geocode/autocomplete?text=Mosco&apiKey=40f195dcf70340788eabb94c0ffbc0df", requestOptions)
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
