//https://stackoverflow.com/questions/31005396/filter-array-of-objects-with-another-array-of-objects
import { useState, useEffect, useRef } from 'react';
import download from 'downloadjs';
// import axios from 'axios';
import svc from './fileService';
interface IInitFormData
{
    firstname: String,
    lastname: String,
    email: String,
    myFiles: any[] | null //new DataTransfer().files
}

let initFormData: IInitFormData = {
    firstname: '',
    lastname: '',
    email: '',
    myFiles: null,
}

// const serverURL = "http://localhost:5000/api";
const validFileTypes = ["jpeg", "jpg", "jfif", "png", "pdf"];
var newWindowFeatures = "width=900,height=600,left=200,top=200,location=no";

const FileUploader = () =>
{

    const [formData, setFormData] = useState<any>(initFormData);
    const [apiFiles, setApiFiles] = useState<any>(null);
    const [pdfFiles, setPdfFiles] = useState<any>(null);
    const [imageFiles, setImageFiles] = useState<any>(null);
    const [serverResponse, setServerResponse] = useState<any>(null);
    const [formSubmitted, setFormSubmitted] = useState<any>(false);
    const [progress, setProgess] = useState<any>(0);
    const [newWindows, setNewWindows] = useState<any>(null);

    const refFile = useRef<any>(null);

    const refForm = useRef<any>(null);

    const getApiFiles = async () =>
    {
        const res = await svc.getFiles();
        // return res.data;
        setApiFiles(res.data);
    }


    const refreshData = () =>
    {
        refForm.current.reset();
        setFormData(initFormData);
        setPdfFiles(null);
        setImageFiles(null);
        setServerResponse(null);
        setFormSubmitted(false);
        setProgess(0);
        closeWindows();
    }

    const closeWindows = () =>
    {
        if (newWindows)
        {
            newWindows.close();
            setNewWindows(null);
        }
    }

    useEffect(() =>
    {
        getApiFiles();

        if (formSubmitted)
        {
            setTimeout(() =>
            {
                refreshData();
            }, 3000);
        }
    }, [formSubmitted]);

    useEffect(() =>
    {
        closeWindows();
    }, [pdfFiles, imageFiles]);


    const inputChangeHandler = (e: any) =>
    {
        const { name, value } = e.target;
        if (name !== 'myFiles')
            setFormData({ ...formData, [name]: value });
        else
        {
            let selectedFiles = e.target.files;
            let selectedFilesCount = selectedFiles.length;
            // console.log(selectedFilesCount)
            if (selectedFilesCount === 0) return;
            setProgess(0);

            //copy FilesList from file upload 
            let filesList = new DataTransfer();

            if (selectedFilesCount > 5) selectedFilesCount = 5;
            for (let i = 0; i < selectedFilesCount; i++)
                filesList.items.add(selectedFiles[i]);
            // console.log(filesList.files)
            setFormData({ ...formData, myFiles: filesList.files });
            // console.log([...filesList.files])

            let newBlobedFiles = Object.values(filesList.files).map(file =>
            {
                // debugger
                let f: any = {};
                f.fileName = file.name;
                f.blobed = URL.createObjectURL(file);
                return f;
            });
            console.log(newBlobedFiles)
            let pdfs: any[] = [], images: any[] = [];
            newBlobedFiles.forEach(bf =>
            {
                let ext = (bf.fileName?.split('.')[1])?.toLowerCase();
                if (validFileTypes.includes(ext))
                {
                    if (ext === "pdf") pdfs.push(bf);
                    else images.push(bf);
                }
            });
            setPdfFiles([...pdfs]);
            setImageFiles([...images]);

            // console.log("imageFiles",imageFiles);
            // console.log("pdfFiles",pdfFiles);
            // console.log("pdfs",pdfs);
            // console.log("images",images);
            // setSelectedFiles([...newBlobedFiles]);
        }
    }

    const deleteFile = (fileName: string) =>
    {
        if ((fileName.split('.')[1]).toLowerCase() === "pdf")
        {
            const restOfPdfs = Object.values(pdfFiles).filter((sf: any) => sf.fileName !== fileName);
            setPdfFiles([...restOfPdfs]);
        } else
        {
            const restOfImages = Object.values(imageFiles).filter((sf: any) => sf.fileName !== fileName);
            setImageFiles([...restOfImages]);
        }
        let restOfFilesFromFromData = Object.values(formData.myFiles).filter((sf: any) => sf.name !== fileName);
        setFormData({ ...formData, myFiles: [...restOfFilesFromFromData] });
    }

    const showPdfHandler = (e: any) =>
    {
        const fileName = e.target.dataset.filename;
        let pdf: any = Object.values(pdfFiles).find((sf: any) => sf.fileName === fileName);
        if (pdf)
        {
            let newWin = window.open(pdf.blobed, "pop-up window", newWindowFeatures);
            setNewWindows(newWin);
        }
    }

    const downloadHandler = async (event: any) =>
    {
        event.preventDefault();
        const href = event.target.getAttribute("href");
        const name = href?.split('/')?.reverse()[0];
        if (href?.split('/')?.length > 0)
        {
            const res = await svc.getFileFromApi(href);
            const blob = await res.blob();
            download(blob, name);
        }
    }



    const onSubmitHandler = async (e: any) =>
    {
        debugger
        e.preventDefault();
        // console.log(formData)

        if (!svc.isValidForm(formData)) return;

        svc.upload(formData, (event: any) =>
        {
            // let percent = Math.round(event.loaded / event.total * 100);
            let percent = Math.round((100 * event.loaded) / event.total);
            setProgess(percent);
        }).then(res =>
        {
            setServerResponse(res.data);
            setFormSubmitted(true);
        }).catch(err =>
        {
            console.log(err)
            setFormSubmitted(false);
            setProgess(0);
        });
    }



    return (
        <div className="container">
            <div className="row mt-3">
                <div className="col-md-6">
                    <h5>selected files must be between 1 and 5 files</h5>
                    <form
                        // method="post"
                        // encType="multipart/form-data"
                        // action="http://localhost:3000/api/file/upload"
                        className="frm-dta"
                        onSubmit={onSubmitHandler}
                        ref={refForm}
                    >
                        <div className="frm-elm">
                            <span>firstName : </span>
                            <input name="firstname"
                                placeholder="first name"
                                onChange={inputChangeHandler}
                            />
                        </div>
                        <div className="frm-elm">
                            <span>lastName : </span>
                            <input name="lastname"
                                placeholder="last name"
                                onChange={inputChangeHandler}
                            />
                        </div>
                        <div className="frm-elm">
                            <span>email : </span>
                            <input name="email"
                                placeholder="email"
                                onChange={inputChangeHandler}
                            />
                        </div>
                        <div className="frm-elm">
                            <input
                                type="file" multiple
                                onChange={inputChangeHandler}
                                name="myFiles"
                                className="fileUpload form-control-file border"
                                // accept="image/png, image/jpeg, application/pdf, application/vnd.ms-excel"
                                accept=".png, .jpeg, .jpg, .jfif, .pdf"
                                ref={refFile}
                            />

                        </div>
                        <div className="frm-elm">
                            {
                                (refFile.current?.files?.length > 0 && formData?.myFiles?.length > 0)
                                    ? <button type="submit" className="btn btn-success mt-2" >Upload</button>
                                    : ""
                            }
                        </div>
                    </form>
                    {
                        progress > 0 ?
                            <div className="progessBar progress-bar progress-bar-info progress-bar-striped"
                                style={{ width: `${progress}%` }}>{`${progress}%`}
                            </div>
                            : null
                    }
                </div>
                <div className="col-md-6">
                    {serverResponse && serverResponse.success ? (
                        <div className="alert alert-success" role="alert">
                            {serverResponse.message}
                        </div>
                    ) : ""}

                    {serverResponse && !serverResponse.success ? (
                        <div className="alert alert-danger" role="alert">
                            {serverResponse.message}
                        </div>
                    ) : ""}
                </div>
            </div>

            <div className="row pdfsWrapper previewFiles">
                {pdfFiles && pdfFiles.length > 0 &&
                    Object.values(pdfFiles).map((sfile: any) =>
                    {
                        return (
                            <div key={sfile.fileName + new Date().getMilliseconds()} className="my-3 pdfBox">
                                <div className="pdf-title">{sfile.fileName}</div>
                                <button
                                    onClick={() => deleteFile(sfile.fileName)}
                                    className="btn btn-outline-danger my-2"
                                > delete </button>
                                <button
                                    data-filename={sfile.fileName}
                                    className="btn btn-outline-secondary mr-1 "
                                    onClick={showPdfHandler}
                                >Show</button>

                            </div>
                        );
                    })}
            </div>

            <div className="row boxImgsPrev previewFiles">
                {imageFiles && imageFiles.length > 0 &&
                    Object.values(imageFiles).map((sfile: any) =>
                    {
                        return (
                            <div key={sfile.fileName + new Date().getMilliseconds()} className="wrapperImgPrev">
                                <img src={sfile.blobed} alt="" className="imgPrev" />
                                <button
                                    onClick={() => deleteFile(sfile.fileName)}
                                    className="btn btn-outline-danger"
                                > delete </button>
                            </div>
                        );
                    })}
            </div>

            <hr />
            <div className="row my-1"><h3>List of Files</h3></div>
            {apiFiles && apiFiles.map((file: any, index: any) => (
                <div className="row mt-1" key={index}>
                    <a href={file.href} onClick={downloadHandler}>{file.name}</a>
                </div>
            ))}
        </div>
    );

    // //https://blog.titanwolf.in/a?ID=01450-5aab46d3-f558-4919-9770-a63c64c81d78
    // const onSubmitHandler = e => {
    //     //         //array.reduce((prevValue, currentValue, currentIndex, arr)=>{}, initialValue)
    //     //         let data = Object.keys(formData).reduce((prev, key) => {
    //     //             if (key !== "files")
    //     //                 return { ...prev, [key]: formData[key] }
    //     //             return prev;
    //     //         }, {});
    //     //#############################
    //     //     // selectedFiles.forEach(async f => {
    //     //     //     debugger
    //     //     //     let blb = await fetch(f.blobed).then(r => r.blob());
    //     //     //     console.log(blb);
    //     //     // });
    //     //#############################
    //     //         // const base64BlobArr = [];
    //     //         // selectedFiles.forEach(async sf => {
    //     //         //     let blobized = await svc.blobToBase64(sf.blobed);
    //     //         //     base64BlobArr.push(blobized);
    //     //         //     // console.log(blobized)
    //     //         // });   
    // }
}

export default FileUploader;