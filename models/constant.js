// Regex
module.exports.regex = (tyles) => {
    switch(tyles) {
        case "image":
            return /\.(jpg|png)/g;
            break;
        default:
            return /\w*/g;
    }
}