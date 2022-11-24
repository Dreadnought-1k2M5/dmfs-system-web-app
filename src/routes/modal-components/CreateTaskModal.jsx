import React, { useEffect, useState, useReducer, version } from "react";
import { Web3Storage } from 'web3.storage';

import { SEA } from "gun";

import './modal-css/CreateTaskModal.css';

export default function CreateTaskComponent({versionState, roomUUIDObj, gunInstance, userInstance, handleClose, show}){
    let [taskTextState, setTaskTextState] = useState('');
    const toggleClassname = show ? "modal-create-task modal-create-task-container" : "modal-create-task display-none";
    useEffect(()=>{
        
    }, []);
    async function addTaskHandler(){
        
        await userInstance.get('alias').once(async userAlias => {
            //If versionState is collaborativePanelState
            if(versionState.index == undefined){
                await gunInstance.get(`taskList_${versionState.filename}${roomUUIDObj.roomUUIDProperty}_latest`).set({
                    content: taskTextState,
                    date: new Date(),
                    user: userAlias
                })
            }else if(versionState.index != undefined){
                await gunInstance.get(`taskList_${versionState.filename}${roomUUIDObj.roomUUIDProperty}_${versionState.index}`).set({
                    content: taskTextState,
                    date: new Date(),
                    user: userAlias
                })
            }
        })

        setTaskTextState('');
        handleClose();
    }
    return (
        <div className={toggleClassname}>
            <div className="create-task-container">
                <div className="create-task-box-exit">
                    <button onClick={handleClose} className="closeButton">X</button>
                </div>

                <div className="create-task-form">
                    <h3>Create Task</h3>
                    <p className="p-versionIndex-css">
                        {versionState.index == undefined ? 
                            <span> Version Index: <span className="p-versionIndex-green"> Latest Version</span> </span>
                         : <span> Version Index: <span className="p-versionIndex-green"> {versionState.index == undefined ? "Latest version" : versionState.index} </span> </span>}
                        
                    </p>
                    <input className="task-textbox-css" type="text" value={taskTextState} onChange={(e) => setTaskTextState(e.target.value)} /> 
                    <button className="add-task-btn-css" onClick={addTaskHandler}>Add Task</button>
                </div>
            </div>
        </div>
    )
}