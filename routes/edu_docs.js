const express = require("express") ;
const { authenticate } = require("../middlewares/authenticate.js") ;
const db = require('../models');
const { Op } = require("sequelize") ;

const router = express.Router();

/**
 * @api {post} /edudocs/list eduDocs
 * @apiName eduDocs
 * @apiGroup Edu Docs
 * @apiPermission none
 *
 * @apiDescription Sənədlərin siyahısı
 */

router.post("/list", authenticate, (req, res) => {
    db.e_documents.findAll({where:{fin:req.currentUser.fin, 
    end_date:{[Op.gt]: db.sequelize.fn('NOW')}}, 
    order:[['id', 'DESC']]}).then(result => {
    res.json({ success: true, diploms: (result || []).map(r => ({
    ...r, file_details: r.file_details ? JSON.parse(r.file_details) 
    : {} })) });
    });
});

module.exports = router;
