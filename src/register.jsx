import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import './login-register.css'

export default function Register({gunInstance, userInstance, userSession}){
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [email, setEmail] = useState('');
    let [userAccount, setUserAccount] = useState(userSession.isLoggedIn);
    let [isRegistered, setRegisterStatus] = useState(false); // this state is to know if the registration is successful. CHECK LINE 50 - setUseraccount(true)

    let navigate = useNavigate();
    useEffect(()=>{
        if(userAccount){
            navigate('/main');
        }
        else if (isRegistered){
            navigate('/');
        }
    });
    function handleSubmit(){
        console.log(`${username} ${password}`);
        let isAliasAlreadyExist = false;
        userInstance.create(username, password, function(ack){
            if(ack.pub){
                console.log(`USER CREATED!\n Public key: ${ack.pub}`);
                initialAuth();
            }else if (ack.err){
                alert(`${ack.err}\nPlease Try A Different Username.`);
                return 0;
            }

        });
    }

    function initialAuth(){
        userInstance.auth(username, password, function(at){
            if(at.err){
                console.log("USER NOT REGISTERED at this stage");
                return;
            }else if (at.id){
                console.log("Initial Log In!");
                userInstance.get('userProfile').put({emailProp: email}, (ack)=>{
                    if(ack.ok){
                        console.log(`Email Inserted\n Response: ${ack.ok}`);
                        console.log("Initial auth over. Signing out.");
                        userInstance.leave();
                        console.log("Signed out.");
                        setRegisterStatus(true);
                        return;
                    }
                    alert(`Failed to insert email into the user graph!\n Response: ${ack.err}`);
                    console.log("Initial auth over. Signing out.");
                    userInstance.leave();
                    console.log("Signed out.");
                    return;
                } );
            }
        });
    }
    return(
        <div className="page-container">
                <div className="login-register-form-container">
                    <div className="form-div">
                        <div className="title-box-register">
                            <h1>Project MINERVA</h1>
                            <p>Decentralized Document Management and File-Sharing System</p>
                        </div>
                        <div className="label-textbox-container-register">
                            <label>
                                Username:<br></br>
                                <input type="text" value={username} onChange={(e)=> {setUsername(e.target.value)}}/>
                            </label>
                            <label>
                                Password:<br></br>
                                <input type="password" value={password} onChange={(e)=> {setPassword(e.target.value)}}/>
                            </label>
                            <label>
                                Email:<br></br>
                                <input type="email" value={email} onChange={(e)=> {setEmail(e.target.value)}}/>
                            </label>
                        </div>
                        <div className="login-register-form-submit-container">
                            <input className="login-register-css" type="button" value="Register" onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
    );
}