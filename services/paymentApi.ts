import axios from 'axios';

const API_URL = 'https://euryhaline-kerry-xenomorphically.ngrok-free.dev';

export const createVNPayUrl = async (amount: number, userId: number) => {
    const res = await axios.post(`${API_URL}/api/vnpay/create`, {
        amount,
        userId,
    });

    return res.data.paymentUrl;
};
