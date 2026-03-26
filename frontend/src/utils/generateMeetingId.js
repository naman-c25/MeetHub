/**
 * Generates a unique meeting ID in Google Meet style format: abc-defg-hij
 * Uses lowercase letters only for easy verbal sharing.
 */
const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const seg = (len) =>
        Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${seg(3)}-${seg(4)}-${seg(3)}`;
};

export default generateMeetingId;
