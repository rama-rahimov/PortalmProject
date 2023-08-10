const express = require("express") ;
const querystring = require("querystring") ;
const axios = require("axios") ;
const { authenticate } = require("../middlewares/authenticate") ;

const router = express.Router();


/**
 * @api {post} /debt/payment/get_url payment get_url
 * @apiName payment get_url
 * @apiGroup Student Apply
 * @apiPermission none
 *
 * @apiDescription sifre yoxlamasi
 * 
 * @apiParam (Request body) {String} id <code>id</code>
 * @apiParam (Request body) {String} cardBinCode <code>cardBinCode</code>
 * @apiParamExample {json} Request-Example:
 *     { "id": "", "cardBinCode": "" }
 * @apiSampleRequest off
 */

router.post('/payment/get_url', authenticate, (req, res) => {
    const { cardBinCode, paymentDetails } = req.body;
    axios({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: 'edumedia',
            password: 'P@ssword'
        },
        data: {
            "redirectURL": "https://portal.edu.az/student/dashboard",
            "cardBinCode": cardBinCode,
            "transactionId": paymentDetails.transactionId,
            "account": {
                "scCode": paymentDetails.scCode,
                "identificationType": req.currentUser.citizenshipId == 1 ? "IAMAS" : (req.currentUser.citizenshipId == 2 ? "VMMS" : "ACC1"),
                "code": paymentDetails.invoice,
                "address": req.currentUser.address,
                "name": req.currentUser.first_name,
                "surname": req.currentUser.last_name,
                "patronymic": req.currentUser.father_name
            },
            "invoices": [
                {
                    "code": paymentDetails.invoice,
                    "date": paymentDetails.createdDate || "2021-06-09",//new Date(),
                    "totalAmount": paymentDetails.total_amount,
                    "amount": paymentDetails.remain_debt,
                    "serviceCode": paymentDetails.serviceCode,
                    "paymentReceiverCode": paymentDetails.paymentReceiverCode
                }
            ]
        },
        url: `http://192.168.100.196:4449/initiate-payment`
    }).then((r) => {
        res.json(r.data)
    }).catch(e => {
        if (e.response) {
            console.log(e.response.data);
        } else {
            console.log(e);
        }
        if (Object.keys(e).length > 0)
            res.json(false)
    });

});



/**
 * @api {get} /payment/debts/education-amount education amount
 * @apiName debts education amount
 * @apiGroup payment
 * @apiPermission none
 *
 * @apiDescription odenis toplamini getirir
 *  
 * @apiSampleRequest off
 *
 * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
 *
 */

router.get('/debts/education-amount', /*authenticate, */(req, res) => {

    const fin = '7BG0GTW';
    atisLogin((token) => {
        if (token) {
            axios.get('http://192.168.140.80/api/debts/education-amount/student/' + fin, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(result => {
                res.json({ result: result.data });
            }).catch(e => {
                if (Object.keys(e).length > 0)
                    res.json({ e });
            })
        } else {
            res.json({ error: 'login error' });
        }
    });
});



module.exports = router;


const atisLogin = (callback) => {
    const postData = querystring.stringify({
        'UserName': 'EDUMedia0508',
        'Password': 'n)/m<ySRNs7Af38n',
        'SecretKey': 'AtisI#_EB-R$T]2EKG!Key'
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: postData,
        url: 'http://192.168.140.80/api/tq/login'
    };

    axios(options).then(login_result => {
        if (((login_result || {}).data || {}).access_token) {
            callback(((login_result || {}).data || {}).access_token);
        } else {
            callback(false);
        }
    });
}