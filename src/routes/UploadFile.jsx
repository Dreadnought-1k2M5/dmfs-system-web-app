import React from "react";
import './routes-css/upload-file.css';
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlQzY1QkMwZTU4NEFCNEFFQjdhZjMyNjdEMjI5MTZDOTQ1NUJBNkQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM0NTgzMzEwMTUsIm5hbWUiOiJjcDItbWluZXJ2YS1kbS1mc3MifQ.b4RKubGBnqq_x37Dm8xkocGvs05evwyS0x1U6_4CS5E'});

function UploadFile({userInstance, handleClose, show}) {

  let fileInput = React.createRef();

  async function generateKeyFunction(){
    return crypto.subtle.generateKey({ 'name': 'AES-CBC', 'length': 256 }, true, ['encrypt', 'decrypt']);
  }

  async function HandleSubmit(event){
    event.preventDefault();

    let fileName, lastModdifiedVar, CID, fileFormat, exportedKey;
    const fr = new FileReader();

    const getFileType = fileInput.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
    fileName = fileInput.current.files[0].name;
    lastModdifiedVar = fileInput.current.files[0].lastModdified;

    console.log(fileInput.current.files[0]);
    
    fr.readAsArrayBuffer(fileInput.current.files[0]);

    fr.addEventListener('load', async (e)=>{
      let data = e.target.result; // e.target.result is similar to fr.result
      let iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await generateKeyFunction();
      console.log(data);
      console.log(iv);
      
      crypto.subtle.encrypt({ 'name': 'AES-CBC', iv }, key, data)
      .then(async encrypted => {
          console.log(encrypted); // encrypted is an ArrayBuffer
          alert('The encrypted data is ' + encrypted.byteLength + ' bytes long'); // encrypted is an ArrayBuffer
          fileFormat = new File([encrypted], fileName, {type: getFileType, lastModified: lastModdifiedVar} ) // convert encrypted arraybuffer to blob.
          console.log("ENCRYPTED:");
          console.log(fileFormat);
          const fileInArray = [fileFormat]
          exportedKey = crypto.subtle.exportKey("jwk", key);
          console.log(exportedKey);

          
          const res_CID = await client.put(fileInArray);
          
          CID = res_CID;

/*           let obj = userInstance.get("obj").put({filenameProperty: fileName, CID_prop: CID, jsonKey: exportedKey}); */

          await userInstance.get('fileObjectList').set(`${fileName}`).put({filenameProperty: fileName, CID_prop: CID, jsonKey: exportedKey}); // set of names - each node is an object with a file name and corresponding CID
          alert("FILE ADDED");
          window.location.reload();

          //data = encrypted; // change value of data to encrypted for decrypting - this is for testing purposes only

          //Download blob
/*           const aElement = document.createElement('a');
          aElement.setAttribute('download', `${fileInput.current.files[0].name}`);
          const href = URL.createObjectURL(blob);
          aElement.href = href;
          aElement.setAttribute('target', '_blank');
          aElement.click();
          URL.revokeObjectURL(href); */
          //-------------


          //Decrypt
/*        crypto.subtle.decrypt({ 'name': 'AES-CBC', iv }, key, data).then(decrypted => {
            //Convert ArrayBuffer to Blob and Download
            const blob = new Blob([decrypted], {type: getBlobType} ) // convert decrypted arraybuffer to blob.
            const aElement = document.createElement('a');
            aElement.setAttribute('download', `${fileInput.current.files[0].name}`);
            const href = URL.createObjectURL(blob);
            aElement.href = href;
            aElement.setAttribute('target', '_blank');
            aElement.click();
          }).catch(console.error);URL.revokeObjectURL(href);
             */
            //-------------

      }).catch(console.error);
    });


    //WARNING: The following code may execute first before the crypto.subtle.encrypt() "promise" process ends.

/*     const res_CID = await client.put(blobFormat);
    
    fileName = fileInput.current.files[0].name;
    CID = res_CID;

    userInstance.get('fileObjectList').set(`${CID}`).put({filenameProperty: fileName, CID_prop: CID, isEncrypted: (exportedKey ? true : false)}); // set of names - each node is an object with a file name and corresponding CID
    alert("FILE ADDED"); */
  }

  const toggleClassname = show ? "modal modal-container" : "modal display-none";
  return (
    <div className={toggleClassname}>
      <div className="upload-container">
        <div className="title-container">
          <h3>Upload Document</h3>
          <button onClick={handleClose}>X</button>
        </div>
        <form className="flex-upload-container" >
          <div className="flex-item1">
            <label>Upload File(s): </label>
            <input type="file" accept=".doc,.DOC,.docx,.DOCX,.txt,TXT" className="upload-btn-class" ref={fileInput}></input>
          </div>
          <div className="flex-item2">
            <label>Choose Where to Pin Data:</label>
            <div className="checkbox-container">
              <input type="checkbox" name="web3storage" value="web3storage"/>
              <label> Web3Storage</label><br/>
              <input type="checkbox" name="ipfsLocal" value="local"/>
              <label> My own IPFS node</label><br/>
            </div>
          </div>
          <div className="flex-item-last">
            <button type="submit" className="submit-btn" onClick={HandleSubmit}>Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadFile;
