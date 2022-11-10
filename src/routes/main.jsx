import React, { useReducer } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import './routes-css/main.css'
import search from '../search-icon.png'


import { useState } from "react";



function Main({gunInstance, userInstance, userSession}) {
  let navigate = useNavigate();
  let [username, setUsername] = useState('');
  let [homeActive, setHomeActive] = useState('true'); // This is for the 'Home' NavLink

  useEffect(()=>{
    userInstance.get('alias').on(v => setUsername(v) ); // listens to node 'alias' and pass its value to v as argument then setUsername to change state variable
    navigate('/main'); // keep in mind that current active navlinks will no longer be active when url changes
    if(!userSession.isLoggedIn){
      navigate('/');
    }
  

  }, []);


  function handleLogout(){
    userInstance.leave();
    userSession.isLoggedIn = false;
    document.location.reload(); //reload to execute callback in useEffect
  }


  return (
    <div className="App">
      <div className="top-bar-parent">
          
        <div className="top-navbar">
            <div className="flex-item-1">
                <div className="title-subtitle-box">
                      <h1>Project MINERVA</h1>
                      <p>Decentralized Document Management and File-Sharing System</p>
                </div>
                <div className="navlink-flexbox">
                    <NavLink onClick={()=>  setHomeActive(true) } className={()=> homeActive ? "navlink-component-active" : "navlink-component" } to="/main"> Team Rooms</NavLink>          
                    <NavLink onClick={()=>  setHomeActive(false)} className={({isActive})=> isActive ? "navlink-component-active" : "navlink-component" } to="mydocs"> My Documents</NavLink>
                </div>
            </div>

            <div className="flex-item-2-username-logout-box">
                <h3>Hello {username}</h3>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
        </div>
          
      </div>

      <div className="right-component">


        <div className="outlet-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
