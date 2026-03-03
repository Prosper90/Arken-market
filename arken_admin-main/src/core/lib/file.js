export const objectUrl = (fileImage) => {
    try {
        return URL.createObjectURL(fileImage)
    }
    catch (err) {
        return fileImage
    }
}