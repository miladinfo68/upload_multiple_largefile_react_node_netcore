import axios from 'axios'
import { useState, useEffect } from 'react'
import { saveChunkFile } from './http';

export const HeavyUploader = () => {

    const chunkSize = 1024 * 1024 * 30; // 1048576 * 3;//its 3MB, increase the number measure in mb
    const baseUrl = "https://localhost:7001";


    interface IinitState {
        file: File | null,
        mimeType: string,
        originalFileName: String,
        totalChunks: Number,
        currentChunkNo: Number,
        currentChunkStart: Number,
        currentChunkEnd: Number,
        blobChunkValue: Blob | null,
        progress: Number,
    }



    const initState: IinitState =
    {
        file: null,
        mimeType: '',
        originalFileName: '',
        totalChunks: 0,
        currentChunkNo: 0,
        currentChunkStart: 0,
        currentChunkEnd: 0,
        blobChunkValue: null,
        progress: 0,
    }

    const [fileInfo, setFileInfo] = useState<any>(initState);
    const [changeUpload, setChangeUpload] = useState<any>(false)
    const [fileChunksHasCompleted, setFileChunksHasCompleted] = useState<any>(false)
    const [retryUploadChunk, setRetryUploadChunk] = useState<any>(false)



    useEffect(() => {
        const postChunkFileToServer = async () => await uploadCurrentChunk();
        if (fileInfo.currentChunkNo > 0 || retryUploadChunk)
            postChunkFileToServer();

    }, [fileInfo.currentChunkNo, retryUploadChunk]);

    useEffect(() => {
        const callMergeChunks = async () => await mergeAllChunks();
        if (fileChunksHasCompleted) callMergeChunks();
    }, [fileChunksHasCompleted]);

    useEffect(() => {
        if (changeUpload) resetFileUpload()
    }, []);


    const resetFileUpload = () => {
        setFileInfo(initState);
        setChangeUpload(false);
        setFileChunksHasCompleted(false);
        setRetryUploadChunk(false);
    }

    const mergeAllChunks = async () => {

        let data = JSON.stringify({
            fileName: fileInfo.originalFileName
        });
        debugger
        fetch(`${baseUrl}/FileManagement/MergeAllChunks`, {
            method: 'post',
            body: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            debugger
            return response.json()
        }).catch((error) => {
            debugger
            console.log(error)
        })
    }







    const getTotalChunks = (file: File) => {
        if (!file) return 1;
        return file.size % chunkSize == 0 ?
            file.size / chunkSize :
            Math.floor(file.size / chunkSize) + 1;

    }

    const getChunk = (file: Blob, start: number, end: number) => {

        let blob = (file ? file.slice(start, end) : null) as Blob;

        // const chunk = new Blob([blob.slice(0, blob.size)], { type: file.type });
        const chunk = new Blob([blob.slice(0, blob.size)], { type: 'application/octet-stream' });
        return chunk;
    }



    const getProgressValue = (currentChunkNo: number, totalChunks: number) =>
        currentChunkNo > 0 ? ((currentChunkNo / totalChunks) * 100).toFixed(2) : null;

    const onChangeHandler = (e: any) => {
        setChangeUpload(true);

        const file = e.target.files[0] as File;
        const chnks = getTotalChunks(file);
        const firstChunk = getChunk(file, 0, chunkSize);
        const firstProgress = getProgressValue(1, chnks);

        let newState = {
            file: file,
            mimeType: file.type,
            originalFileName: file.name,
            currentChunkNo: 1,
            blobChunkValue: firstChunk,
            totalChunks: chnks,
            currentChunkStart: 1,
            currentChunkEnd: chunkSize,
            progress: firstProgress
        }
        setFileInfo({ ...newState });
    }

    const setNewState = (chunkNo: number, start: number, end: number): void => {
        debugger
        const nextChunkValue = getChunk(fileInfo.file, start, end);
        const progrssVal = getProgressValue(chunkNo, fileInfo.totalChunks);
        const newState: any = {
            currentChunkNo: chunkNo,
            currentChunkStart: start,
            currentChunkEnd: end,
            blobChunkValue: nextChunkValue,
            progress: progrssVal,
        }

        setFileInfo((prevState: any) => ({ ...prevState, ...newState }));
    }

    const apiFormData = (): FormData => {
        const formData = new FormData();
        formData.append("originalFileName", fileInfo.originalFileName);
        formData.append("mimeType", fileInfo.mimeType);
        formData.append("totalChunks", fileInfo.totalChunks);
        formData.append("currentChunkNo", fileInfo.currentChunkNo);
        formData.append("blobChunkValue", fileInfo.blobChunkValue);
        return formData;
    }

    const uploadCurrentChunk = async () => {
        try {
            if (fileInfo.currentChunkNo <= fileInfo.totalChunks) {
                let formData = apiFormData();
                // for (let [key, value] of formData) console.log(`${key}: ${value}`)
                const axiosConfig = {
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        // 'Content-Type': 'multipart/form-data'
                    }
                }
                const res: any = await axios.post(`${baseUrl}/FileManagement/UploadCurrentChunk`, formData, axiosConfig).then(r => r.data);
                if (res.isSuccess) {
                    console.log(`currentChunkNo [${fileInfo.currentChunkNo}] Uploaded`);
                    if (fileInfo.currentChunkNo == fileInfo.totalChunks) {
                        setFileChunksHasCompleted(true);
                    } else {
                        setNewState(fileInfo.currentChunkNo + 1, fileInfo.currentChunkEnd, fileInfo.currentChunkEnd + chunkSize);
                    }
                } else {
                    setRetryUploadChunk(true);
                }
            }

        } catch (error) {
            console.error('error', error)
        }
    }



    return (
        <>
            <form>
                <div><input type="file" id="uploader" accept=".mp4, .mkv, .avi" onChange={onChangeHandler} /></div>
                <div style={{ display: fileInfo.currentChunkNo > 0 ? "block" : "none" }}>{fileInfo.progress}% </div>
            </form>
        </>
    );



}
