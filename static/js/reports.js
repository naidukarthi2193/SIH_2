
const ctx1 = document.getElementById('myChart').getContext('2d');
const chart1 = new Chart(ctx1, {
  // The type of chart we want to create
  type: 'line',

  // The data for our dataset
  data: {
      labels: labels1,
      datasets: [{
          label: 'My First dataset',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: dataValues1
      }]
  },

  // Configuration options go here
  options: {}
});