import React, { useState, useEffect, useReducer } from "react";

import UploadFile from "./UploadFile";

import "./routes-css/home.css"

import "./routes-css/home.css"

import word from '../ms-word.png'

import pdf from '../pdf.png'

import file from '../file.png'

import ContextMenu from "./ContextMenu";



function Home({userInstance}) {
  let [email, setEmail] = useState('');
  let [fileListState, setFileListState] = useState([]);
  let [isModalViewed, setIsModalViewed] = useState(false);

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
      setFileListState(oldList => [...oldList, {filename: key.filenameProperty, cid: key.CID_prop}]);
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

   const [isContextMenu, setContextMenu] = useState(false);

   const rightClick = (e) => {  
     e.preventDefault();
     console.log('Right clicked');
     setContextMenu(true); 
   }

   function clickAny(e){
    if(isContextMenu && e.type === 'click'){
      setContextMenu(false);
    }
   }
    function scrollWhileRC(e) {
     if(isContextMenu){
       setContextMenu(false);
     }
    }

   

  return (
    <div className="home-parent-container" onClick={clickAny}  >
      <div className="top-toolbar">
        <button className="toolbar-btn" onClick={showModal}>Upload</button>
        <UploadFile userInstance={userInstance} handleClose={hideModal} show={isModalViewed}/>
      </div>
      <div className="home-container" onScroll={scrollWhileRC}>
            <br></br>
            <h3>
              My Documents:
            </h3>
            <p>NOTE: Metadata of each file is transmitted across GUN peers, so you may see duplicates of the same file listed below.</p>
            <br></br>
                
                 {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                  <div className="file-container">
                   {fileListState.map(elem =>                 
                        <div className="files" onContextMenu={rightClick} >   

                            {isContextMenu && <ContextMenu/>}
                            
                            <div className="fileIcon">
                                <img src={ (elem.filename.split('.').pop() === "docx") ? word : (elem.filename.split('.').pop() === "pdf") ? pdf : file } className='icon'/>
                            </div>
                            
                            <div className="filename">
                               <p>{elem.filename}</p>    
                            </div>
                                 
                                
                            {/* {elem.cid} */}
                            
                            {/* <button className="download-btn" onClick={async ()=>{
                            let cid_temp = elem.cid;
                            let localFilename = elem.filename;
                            console.log();
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
                          }}>Download</button> */}
                        </div>               
                    )}    
                  </div>           
      </div>
    </div>
    
  );
}

export default Home;