// Client Side Javascript to receive numbers.
$(document).ready(function(){
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/student');
    // start up the SocketIO connection to the server - the namespace 'test' is also included here if necessary
    // var socket = io.connect('http://' + document.domain + ':' + location.port + '/student');
    // this is a callback that triggers when the "my response" event is emitted by the server.
    // socket.on('my response', function(msg) { 
    //   console.log(msg.data);
    //     // $('#log').append('<p>Received: ' + msg.data + '</p>');
    // });
    //example of triggering an event on click of a form submit button
    // $('form#emit').submit(function(event) {
  
    // for (i = 0; i < 1000; i++) {
    //     // await sleep(500)
    //     socket.emit('sessionid', {data: i});
    //   }
    //     return false;
    // });
  });
  document.addEventListener('DOMContentLoaded', function(){
    var socket = io.connect('https://' + document.domain + ':' + location.port + '/student');

    let character = ['a','b','c','d','e','f', 'g', 'h','i','j','k','l','m','n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
  
    const dataValues = [0];
    const labels = ['o'];
    const ctx = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'bar',
  
      // The data for our dataset
      data: {
          labels: labels,
          datasets: [{
              label: 'My First dataset',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: dataValues
          }]
      },
  
      // Configuration options go here
      options: {}
  });
  
  
  function addData(value) {
    dataValues.push(value); 
    labels.push(character[Math.floor(value)]);
    chart.update();
  }
  
  function removeData() {
    dataValues.pop();
    labels.pop();
    chart.update();
  }

  socket.on('my response', function(msg) { 
    console.log(msg.data);
    addData(msg.data);
      
  });
  
  })
  