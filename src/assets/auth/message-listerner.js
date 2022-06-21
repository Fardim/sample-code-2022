/**
 * Receiving message from global auth application
 */
window.addEventListener('message', function (event) {
  // validate the auth host and domain before setting the data into localstorage .... 
  if(window?.__pros_env?.authUrl?.indexOf(event.origin) !== -1) {
    if (event.data) {
      console.log(event.data);
      const data = JSON.parse(event.data);
      Object.keys(data).forEach((i) => {
        localStorage.setItem(i, data[i] || '');
      });
    }
  }
});
