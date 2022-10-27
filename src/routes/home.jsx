import React, { useState, useEffect, useReducer } from "react";

import UploadFile from "./UploadFile";

import "./routes-css/home.css"

import word from '../ms-word.png'

import pdf from '../pdf.png'

import file from '../file.png'

import Menu from './Menu.jsx'

const currentItemListState = {
  items: []
}


function itemListReducerHandler(currentItemListState, newItem){
  return {  items: [newItem, ...currentItemListState.items]  }
}

function Home({userInstance}) {
  let [email, setEmail] = useState('');
  let [itemListState, dispatchItemListState] = useReducer(itemListReducerHandler, currentItemListState)
  let [isModalViewed, setIsModalViewed] = useState(false);

  //let [fileLists, dispatch] = useReducer(reducerHandler, initialState);    


  function showModal(){
    setIsModalViewed(true);
  }
  function hideModal(){
    setIsModalViewed(false);
  }

  useEffect(()=>{
    userInstance.get('userProfile').once((data)=>setEmail(data.emailProp));
  }, []);

  useEffect(()=>{
    userInstance.get('fileObjectList').map().once((key)=>{
      delete key._;
      console.log(key);
      dispatchItemListState({filenameWithNoWhiteSpace: key.filenameWithNoWhiteSpace, filename: key.filenameProperty, cid: key.CID_prop, fileKey: key.fileKey, iv: key.iv, fileType: key.fileType});
    });



  },[])

  const filteredItems = () =>{
    console.log("filtered documents function called")
    const filteredItemList = itemListState.items.filter((value, index) => {
      console.log(value)
        const _value = JSON.stringify(value);
        return (
            index ===
            itemListState.items.findIndex(obj => {
            return JSON.stringify(obj) === _value
            })
        )
    })

    return filteredItemList;
  }

  const [isMenu, setMenu] = useState(()=>false)
  const [isActive, setActive] = useState({
    activeIndex: 0
  })
  const showMenu = (event, index) => {
    event.preventDefault();
    setActive({...isActive, activeIndex: index});
    console.log(index)   
    setMenu(true);
  }
  const hideMenu = () => {
    setMenu(false);
  }


  return (
    <div className="home-parent-container"  onClick={hideMenu} >
      <div className="top-toolbar">
        <button className="toolbar-upload-btn" onClick={showModal}>Upload</button>
        <UploadFile userInstance={userInstance} handleClose={hideModal} show={isModalViewed}/>
      </div>
      <div className="home-container" onScroll={hideMenu}>
            <br></br>
            <h3>
              My Documents:
            </h3>
            <br></br>
                
                 {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                  <div className="file-container">
                    {filteredItems().map((elem, index)=>
                        <div className='files' key={index} onContextMenu={event => showMenu(event, index)}>   

                          {index === isActive.activeIndex && isMenu && <Menu fileElement={elem} />}
                          
                          <div className="fileIcon">
                            {console.log(elem.fileType)}
                              <img src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file } className='icon'/>
                          </div>
                          
                          <div className="filename">
                              <p>{elem.filename}</p>    
                          </div>
                                                                                                                                                                          
                      </div>   
                    )}

                    
                  </div>           
      </div>
    </div>
    
  );
}

export default Home;