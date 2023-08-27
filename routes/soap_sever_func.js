const mySoapServices = {
    PaymentServiceWS2: {
    PaymentServiceWS2PortBinding: {
    GetAccountAndInvoiceInfo: function (args) {
    console.log('args', args)
    return GetAccountAndInvoiceInfoResponse(args);
    },

    // This is how to define an asynchronous function with a callback.
    GetAccountandInvoiceInfoAsync: function (args, callback) {
    // do some work
    console.log('args', args)
    callback(GetAccountAndInvoiceInfoResponse(args));
    },

    // This is how to define an asynchronous function with a Promise.
    GetAccountandInvoiceInfoPromise: function (args) {
    console.log('args', args)
    return new Promise((resolve) => {
    // do some work
    resolve(GetAccountAndInvoiceInfoResponse(args));
    });
    },
    NotifyAboutPayment: function (args) {
    console.log('args', args)
    return {};
    },

    // This is how to define an asynchronous function with a callback.
    NotifyAboutPaymentAsync: function (args, callback) {
    // do some work
    console.log('args', args)
    callback({});
    },

    // This is how to define an asynchronous function with a Promise.
    NotifyAboutPaymentPromise: function (args) {
    console.log('args', args)
    return new Promise((resolve) => {
    // do some work
    resolve({});
    });
    }
    }
    }
};

export default mySoapServices;


const GetAccountAndInvoiceInfoResponse = (args) => {
    return {
    return: {
    serviceAccount: {
    scCode: 981800,
    identificationType: 'ACC1',
    code: '2MJ14PY',
    address: '-',
    name: 'VUSAL',
    surname: 'MƏHƏRRƏMOV',
    patronymic: 'HİDAYƏT OĞLU',
    description: 'VUSAL MƏHƏRRƏMOV HİDAYƏT OĞLU',
    },
    invoiceList: {
    code: '2MJ14PY',
    invoiceDate: '2020-08-06',
    totalAmount: 1000,
    amount: 500,
    serviceCode: 14231100,
    paymentReceiverCode: 981801
    }
    }
    };
}
