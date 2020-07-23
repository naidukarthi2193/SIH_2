const usernameInput = document.getElementById('username');
const button = document.getElementById('join_leave');
const container = document.getElementById('container');
const count = document.getElementById('count');
var connected = false;
var room;

// function addLocalVideo() {
//     Twilio.Video.createLocalVideoTrack().then(track => {
//         var video = document.getElementById('local').firstChild;
//         video.appendChild(track.attach());
//     });
// };

// function connectButtonHandler(event) {
//     event.preventDefault();
//     if (!connected) {
//         var username = usernameInput.value;
//         if (!username) {
//             alert('Enter your name before connecting');
//             return;
//         }
//         button.disabled = true;
//         button.innerHTML = 'Connecting...';
//         connect(username).then(() => {
//             button.innerHTML = 'Leave call';
//             button.disabled = false;
//         }).catch(() => {
//             alert('Connection failed. Is the backend running?');
//             button.innerHTML = 'Join call';
//             button.disabled = false;
//         });
//     }
//     else {
//         disconnect();
//         button.innerHTML = 'Join call';
//         connected = false;
//     }
// };

function connect(username) {
    var promise = new Promise((resolve, reject) => {
        // get a token from the back end
        fetch('/login', {
            method: 'POST',
            body: JSON.stringify({'username': username})
        }).then(res => res.json()).then(data => {
            // join video call
            return Twilio.Video.connect(data.token);
        }).then(_room => {
            room = _room;
            // room.participants.forEach(participantConnected);
            console.log('HERE');
            room.participants.forEach(participant => {
               if(participant.identity=='Broadcaster'){
                    participantConnected(participant);
                }
            })
            room.on('participantConnected', participantConnected);
            room.on('participantDisconnected', participantDisconnected);
            connected = true;
            updateParticipantCount();
            resolve();
        }).catch(() => {
            reject();
        });
    });
    return promise;
};

function updateParticipantCount() {
    if (!connected)
        count.innerHTML = 'Disconnected.';
    else
        count.innerHTML = (room.participants.size + 1) + ' participants online.';
};

function participantConnected(participant) {

        if(participant.identity=='Broadcaster'){
            var participant_div = document.createElement('div');
            participant_div.setAttribute('id', participant.sid);
            participant_div.setAttribute('class', 'participant');

            var tracks_div = document.createElement('div');
            participant_div.appendChild(tracks_div);

            var label_div = document.createElement('div');
            label_div.innerHTML = participant.identity;
            participant_div.appendChild(label_div);

            container.appendChild(participant_div);


            participant.tracks.forEach(publication => {
                if (publication.isSubscribed)
                    trackSubscribed(tracks_div, publication.track);
            });
            participant.on('trackSubscribed', track => trackSubscribed(tracks_div, track));
            participant.on('trackUnsubscribed', trackUnsubscribed);
        }
    updateParticipantCount();
};

function participantDisconnected(participant) {
    document.getElementById(participant.sid).remove();
    updateParticipantCount();
};

function trackSubscribed(div, track) {
    div.appendChild(track.attach());
};

function trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
};

function disconnect() {
    room.disconnect();
    while (container.lastChild.id != 'local')
        container.removeChild(container.lastChild);
    button.innerHTML = 'Join call';
    connected = false;
    updateParticipantCount();
};

function extractEmails (text)
{
    var mail = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
    return (mail.split('@')[0]);
};
    




// Client Side Javascript to receive numbers.
// $(document).ready(function(){
//   // start up the SocketIO connection to the server - the namespace 'test' is also included here if necessary
//   var socket = io.connect('http://' + document.domain + ':' + location.port + '/student');
//   // this is a callback that triggers when the "my response" event is emitted by the server.
//   // socket.on('my response', function(msg) { 
//   //   console.log(msg.data);
//   //     // $('#log').append('<p>Received: ' + msg.data + '</p>');
//   // });
//   //example of triggering an event on click of a form submit button
//   // $('form#emit').submit(function(event) {

//   var i;  

//   for (i = 0; i < 10; i++) {
//       // await sleep(500)
//       socket.emit('sessionid', {data: i%50});
//     }
//   //     return false;
//   // });
// });



var username = extractEmails(window.location.href);
console.log(username)

switch (username) {
    case 'naidukarthi2193' :
    case 'shardul.doke99' : 
    var socket = io.connect('http://' + document.domain  + '/' + username );
    break;

    default :
    var socket = io.connect('http://' + document.domain  + '/' + 'default' );
    console.log('Default case');
    break;

}


      
            // More API functions here:
            // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

        // the link to your model provided by Teachable Machine export panel
        const URL = 'https://sih2309.herokuapp.com/static/my_model/';


        let model, webcam, labelContainer, maxPredictions;
        // A $( document ).ready() block.
        $(document).ready(function() {
            
            init();
            connect(username);
            console.log("ready!");
        });

        // Load the image model and setup the webcam
        async function init() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // load the model and metadata
            // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
            // or files from your local hard drive
            // Note: the pose library adds "tmImage" object to your window (window.tmImage)
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            // Convenience function to setup a webcam
            const flip = true; // whether to flip the webcam
            webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
            await webcam.setup(); // request access to the webcam
            await webcam.play();
            window.requestAnimationFrame(loop);

            // append elements to the DOM
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            labelContainer = document.getElementById("label-container");
            for (let i = 0; i < maxPredictions; i++) { // and class labels
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        async function loop() {
            webcam.update(); // update the webcam frame
            await setTimeout(predict(), 2000);
            window.requestAnimationFrame(loop);
        }

        // run the webcam image through the image model
        async function predict() {
            // predict can take in an image, video or canvas html element
            const prediction = await model.predict(webcam.canvas);
            console.log(JSON.stringify(prediction[0]["probability"]));
            // HERE ***
            await setTimeout(()=>{}, 2000);
            socket.emit('sessionid', {data:  JSON.stringify(prediction[0]["probability"])});

            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction =
                    prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }
        }




