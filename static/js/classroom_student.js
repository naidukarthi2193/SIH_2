// Client Side Javascript to receive numbers.
$(document).ready(function(){
  // start up the SocketIO connection to the server - the namespace 'test' is also included here if necessary
  var socket = io.connect('https://' + document.domain + ':' + location.port + '/student');
  // this is a callback that triggers when the "my response" event is emitted by the server.
  // socket.on('my response', function(msg) { 
  //   console.log(msg.data);
  //     // $('#log').append('<p>Received: ' + msg.data + '</p>');
  // });
  //example of triggering an event on click of a form submit button
  // $('form#emit').submit(function(event) {

  var i;  

  for (i = 0; i < 10; i++) {
      // await sleep(500)
      socket.emit('sessionid', {data: i%50});
    }
  //     return false;
  // });
});