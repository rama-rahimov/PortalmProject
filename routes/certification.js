const express = require("express") ;
const axios = require("axios") ;
const { authenticate } = require("../middlewares/authenticate.js") ;

const router = express.Router();

router.post('/exam_points', authenticate, (req, res) => {
    const { exam_year, exam_type } = req.body;
    const fin = req.currentUser.fin;
    axios({
    method: 'POST',
    url: `${process.env.MIQ_HOST}/api/exam_points`,
    timeout: process.env.TIMEOUT || 8000,
    headers: {
    'Content-Type': 'application/json',
    token: process.env.MIQ_TOKEN
    },
    data: {
    fin, exam_year, exam_type
    }
    }).then(result => {
    res.json(result.data);
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json({ error: 'api error' });
    });
    });


router.get('/job_data', authenticate, (req, res) => {
    const fin = req.currentUser.fin;
    axios({
    method: 'POST',
    url: `${process.env.MIQ_HOST}/api/certification/job_data`,
    timeout: process.env.TIMEOUT || 8000,
    headers: {
    'Content-Type': 'application/json',
    token: process.env.MIQ_TOKEN
    },
    data: {
    fin
    }
    }).then(result => {
    res.json(result.data);
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json({ error: 'api error' });
    });
    });


router.get('/data', authenticate, (req, res) => {
    const fin = req.currentUser.fin;
    axios({
    method: 'POST',
    url: `${process.env.MIQ_HOST}/api/certification`,
    timeout: process.env.TIMEOUT || 8000,
    headers: {
    'Content-Type': 'application/json',
    token: process.env.MIQ_TOKEN
    },
    data: {
    fin
    }
    }).then(result => {
    res.json(result.data);
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json({ error: 'api error' });
    });
    });

router.get('/exam_data', authenticate, (req, res) => {
    const fin = req.currentUser.fin;
    axios({
    method: 'POST',
    url: `${process.env.MIQ_HOST}/api/certification/exam_data`,
    timeout: process.env.TIMEOUT || 8000,
    headers: {
    'Content-Type': 'application/json',
    token: process.env.MIQ_TOKEN
    },
    data: {
    fin
    }
    }).then(result => {
    res.json(result.data);
    }).catch(e => {
    if (e.response) {
    console.log(e.response.data);
    } else {
    console.log(e);
    }
    if (Object.keys(e).length > 0)
    res.json({ error: 'api error' });
    });
    });
module.exports = router;