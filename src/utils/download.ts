
export async function download(url: string, filename: string, success?: (blob: Blob) => void) {
    const blob = await getBlob(url);
    save(blob, filename);
    success?.(blob)
}

function getBlob(url: string) {
    return new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Request failed with status ${xhr.status}`));
            }
        };
        xhr.onerror = () => {
            reject(new Error('Request failed'));
        };

        xhr.send();
    });
}

function save(blob: Blob, filename: string) {
    const link = document.createElement('a');
    const body = document.body;

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    link.style.display = 'none';
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href);
}