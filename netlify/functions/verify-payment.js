exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { reference } = JSON.parse(event.body);

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.data && data.data.status === 'success') {
            // Payment verified successfully
            // You can add logic here to:
            // - Update lesson booking status
            // - Send confirmation emails
            // - Record transaction in database

            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'success',
                    data: {
                        amount: data.data.amount / 100, // Convert from kobo to naira
                        customer_email: data.data.customer.email,
                        reference: data.data.reference,
                        subaccount: data.data.subaccount
                    }
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    status: 'failed',
                    message: 'Payment verification failed'
                })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: 'Verification failed'
            })
        };
    }
};