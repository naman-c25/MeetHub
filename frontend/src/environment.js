let IS_PROD = true;
const server = IS_PROD ?
    "meet-hub-steel.vercel.app" :

    "http://localhost:8000"


export default server;