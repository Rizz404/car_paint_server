# Frontend Integration Examples

## 1. Snap API Integration (Popup Method)

### React/Next.js Example

#### Step 1: Load Snap.js Script
```tsx
// app/layout.tsx or pages/_document.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Load Snap.js - Use sandbox for testing */}
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
        {/* For production: */}
        {/* <script src="https://app.midtrans.com/snap/snap.js" ... /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### Step 2: Payment Component
```tsx
// components/PaymentButton.tsx
'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  carServices: Array<{ carServiceId: string }>;
  workshopId: string;
  paymentMethodId: string;
  // ... other order details
}

export default function PaymentButton(props: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order with Snap API
      const response = await fetch('/api/orders/create-snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          carServices: props.carServices,
          workshopId: props.workshopId,
          paymentMethodId: props.paymentMethodId,
          // ... other fields
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const { snapToken } = result.data;

      // Open Snap popup
      // @ts-ignore - snap is loaded from CDN
      window.snap.pay(snapToken, {
        onSuccess: function(result: any) {
          console.log('Payment success:', result);
          // Redirect to success page
          window.location.href = `/payment/success?orderId=${result.order_id}`;
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result);
          // Redirect to pending page
          window.location.href = `/payment/pending?orderId=${result.order_id}`;
        },
        onError: function(result: any) {
          console.error('Payment error:', result);
          // Redirect to error page
          window.location.href = `/payment/error?orderId=${result.order_id}`;
        },
        onClose: function() {
          console.log('User closed the popup');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

#### Step 3: Success/Pending/Error Pages
```tsx
// app/payment/success/page.tsx
export default function PaymentSuccess({ searchParams }) {
  const orderId = searchParams.orderId;

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
      <p>Order ID: {orderId}</p>
      <p>Your payment has been processed successfully.</p>
      <a href="/orders" className="btn-primary">View My Orders</a>
    </div>
  );
}

// app/payment/pending/page.tsx
export default function PaymentPending({ searchParams }) {
  const orderId = searchParams.orderId;

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-yellow-600">Payment Pending</h1>
      <p>Order ID: {orderId}</p>
      <p>Please complete your payment.</p>
      <a href="/orders" className="btn-primary">View My Orders</a>
    </div>
  );
}
```

---

## 2. Snap API Integration (Redirect Method)

```tsx
// components/PaymentRedirect.tsx
export default function PaymentRedirect(props: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders/create-snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(props),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // Redirect to Midtrans payment page
      window.location.href = result.data.redirectUrl;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Redirecting...' : 'Pay Now'}
    </button>
  );
}
```

---

## 3. Core API Integration

### For E-Wallet (GoPay, ShopeePay, DANA)

```tsx
// components/EWalletPayment.tsx
export default function EWalletPayment(props: PaymentButtonProps) {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(props),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const details = result.data.paymentDetails;

      // Redirect to e-wallet (deeplink for mobile, web URL for desktop)
      if (details.deeplinkUrl) {
        window.location.href = details.deeplinkUrl;
      } else if (details.redirectUrl) {
        window.location.href = details.redirectUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with E-Wallet'}
    </button>
  );
}
```

### For Virtual Account (Bank Transfer)

```tsx
// components/VirtualAccountPayment.tsx
export default function VirtualAccountPayment(props: PaymentButtonProps) {
  const [vaDetails, setVaDetails] = useState<{
    vaNumber: string;
    expiryTime: string;
    bankName: string;
  } | null>(null);

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(props),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const details = result.data.paymentDetails;

      setVaDetails({
        vaNumber: details.vaNumber,
        expiryTime: details.expiryTime,
        bankName: props.paymentMethodName, // e.g., "BCA", "BNI"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (vaDetails) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Virtual Account Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Bank</label>
            <p className="text-lg font-semibold">{vaDetails.bankName}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Virtual Account Number</label>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-mono font-bold">{vaDetails.vaNumber}</p>
              <button
                onClick={() => navigator.clipboard.writeText(vaDetails.vaNumber)}
                className="text-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Valid Until</label>
            <p className="text-lg">{new Date(vaDetails.expiryTime).toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="text-sm">
              Please transfer the exact amount to this virtual account number before the expiry time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button onClick={handlePayment}>
      Generate Virtual Account
    </button>
  );
}
```

### For QRIS

```tsx
// components/QRISPayment.tsx
export default function QRISPayment(props: PaymentButtonProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(props),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const details = result.data.paymentDetails;
      setQrCodeUrl(details.qrCodeUrl);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (qrCodeUrl) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <h3 className="text-xl font-bold mb-4">Scan QR Code</h3>
        <img
          src={qrCodeUrl}
          alt="QRIS Code"
          className="mx-auto w-64 h-64"
        />
        <p className="mt-4 text-sm text-gray-600">
          Scan this QR code with any e-wallet app that supports QRIS
        </p>
      </div>
    );
  }

  return (
    <button onClick={handlePayment}>
      Generate QR Code
    </button>
  );
}
```

### For Convenience Store (Alfamart/Indomaret)

```tsx
// components/CStorePayment.tsx
export default function CStorePayment(props: PaymentButtonProps) {
  const [paymentCode, setPaymentCode] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(props),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const details = result.data.paymentDetails;
      setPaymentCode(details.paymentCode);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (paymentCode) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Payment Code</h3>
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-3xl font-mono font-bold text-center">{paymentCode}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p>1. Visit the nearest {props.paymentMethodName} store</p>
          <p>2. Tell the cashier you want to pay via Midtrans</p>
          <p>3. Give them this payment code</p>
          <p>4. Pay the exact amount</p>
        </div>
      </div>
    );
  }

  return (
    <button onClick={handlePayment}>
      Generate Payment Code
    </button>
  );
}
```

---

## 4. Type Definitions

```typescript
// types/payment.ts
export interface PaymentButtonProps {
  carServices: Array<{ carServiceId: string }>;
  carModelId?: string;
  colorId?: string;
  carModelColorId?: string;
  workshopId: string;
  paymentMethodId: string;
  paymentMethodName?: string;
  note?: string;
  plateNumber?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    transactionId: string;
    paymentStatus: string;
    totalAmount: number;
    // Snap API specific
    snapToken?: string;
    redirectUrl?: string;
    // Core API specific
    paymentDetails?: {
      paymentType: string;
      vaNumber?: string;
      paymentCode?: string;
      billKey?: string;
      billerCode?: string;
      qrCodeUrl?: string;
      deeplinkUrl?: string;
      redirectUrl?: string;
      expiryTime?: string;
    };
  };
}
```

---

## 5. Environment Variables

```env
# Frontend (.env.local for Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
```

---

## 6. Mobile App Integration (React Native)

### Snap API with WebView

```tsx
// components/SnapPaymentWebView.tsx
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Modal, View, Button } from 'react-native';

export default function SnapPaymentWebView({ snapToken, onClose, onSuccess }) {
  const [visible, setVisible] = useState(true);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script src="https://app.midtrans.com/snap/snap.js"
              data-client-key="${process.env.MIDTRANS_CLIENT_KEY}"></script>
    </head>
    <body>
      <script>
        snap.pay('${snapToken}', {
          onSuccess: function(result) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'success',
              result: result
            }));
          },
          onPending: function(result) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'pending',
              result: result
            }));
          },
          onError: function(result) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'error',
              result: result
            }));
          },
          onClose: function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'close'
            }));
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.status === 'success') {
      onSuccess(data.result);
      setVisible(false);
    } else if (data.status === 'close') {
      onClose();
      setVisible(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <WebView
          source={{ html }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
        />
        <Button title="Close" onPress={() => setVisible(false)} />
      </View>
    </Modal>
  );
}
```

---

## Testing Checklist

### Snap API Testing
- [ ] Popup opens correctly
- [ ] Can select different payment methods
- [ ] Success callback works
- [ ] Pending callback works
- [ ] Error callback works
- [ ] Close callback works
- [ ] Redirect method works

### Core API Testing
- [ ] E-wallet deeplink works on mobile
- [ ] E-wallet web URL works on desktop
- [ ] VA number generated correctly
- [ ] QR code displays correctly
- [ ] Payment code generated for convenience stores
- [ ] Payment instructions clear and accurate

### General Testing
- [ ] Payment status updates via webhook
- [ ] Order status updates correctly
- [ ] Email notifications sent
- [ ] Transaction history accurate
- [ ] Refund works correctly
