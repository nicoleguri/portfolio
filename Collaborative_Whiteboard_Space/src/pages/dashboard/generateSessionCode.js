/**
 * Generates a random session code consisting of 8 digits.
 * 
 * @returns {string} A randomly generated session code.
 */
const generateSessionCode = () => {
    const characters = '123456789';
    let result = '';

    // Generate 8-digit random session code
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}

export default generateSessionCode;