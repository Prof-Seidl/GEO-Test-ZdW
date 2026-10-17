const firebaseConfig = {
  apiKey: "AIzaSyCO1ddkIfOc4KrcEWw1uDDXBGdT8yD9yKU",
  authDomain: "geo-stundenwiederholungen.firebaseapp.com",
  projectId: "geo-stundenwiederholungen",
  storageBucket: "geo-stundenwiederholungen.firebasestorage.app",
  messagingSenderId: "258593006343",
  appId: "1:258593006343:web:4cc995e06d2aff3b4c9ba2",
  measurementId: "G-D2NSKJX15K"
};
var db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (err) {
  console.error("Firebase konnte nicht initialisiert werden:", err);
}
