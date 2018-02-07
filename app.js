  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBEagO1eUpMcdMCAnHawJnZqjRRF29fgd4",
    authDomain: "project-1-65a27.firebaseapp.com",
    databaseURL: "https://project-1-65a27.firebaseio.com",
    projectId: "project-1-65a27",
    storageBucket: "project-1-65a27.appspot.com",
    messagingSenderId: "185964613097"
  };
  firebase.initializeApp(config);

var database = firebase.database();
var locationRef = database.ref("/locations");
var topicRef = database.ref("/topics");
var priceRef = database.ref("/price");