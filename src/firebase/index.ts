import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/database';

const config = {
  apiKey: 'AIzaSyDQxVG0YgF30AJq-fpclM2sdecM-umH-zw',
  authDomain: 'drink-alexguo.firebaseapp.com',
  databaseURL: 'https://drink-alexguo.firebaseio.com',
  projectId: 'drink-alexguo',
  storageBucket: 'drink-alexguo.appspot.com',
  messagingSenderId: '891863376076',
  appId: '1:891863376076:web:43e8380311c98693bce269',
  measurementId: 'G-EMDCRKRSE5',
};

export const app: firebase.app.App = firebase.initializeApp(config);
export const db: firebase.database.Database = firebase.database();
firebase.analytics();