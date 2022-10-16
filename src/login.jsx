import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import './login-register.css'

export default function Login({userInstance, userSession}){
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [isLoggedin, setIsLoggedin] = useState(userSession.isLoggedIn); // to set and check if a user is logged in.
    
    let navigate = useNavigate();
    useEffect(()=>{
        if(isLoggedin){
            navigate('/main');
        }
    });
    function handleSubmit(){
        console.log(`${username} ${password}`)
        userInstance.auth(username, password, function(at){
            if(at.err){
                alert("Wrong username or password!");
                return 0;
            }else{
                /* document.location.reload(); */
                setIsLoggedin(true); // change state to trigger useEffect to navigate to main
                userSession.isLoggedIn = true; // set to true so that when it renders the main.jsx, it doesn't redirect back to login.jsx
            }
        });
    }
    return(
        <div className="page-container">
                <div className="login-register-form-container">
                    <div className="form-div">
                        <div className="title-box">
                            <h1>Project MINERVA</h1>
                            <p>Decentralized Document Management and File-Sharing System</p>
                        </div>
                        <div className="label-textbox-container">
                            <label>
                                Username:<br></br>
                                <input type="text" value={username} onChange={(e)=> {setUsername(e.target.value)}}/>
                            </label>
                            <label>
                                Password:<br></br>
                                <input type="password" value={password} onChange={(e)=> {setPassword(e.target.value)}}/>
                            </label>
                        </div>
                        <div className="login-register-form-submit-container">
                            <input type="button" className="login-register-css" value="Sign In" onClick={handleSubmit} />
                        </div>
                    </div>
                    <div className="login-register-form-submit-container-link-container">
                            <p>Not a user?  <Link className="sign-up-link" to="register">Sign Up</Link></p>
                    </div>
                </div>
            </div>
    );
}