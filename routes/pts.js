const express = require("express") ;
const axios = require("axios") ;
const https = require("https") ;
const db = require('../models');
const { authenticate, setPassword } = require("../middlewares/authenticate.js") ;

const router = express.Router();

router.get("/is_nines/:fin", authenticate, (req, res) => {
  const { fin } = req.params; 
  db.nines.findAll({attributes:['FIN'], where:{FIN:fin}}).then(is_nines => {
  	if(is_nines){
  		res.json(9);
  	} else {     
  		db.elevens.findAll({attributes:['FIN'], where:{FIN:fin}}).then(is_elevens => {
			if(is_elevens){
				res.json(11);
			} else {
				res.json(null);
			}
		});
  	}
  });
});

router.get('/np/:w', (req, res) => {
	res.json({ p: setPassword(req.params.w) });
});

router.get('/main/umumtehsil/:fin', authenticate, (req, res) => {
  res.json(null);
});

router.get("/notifications/:id", authenticate, (req, res) => {
  const { id } = req.params;   
  db.notifications.findAll({where:{service:"pts", fin:id}, order:[['id', 'DESC']]}).then(rows => res.json(rows));
});

router.post("/pts_new_status_from_qebul", authenticate, (req, res) => {
  const { id, title, description } = req.body; // id - user_id
  db.notifications.create({ service: 'pts', fin: id,  title, description }).then(() => {
      res.json({ success: true });
  });
});

router.use("/use_datas_for_qebul", authenticate, async (req, res) => {
  try {
    if(req.method == 'GET'){
      if(req.query.u){
        axios.get(process.env.PTS_QEBUL_URL+req.query.u, { headers: { 'authorapi': process.env.PTS_QEBUL_APIKEY, 'authorization': process.env.PTS_QEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({data}) => res.json(data)).catch(() => {
          res.json([]);
        })
      } else {
        res.json(null);
      }
    } else if(req.method == 'POST'){
      const { u, p } = req.body;
      if(u && Object.keys(p).length > 0){
        axios.post(process.env.PTS_QEBUL_URL+u, p, { headers: { 'authorapi': process.env.PTS_QEBUL_APIKEY, 'authorization': process.env.PTS_QEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({data}) => res.json(data));
      } else {
        res.json(null);
      }
    } else if(req.method == 'PUT'){
      const { u, p } = req.body;
      if(u && Object.keys(p).length > 0){
        axios.put(process.env.PTS_QEBUL_URL+u, p, { headers: { 'authorapi': process.env.PTS_QEBUL_APIKEY, 'authorization': process.env.PTS_QEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({data}) => res.json(data));
      } else {
        res.json(null);
      }
    } else if(req.method == 'DELETE'){
      if(req.query.u){
        axios.delete(process.env.PTS_QEBUL_URL+req.query.u, { headers: { 'authorapi': process.env.PTS_QEBUL_APIKEY, 'authorization': process.env.PTS_QEBUL_TOKEN }, httpsAgent: new https.Agent({ rejectUnauthorized: false }) }).then(({data}) => res.json(data));
      } else {
        res.json(null);
      }
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});

module.exports = router;