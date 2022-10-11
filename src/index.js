import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HashRouter, Route, Routes } from "react-router-dom";

import Login from './login';
import Main from './routes/main';
import Home from './routes/home';
import UploadFile from './routes/UploadFile';

/* import App from './App'; */
import GUN from 'gun';
import Register from './register';
require('gun/sea');

const gundb = GUN({peers: ['http://localhost:6100/gun']});
const user = gundb.user().recall({sessionStorage: true});

let userSessionObj = {
  isLoggedIn: (user.is) ? true : false
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
            </Route>
        </Routes>
      </div>
    </HashRouter>
  </React.StrictMode>
);
