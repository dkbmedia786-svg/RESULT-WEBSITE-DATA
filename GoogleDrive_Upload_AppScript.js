// ==============================================================================
// GOOGLE APPS SCRIPT CODE (Code.gs)
// GOOGLE DRIVE DIRECT UPLOAD BACKEND
// ==============================================================================
// 1. Google Drive me ek naya folder banayein 'Website_Photos' naam ka.
// 2. Us folder mein Right Click -> Share -> "Anyone with the link" as Viewer select karein taaki website par sabhi ko photo dikh sake.
// 3. Us folder ki URL se uski ID nikal lein (URL mein `folders/` ke baad wala lamba text).
// 4. Niche diye gaye `DRIVE_FOLDER_ID` mein wo Folder ID daal dein.
// 5. Extensions -> Apps Script par jayein, naya project banayein, aur is code ko 'Code.gs' mein paste karke save karein.
// 6. Deploy -> New Deployment -> "Web App" select karein.
//    - "Execute as": "Me" (Aapka email)
//    - "Who has access": "Anyone"
// 7. Deploy par click karke Permission allow karein.
// 8. Jo Web App URL milega, usko 'src/utils/imageResize.ts' file me `APPS_SCRIPT_URL` me paste kardein.
// ==============================================================================

var DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";

function doPost(e) {
  try {
    // Frontend se aaya data read karein (JSON parsing kyunki text/plain bhej rahe hain)
    var requestData = JSON.parse(e.postData.contents);
    var base64Data = requestData.data;
    var fileName = requestData.name || ("upload_" + new Date().getTime() + ".jpg");
    var mimeType = requestData.mimeType || "image/jpeg";
    
    // Base64 decode karna
    var decodedData = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decodedData, mimeType, fileName);
    
    // Drive Folder mein save karna
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var file = folder.createFile(blob);
    
    // File upload hone ke baad URL generation. (export=view format direct link deta hai)
    var fileId = file.getId();
    // Direct link ka format:
    var publicUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    // Web App Response (JSON format me return karein)
    var responseJson = {
      success: true,
      url: publicUrl,
      fileId: fileId
    };
    
    return ContentService.createTextOutput(JSON.stringify(responseJson))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // Error return karein array
    var errorJson = {
      success: false,
      error: error.message
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorJson))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// OPTIONS method required hota hai CORS preflight request pass karne ke liye (agar JSON body se fetch ho toh)
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
