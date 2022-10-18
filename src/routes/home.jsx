import React, { useState, useEffect, useReducer } from "react";

import UploadFile from "./UploadFile";

import "./routes-css/home.css"

import "./routes-css/home.css"

import word from '../ms-word.png'

import pdf from '../pdf.png'

import file from '../file.png'

import Menu from './Menu.jsx'


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
        <button className="toolbar-btn" onClick={showModal}>Upload</button>
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

                            {index === isActive.activeIndex &&isMenu && <Menu cid={elem.cid}/>}
                            
                            <div className="fileIcon">
                                <img src={ (elem.filename.split('.').pop() === "docx") ? word : (elem.filename.split('.').pop() === "pdf") ? pdf : file } className='icon'/>
                            </div>
                            
                            <div className="filename">
                               <p>{elem.filename}</p>    
                            </div>

                            {/* <button className="download-btn" onClick={async ()=>{
                            let cid_temp = elem.cid
                            let localFilename = elem.filename
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
                          }}>Download</button>  */}
                                                                                                                                                                            
                        </div>               
                    )}    
                  </div>           
      </div>
    </div>
    
  );
}

export default Home;