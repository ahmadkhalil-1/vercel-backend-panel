// Utility to convert a local image path to a full URL
const getImageUrl = (req, imagePath) => {
    if (!imagePath) return '';
    const cleanPath = imagePath.replace(/\\/g, '/');
    return `${req.protocol}://${req.get('host')}/${cleanPath}`;
};

export default getImageUrl; 