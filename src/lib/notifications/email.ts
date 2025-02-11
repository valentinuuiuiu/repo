import { createTransport } from "nodemailer";

const transporter = createTransport({
  // Configure your email service here
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export const sendEmail = async ({
  to,
  subject,
  template,
  data,
}: EmailOptions) => {
  // Add your email templates here
  const templates: Record<string, (data: any) => string> = {
    "supplier-order": (orderData) => `
      New Order #${orderData.orderNumber}
      
      Items:
      ${orderData.items
        .map(
          (item: any) => `
        - ${item.title} (SKU: ${item.sku})
        Quantity: ${item.quantity}
      `,
        )
        .join("\n")}
      
      Shipping Address:
      ${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}
      ${orderData.shippingAddress.address1}
      ${orderData.shippingAddress.address2 ? orderData.shippingAddress.address2 + "\n" : ""}
      ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}
      ${orderData.shippingAddress.country}
    `,
    "order-confirmation": (orderData) => `
      Thank you for your order #${orderData.orderNumber}
      
      Your order has been confirmed and is being processed.
      
      Order Details:
      ${orderData.items
        .map(
          (item: any) => `
        - ${item.title}
        Quantity: ${item.quantity}
        Price: $${item.price.toFixed(2)}
      `,
        )
        .join("\n")}
      
      Subtotal: $${orderData.subtotal.toFixed(2)}
      Shipping: $${orderData.shipping.toFixed(2)}
      Tax: $${orderData.tax.toFixed(2)}
      Total: $${orderData.total.toFixed(2)}
    `,
  };

  const html = templates[template](data);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};
