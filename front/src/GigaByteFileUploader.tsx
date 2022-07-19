import { Form, Button, ProgressBar } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { useState, useEffect } from 'react'

export const GigaByteFileUploader = () =>
{

    const chunkSize = 1024 * 1024 * 3;//its 3MB, increase the number measure in mb
    const baseUrl = "https://localhost:7001";


    const [showProgress, setShowProgress] = useState<any>(false)
    const [progress, setProgress] = useState<any>(0)
    const [fileSize, setFileSize] = useState<any>(0)
    const [chunkCount, setChunkCount] = useState<any>(0)
    const [fileToBeUpload, setFileToBeUpload] = useState<any>(null)
    const [beginingOfTheChunk, setBeginingOfTheChunk] = useState<any>(0)
    const [endOfTheChunk, setEndOfTheChunk] = useState<any>(chunkSize)
    const [fileGuid, setFileGuid] = useState<any>("")
    const [fileName, setFileName] = useState<any>("")
    const [mimeType, setMimeType] = useState<any>("")
    const [chunkCounter, setChunkCounter] = useState<any>(1)

    useEffect(() =>
    {
        if (fileSize > 0) fileUpload();
    }, [fileToBeUpload, progress])

    const fileUpload = () =>
    {
        debugger
        setChunkCounter(chunkCounter + 1);
        if (chunkCounter <= chunkCount)
        {
            var chunk = fileToBeUpload.slice(beginingOfTheChunk, endOfTheChunk);
            uploadChunk(chunk)
        }
    }


    const uploadChunk = async (chunk: any) =>
    {
        debugger
        try
        {
            if (chunkCounter == chunkCount)
            {
                console.log('Process is complete, chunkCounter', chunkCounter)
                await uploadCompleted();
            }
            console.log("=====>", chunk)
            const response = await axios.post(`${baseUrl}/FileManagement/UploadChunks`, chunk, {

                params: {
                    chunkNo: chunkCounter,
                    //fileName: fileGuid,
                    originFileName: fileName,
                    mimeType: mimeType,
                    totalChunks: chunkCount
                },
                headers: { 'Content-Type': 'application/json', }
                //headers: { 'Content-Type': mileType, }
            });
            const data: any = response.data;
            if (data.isSuccess)
            {
                setBeginingOfTheChunk(endOfTheChunk);
                setEndOfTheChunk(endOfTheChunk + chunkSize);


                var percentage = (chunkCounter / chunkCount) * 100;
                setProgress(percentage);


                // if (chunkCounter == chunkCount)
                // {
                //     console.log('Process is complete, chunkCounter', chunkCounter)

                //     await uploadCompleted();
                // }
                // else
                // {
                //     var percentage = (chunkCounter / chunkCount) * 100;
                //     setProgress(percentage);
                // }
            }
            else
            {
                console.log('Error Occurred:', data.errorMessage)
            }

        }
        catch (error)
        {
            debugger
            console.log('error', error)
        }
    }


    const uploadCompleted = async () =>
    {
        debugger
        var formData = new FormData();
        formData.append('fileName', fileGuid);

        const response = await axios.post(`${baseUrl}/FileManagement/UploadComplete`, null, {
            params: {
                fileName: fileGuid,
            },
            data: formData,
        });

        const data: any = response.data;
        if (data.isSuccess)
        {
            setProgress(100);
        }
    }


    const resetChunckData = () =>
    {
        setShowProgress(true)
        setProgress(0)
        setChunkCounter(1)
        setBeginingOfTheChunk(0)
        setEndOfTheChunk(chunkSize)
    }


    const handleOnChange = (e: any) =>
    {
        debugger
        resetChunckData();
        const _file = e.target.files[0];
        setFileSize(_file.size)
        const _totalCount = _file.size % chunkSize == 0 ? _file.size / chunkSize : Math.floor(_file.size / chunkSize) + 1; // Total count of chunks will have been upload to finish the file
        setChunkCount(_totalCount)

        setFileName(_file.name);
        setMimeType(_file.type);
        setFileToBeUpload(_file)
        //const _fileID = uuidv4() + "." + _file.name.split('.').pop();
        //setFileGuid(_fileID)
    }


    const progressInstance = <ProgressBar animated now={progress} label={`${progress.toFixed(3)}%`} />;

    return (
        <form>
            <div><input type="file" id="uploader" onChange={handleOnChange} /></div>
            <div style={{ display: showProgress ? "block" : "none" }}>
                {progressInstance}
            </div>
            {/* <div><button>Submit</button></div> */}
        </form>

    )
}
