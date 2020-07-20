// Client Side Javascript to receive numbers.
$(document).ready(function () {
  var socket1 = io.connect(
    "http://" + document.domain + ":" + location.port + "/shardul.doke99"
  );
  var socket2 = io.connect(
    "http://" + document.domain + ":" + location.port + "/naidukarthi2193"
  );
  var socket3 = io.connect(
    "http://" + document.domain + ":" + location.port + "/tejasshenoy6"
  );
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
document.addEventListener("DOMContentLoaded", function () {
  let broadcaster = document.getElementById("broadcaster");
  let ctx1, ctx2, ctx3, chart1, chart2, chart3;

  let character1 = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
  ];

  var dataValues1 = [0];
  var labels1 = ["o"];
  let character2 = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
  ];

  const dataValues2 = [0];
  const labels2 = ["o"];
  let character3 = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
  ];

  const dataValues3 = [0];
  const labels3 = ["o"];

  var socket1 = io.connect(
    "http://" + document.domain + ":" + location.port + "/shardul.doke99"
  );
  var socket2 = io.connect(
    "http://" + document.domain + ":" + location.port + "/naidukarthi2193"
  );
  var socket3 = io.connect(
    "http://" + document.domain + ":" + location.port + "/tejasshenoy6"
  );

  function addData1(value) {
    dataValues1.push(value);
    labels1.push(character1[Math.floor(value)]);
    chart1.update();
  }

  function addData2(value) {
    dataValues2.push(value);
    labels2.push(character2[Math.floor(value)]);
    chart2.update();
  }

  function addData3(value) {
    dataValues3.push(value);
    labels3.push(character3[Math.floor(value)]);
    chart3.update();
  }

  function removeData1() {
    dataValues1.shift();
    labels1.shift();
    chart1.update();
  }

  function removeData2() {
    dataValues2.shift();
    labels2.shift();
    chart2.update();
  }

  function removeData3() {
    dataValues3.shift();
    labels3.shift();
    chart3.update();
  }

  socket1.on("my response", function (msg) {
    dataValues1.push(msg.data);
    broadcaster.style.color = `rgba(255, ${msg.data}, 0, ${msg.data})`;
    console.log("before", dataValues1);
    if (dataValues1.length > 5) {
      ctx1 = document.getElementById("myChart1").getContext("2d");
      chart1 = new Chart(ctx1, {
        // The type of chart we want to create
        type: "bar",

        // The data for our dataset
        data: {
          labels: labels1,
          datasets: [
            {
              label: "My First dataset",
              backgroundColor: "rgb(255, 99, 132)",
              borderColor: "rgb(255, 99, 132)",
              data: dataValues1,
            },
          ],
        },

        // Configuration options go here
        options: {},
      });
      addData1(dataValues1);
    }
    if (dataValues1.length > 50) {
      console.log("before", dataValues1);

      removeData1();
    }
  });

  socket2.on("my response", function (msg) {
    dataValues2.push(msg.data);
    if (dataValues2.length > 5) {
      ctx2 = document.getElementById("myChart2").getContext("2d");
      chart2 = new Chart(ctx2, {
        // The type of chart we want to create
        type: "bar",

        // The data for our dataset
        data: {
          labels: labels2,
          datasets: [
            {
              label: "My Second dataset",
              backgroundColor: "rgb(255, 99, 132)",
              borderColor: "rgb(255, 99, 132)",
              data: dataValues2,
            },
          ],
        },

        // Configuration options go here
        options: {},
      });
      addData2(dataValues2);
    }
    if (dataValues2.length > 50) {
      removeData2();
    }
  });

  socket3.on("my response", function (msg) {
    dataValues3.push(msg.data);
    if (dataValues3.length > 5) {
      ctx3 = document.getElementById("myChart3").getContext("2d");
      chart3 = new Chart(ctx3, {
        // The type of chart we want to create
        type: "bar",

        // The data for our dataset
        data: {
          labels: labels3,
          datasets: [
            {
              label: "My Thiru dataset",
              backgroundColor: "rgb(255, 99, 132)",
              borderColor: "rgb(255, 99, 132)",
              data: dataValues3,
            },
          ],
        },

        // Configuration options go here
        options: {},
      });
      addData3(dataValues3);
    }
    if (dataValues3.length > 50) {
      removeData3();
    }
  });
});
