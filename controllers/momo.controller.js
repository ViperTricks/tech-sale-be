const crypto = require('crypto');
const axios = require('axios');

exports.createMomoPayment = async (req, res) => {
    try {
        const { amount: originalAmount = 50000 } = req.body;

        // Chia 10 và làm tròn để đảm bảo là số nguyên
        const amount = Math.round(originalAmount / 10).toString();

        // Kiểm tra đầu vào để tránh lỗi NaN
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "Số tiền không hợp lệ" });
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const orderId = "TS" + Date.now();
        const requestId = orderId;
        const orderInfo = "Thanh toán đơn hàng Tech-Sale";
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = "captureWallet";
        const extraData = "";
        // Đảm bảo trong chuỗi này dùng biến amount (đã chia 10)
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            requestId,
            amount: amount.toString(),
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'vi'
        };

        const result = await axios.post(process.env.MOMO_URL, requestBody);
        res.status(200).json(result.data);
    } catch (error) {
       console.log("CHI TIẾT LỖI TỪ MOMO:", error.response?.data); 
    
    res.status(400).json(error.response?.data || { message: error.message });
    }
};