import { Injectable, inject } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth.service';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private auth = inject(AuthService);
  private apiUrl = 'http://localhost:5099/api/payment';

  private async getClient() {
    const client = axios.create({ baseURL: this.apiUrl });
    const token = this.auth.token();
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return client;
  }

  async upgradeToPremium(): Promise<{ success: boolean; message: string }> {
    try {
      const client = await this.getClient();
      
      // 1. Create Order
      const orderRes = await client.post('/create-order', {});
      const orderData = orderRes.data;

      // 2. Open Razorpay Checkout
      return new Promise((resolve) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ResumeAI Plus',
          description: 'Unlimited AI features for 1 month',
          order_id: orderData.id,
          handler: async (response: any) => {
            // 3. Verify Payment
            try {
              const verifyRes = await client.post('/verify-payment', {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });
              resolve(verifyRes.data);
            } catch (err: any) {
              resolve({ success: false, message: 'Payment verification failed.' });
            }
          },
          prefill: {
            name: this.auth.user()?.fullName || '',
            email: this.auth.user()?.email || ''
          },
          theme: {
            color: '#f0c040'
          }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          resolve({ success: false, message: 'Payment failed: ' + response.error.description });
        });
        rzp.open();
      });

    } catch (error: any) {
      console.error('Upgrade error:', error);
      const message = error.response?.data?.message || 'Failed to initialize payment.';
      return { success: false, message };
    }
  }
}
