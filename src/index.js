import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HashRouter, Route, Routes } from "react-router-dom";

//User-defined components
import Login from './login';
import Main from './routes/main';
import Home from './routes/home';
import UploadFile from './routes/UploadFile';
import TeamRoomComponent from './routes/team-rooms';
import RoomComponent from './routes/team-rooms-sub-components/room-component';

/* import App from './App'; */
import GUN from 'gun';
import Register from './register';
require('gun/sea');
require('gun/lib/open.js');
require('gun/lib/unset') // Manually require gun.unset() to remove item(s) on gun

const gundb = GUN({peers: ['http://localhost:6100/gun'/* , 'https://boiling-spire-00043.herokuapp.com/gun' */, window.location.origin + '/gun']});
const user = gundb.user().recall({sessionStorage: true});

let userSessionObj = {
  isLoggedIn: (user.is) ? true : false
}

let roomUUIDObj = {
    roomUUIDProperty: ''
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <div>
        <Routes>
            <Route path='/' element={<Login userInstance={user} userSession={userSessionObj}/>} />
            <Route path="/register" element={<Register userInstance={user} userSession={userSessionObj}/>} />
            <Route path='/main' element={<Main userInstance={user} userSession={userSessionObj}/>}>
              <Route index element={<Home userInstance={user}/>} />
              <Route path='upload' element={<UploadFile userInstance={user}/>} />
              <Route path='Teams' element={<TeamRoomComponent roomUUIDObj={roomUUIDObj} gunInstance={gundb} userInstance={user} />}/>
              
              {/* Cannot embed this route inside a route witn <TeamRoomComponent> */}
              <Route path='Teams/room' element={<RoomComponent gunInstance={gundb} userInstance={user} roomUUIDObj={roomUUIDObj}/>} />

            </Route>
        </Routes>
      </div>
    </HashRouter>
  </React.StrictMode>
);
