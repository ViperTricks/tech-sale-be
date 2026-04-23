const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");

/**
 * Sort + encode đúng chuẩn VNPAY
 */
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();

    for (let key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    }

    return sorted;
}

exports.createVnpayPayment = async (req, res) => {
    try {
        const { amount, bankCode } = req.body;

        // ✅ 1. Validate
        const amountNum = Number(amount);
        if (!amountNum || amountNum <= 0) {
            return res.status(400).json({ message: "Số tiền không hợp lệ" });
        }

        // ✅ 2. ENV
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        console.log("=== VNPAY CONFIG ===");
        console.log({ tmnCode, secretKey, vnpUrl, returnUrl });

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            return res.status(500).json({
                message: "Thiếu cấu hình VNPAY (.env)"
            });
        }

        // ✅ 3. Tạo dữ liệu
        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const orderId = "TS" + moment(date).format("DDHHmmss");

        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Locale: "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: "Thanh toan don hang " + orderId,
            vnp_OrderType: "other",
            vnp_Amount: amountNum * 100, // ❗ bắt buộc
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1",
            vnp_CreateDate: createDate
        };

        if (bankCode) {
            vnp_Params.vnp_BankCode = bankCode;
        }

        // ✅ 4. Sort + encode
        vnp_Params = sortObject(vnp_Params);

        // ❗ 5. Tạo chữ ký (KHÔNG encode)
        const signData = qs.stringify(vnp_Params, { encode: false });

        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(signData, "utf-8").digest("hex");

        vnp_Params.vnp_SecureHash = signed;

        // ✅ 6. Tạo URL (encode bình thường)
        const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });

        console.log("👉 VNPAY URL:", paymentUrl);

        return res.status(200).json({ payUrl: paymentUrl });

    } catch (error) {
        console.error("❌ VNPAY ERROR:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};