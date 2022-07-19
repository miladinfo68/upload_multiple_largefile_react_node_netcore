export const Helper = () => {
    const toBase64String = (file: File) => {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => resolve(fr.result);
            fr.onerror = (err) => reject(err);
        });
    }

    const b64toBlob = (b64Data: string, contentType: string = '', sliceSize: number = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
    const contentType = 'image/png';
    const b64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    const blob = b64toBlob(b64Data, contentType);
    const blobUrl = URL.createObjectURL(blob);

    // const img = document.createElement('img');
    // img.src = blobUrl;
    // document.body.appendChild(img);

    const submitForm = (contentType: string, data: any, cb: any) => { }

    const onSubmitForm = async () => {
        //upload file by form data
        let formData = new FormData();
        submitForm("multipart/form-data", formData, (msg: string) => console.log(msg))

        const data = { firstName: '' }
        submitForm("application/json", data, (msg: string) => console.log(msg));
    }

}