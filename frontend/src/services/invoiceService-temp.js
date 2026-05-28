// Temporary invoice service without jsPDF dependency
// TODO: Add jsPDF dependency for full PDF generation

class InvoiceService {
  constructor() {
    this.company = {
      name: "Binda Ecommerce",
      address: "Kathmandu, Nepal",
      phone: "+977 9841234567",
      email: "support@bptrade.com",
      website: "www.bptrade.com",
    };
  }

  generateInvoiceHTML(orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
  <title>Binda Ecommerce Invoice - ${orderData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .section { margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Binda Ecommerce</h1>
          <h2>DIGITAL INVOICE</h2>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>Company Details</h3>
            <p>${this.company.name}<br>
            ${this.company.address}<br>
            Phone: ${this.company.phone}<br>
            Email: ${this.company.email}</p>
          </div>
          
          <div class="section">
            <h3>Invoice Details</h3>
            <p>Invoice #: ${orderData.invoiceNumber}<br>
            Order ID: ${orderData.orderId}<br>
            Date: ${new Date(orderData.date).toLocaleDateString()}<br>
            Payment Status: ${orderData.paymentStatus}</p>
          </div>
          
          <div class="section">
            <h3>Bill To</h3>
            <p>${orderData.customer.firstName} ${
      orderData.customer.lastName
    }<br>
            ${orderData.customer.email}</p>
          </div>
          
          <div class="section">
            <h3>Items</h3>
            <table class="table">
              <tr>
                <th>Product</th>
                <th>Trader</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
              ${orderData.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.trader}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </div>
          
          <div class="section">
            <table class="table" style="width: 50%; margin-left: auto;">
              <tr><td>Subtotal:</td><td>₹${orderData.subtotal.toLocaleString()}</td></tr>
              ${
                orderData.discount > 0
                  ? `<tr><td>Discount:</td><td>-₹${orderData.discount.toLocaleString()}</td></tr>`
                  : ""
              }
              <tr><td>Tax (18%):</td><td>₹${orderData.tax.toLocaleString()}</td></tr>
              <tr class="total"><td>Total:</td><td>₹${orderData.finalTotal.toLocaleString()}</td></tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Payment Information</h3>
            <p>Payment Method: PayPal<br>
            Transaction ID: ${orderData.transactionId}<br>
            Payment Date: ${new Date(
              orderData.paymentDate
            ).toLocaleString()}</p>
          </div>
          
          ${
            orderData.pointsEarned > 0
              ? `
            <div class="section">
              <h3>Loyalty Points</h3>
              <p>Points Earned: ${orderData.pointsEarned}<br>
              Total Points: ${orderData.totalPoints}</p>
            </div>
          `
              : ""
          }
          
          <div class="section">
            <p><small>Thank you for shopping with Binda Ecommerce!<br>
            This is a digitally generated invoice.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  downloadInvoice(orderData, filename) {
    try {
      const htmlContent = this.generateInvoiceHTML(orderData);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        filename || `BP-Trade-Invoice-${orderData.invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show success message
      alert(
        "Invoice downloaded successfully! (HTML format)\nNote: PDF format will be available once jsPDF is properly configured."
      );
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Error downloading invoice. Please try again.");
    }
  }

  previewInvoice(orderData) {
    try {
      const htmlContent = this.generateInvoiceHTML(orderData);
      const newWindow = window.open("", "_blank");
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } catch (error) {
      console.error("Error previewing invoice:", error);
      alert("Error previewing invoice. Please try again.");
    }
  }

  emailInvoice(orderData, emailAddress) {
    // Placeholder for email functionality
    const htmlContent = this.generateInvoiceHTML(orderData);
    console.log("Email invoice functionality - HTML content generated");
    console.log("To:", emailAddress);
    alert(
      "Email invoice functionality will be implemented with backend integration."
    );

    // Return mock form data for future backend integration
    return new FormData();
  }
}

export default new InvoiceService();
