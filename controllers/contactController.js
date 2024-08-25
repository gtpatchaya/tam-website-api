const nodemailer = require('nodemailer');
const axios = require('axios');

exports.sendContact = async (req, res) => {
    try {
        const myHeaders = {
            "Authorization": `Bearer ${process.env.LINE_NOTI_KEY}`
        };

        const requestOptions = {
            headers: myHeaders,
        };

        const formdata = new FormData();
        formdata.append("message",
            `Name: ${req.body.name}, 
            Company: ${req.body.company},
            Email: ${req.body.email}, 
            Telephone: ${req.body.telephone}, 
            productInterest: ${req.body.productInterest}, 
            quantity: ${req.body.quantity}, 
            quotation: ${req.body.quotation}, 
            description: ${req.body.description}`);

        const response = await axios.post("https://notify-api.line.me/api/notify", formdata, requestOptions);

        if (response.status === 200) {
            res.status(200).json({ message: 'Line sent successfully' });
        } else {
            res.status(500).json({ message: 'Line sent fail' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Line sent fail' });
    }
};