import React ,{useState} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const Menu = ({fileElement}) => {

  const [copied,setCopied] = useState(false);

  function clicked(e){
    alert("CID copied!");
  }
  function handleDownloadEvent(fileElementItem){
    let filename = fileElementItem.filename;
    let filenameWithNoWhiteSpace = fileElementItem.filenameWithNoWhiteSpace;
    let CID = fileElementItem.cid;
    let jsonParseFileKey = JSON.parse(fileElementItem.fileKey);
    let fileType = fileElementItem.fileType;

    //Initialization Vector: Decode base64-encoded string back into Uint8Array type.
    const decodedb64Uint8Array  = window.atob(fileElementItem.iv);
    const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
    const ivUint8Array = new Uint8Array(buffer);

    for (let i = 0; i < decodedb64Uint8Array.length; i++) {
      ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
    }

    crypto.subtle.importKey("jwk", jsonParseFileKey, { 'name': 'AES-CBC' }, true, ['encrypt', 'decrypt']).then(cryptoKeyImported =>{
      fetch(`https://${CID}.ipfs.w3s.link/ipfs/${CID}/${filenameWithNoWhiteSpace}`).then(res => {
        let result = res.blob(); // Convert to blob() format
        console.log(result);
        return result;
      }).then(async res => {
  
          // Convert blob to arraybuffer
          const fileArrayBuffer = await new Response(res).arrayBuffer();

          console.log(buffer);
          window.crypto.subtle.decrypt({name: 'AES-CBC', iv: ivUint8Array}, cryptoKeyImported, fileArrayBuffer).then(decrypted => {
            //Convert ArrayBuffer to Blob and Download
            const blob = new Blob([decrypted], {type: fileType} ) // convert decrypted arraybuffer to blob.
            const aElement = document.createElement('a');
            aElement.setAttribute('download', `${filename}`);
            const href = URL.createObjectURL(blob);
            aElement.href = href;
            aElement.setAttribute('target', '_blank');
            aElement.click();
            URL.revokeObjectURL(href);
  
          }).catch(console.error);
        
      })
  
    })
    

  }

  return (
    <div className='Context-Menu'>

        
        <CopyToClipboard text={fileElement.cid} onCopy={() => setCopied(true)} className='CopyCid-Menu'>
          <button onClick={clicked}>Copy CID</button>
        </CopyToClipboard>

        <button className="Download-Menu" onClick={()=> {handleDownloadEvent(fileElement)} }>Download</button>

    </div>

    
  )
}

export default Menu
