import axios from 'axios';
const baseUrl: string = "http://localhost:5000/api";
// axios.defaults.baseURL = baseUrl;
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
// axios.defaults.headers.post['Content-Type'] = 'XMLHttpRequest;

const http = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-type": "application/json;charset=UTF-8"
    }
});



const upload = (data: any, onUploadProgress: any) =>
{
    var bodyFormData = new FormData();
    bodyFormData.append('firstname', data.firstname);
    bodyFormData.append('lastname', data.lastname);
    bodyFormData.append('email', data.email);
    // console.log(bodyFormData.getAll('myFiles'))
    for (const key of Object.keys(data.myFiles))
        bodyFormData.append('myFiles', data.myFiles[key]);
    const axiosConfig = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    }
    return http.post('/file/upload', bodyFormData, axiosConfig);
    // return response;
};

const getFiles: any = async () =>
{
    const res = await http.get('');
    return res.data;
}

const getFileFromApi = async (relpath: string) =>
{
    const res = await fetch(`${baseUrl}${relpath}`);
    return res;
    // const blob = await res.blob();
    // download(blob, "test.pdf");
}





// converts blob to base64
// const blobToBase64 = function(blob, cb) {
//     const reader = new FileReader();
//     reader.onload = function() {
//       var dataUrl = reader.result;
//       var base64 = dataUrl.split(',')[1];
//       cb(base64);
//     };
//     reader.readAsDataURL(blob);
//   };



const blobToBase64 = async (url: string) =>
{
    const response = await fetch(url);
    const blob = await response.blob();
    const reader: any = new FileReader();
    await new Promise((resolve, reject) =>
    {
        reader.onload = resolve;
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    return reader.result.replace(/^data:.+;base64,/, '');
    // return reader.result.split(',')[1];
}


const isValidForm = (data: any) =>
{
    if (data && data.firstname &&
        data.lastname && data.email &&
        data.myFiles && data.myFiles.length > 0)
        return true;
    return false;
}

export default {
    upload,
    getFiles,
    getFileFromApi,
    blobToBase64,
    isValidForm
};