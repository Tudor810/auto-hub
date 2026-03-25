import express from 'express'
const router = express.Router();

router.post('/', (req, res) => {
    res.send('Login route');
    console.log("Testing");
    
});
export default router
