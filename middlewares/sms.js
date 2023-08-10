const request = require('request') ; 
const crypto = require('crypto-js') ;
const axios = require('axios') ;
const utf8 = require('utf8');

function smsSend(_phone, message, cb, code = '994') {
	const phone = `${code}${_phone}`;
	const url = 'http://apps.lsim.az/quicksms/v1/send';
	const username = 'portal';
	const password = 'fkli6tLg';
	const sender = 'e-Tehsil';
	const rurl = utf8.encode(`${url}?login=${username}&sender=${sender}&msisdn=${phone}&text=${message}&key=${crypto.MD5(crypto.MD5(password) + username + message + phone + sender).toString()}&unicode=true`);
	if (phone.trim() && message.trim()) {
		axios.get(rurl).then(result => {
			if (result.data.errorMessage) {
				cb({ sent: false, message: result.data.errorMessage });
			} else if (result.data.obj) {
				cb({ sent: true, transaction: result.data.obj, message: 'SMS göndərildi' });
			} else {
				cb({ sent: false, data: result.data.errorMessage, message: 'SMS göndərildi' });
			}
		}).catch(e => {
			cb({ sent: false, transaction: '', message: 'Nömrə vəya mövzu daxil edilməyib' });
		});
	} else {
		cb({ sent: false, transaction: '', message: 'Nömrə vəya mövzu daxil edilməyib' });
	}
}

function checkBalance(cb) {
	const username = 'portal';
	const password = 'fkli6tLg';
	request(`http://apps.lsim.az/quicksms/v1/balance?login=${username}&key=${crypto.MD5(crypto.MD5(password) + username).toString()}`, function (err, res, body) {
		cb(JSON.parse(body));
	});
}

function checkSent(transaction, cb) { // 560617062 for test
	const username = 'portal';
	request(`http://apps.lsim.az/quicksms/v1/report?login=${username}&trans_id=${transaction}`, function (err, res, body) {
		cb({ really_sent: (body == 101 ? true : false), message: (body == 101 ? 'SMS Göndərilib' : 'SMS Göndərilməyib') });
	});
}

module.exports = {checkSent, checkBalance, smsSend} ;