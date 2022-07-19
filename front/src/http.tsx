import axios from 'axios';
const baseUrl: string = "https://localhost:7001";

const http = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-type": "application/json;charset=UTF-8"
    }
});

const saveChunkFile = async (formData: any) => {
    try {
        debugger
        const axiosConfig = {
            headers: { "Content-Type": "application/octet-stream" }
            // headers: { "Content-Type": "multipart/form-data" }
        }
        let res = await http.post(``, formData, axiosConfig);
        debugger
        return res.data;
    } catch (err) {
        console.log("Error in service", err)
    }
}

export { saveChunkFile }