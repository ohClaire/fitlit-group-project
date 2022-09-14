const fetchData = (fileName, dataKey) => {
  return fetch(`http://localhost:3001/api/v1/${fileName}`)  
    .then(response => response.json())
    .then(data => data[dataKey])
    .catch(error => console.log('There was a problem loading your data. Please try again.', error))
};

const postData = (url, bodyData) => {
  const requestData = {
  method: 'POST',
  body: JSON.stringify(bodyData),
  headers: {
      'Content-Type': 'application/json'
  }
}
  fetch(url, requestData)
};

export { fetchData, postData };

