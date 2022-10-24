import React, { useState, useEffect, useReducer } from "react";

import UploadFile from "./UploadFile";

import "./routes-css/home.css"

import word from '../ms-word.png'

import pdf from '../pdf.png'

import file from '../file.png'

import Menu from './Menu.jsx'

/* const initialState = {
  rooms: []
}


function reducerHandler(currentState, newRoom){
  return {  rooms: [newRoom, ...currentState.rooms]  }
} */

function Home({userInstance}) {
  let [email, setEmail] = useState('');
  let [fileListState, setFileListState] = useState([]);
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
      console.log(key);
      setFileListState(oldList => [...oldList, {filenameWithNoWhiteSpace: key.filenameWithNoWhiteSpace ,filename: key.filenameProperty, cid: key.CID_prop, fileKey: key.fileKey, iv: key.iv, fileType: key.fileType}]);
    });

  },[])
  

/*   async function DownloadHandle(cid){
    let cid_temp = cid;
    let localFilename;
    await userInstance.get('fileObjectList').get(`${cid}`).on(data => {
      localFilename = data.filenameProperty;
    });
    fetch(`https://${cid_temp}.ipfs.w3s.link/ipfs/${cid_temp}/${localFilename}`).then(res => {
      let result = res.blob();
      console.log(result);
      return result;
    }).then(res => {
      const aElement = document.createElement('a');
      aElement.setAttribute('download', `${localFilename}`);
      const href = URL.createObjectURL(res);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
    })
  } */

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
            <p>NOTE: Metadata of each file is transmitted across GUN peers, so you may see duplicates of the same file listed below.</p>
            <br></br>
                
                 {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                  <div className="file-container">

                   {fileListState.map((elem, index) =>                 
                        <div className='files' key={index} onContextMenu={event => showMenu(event, index)}>   

                            {index === isActive.activeIndex &&isMenu && <Menu fileElement={elem} />}
                            
                            <div className="fileIcon">
                              {console.log(elem.fileType)}
                                <img src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file } className='icon-folder-group-component'/>
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