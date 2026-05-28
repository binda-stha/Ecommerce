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

  generateInvoice(orderData) {
    const doc = new jsPDF();

    // Set up colors
    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [107, 114, 128]; // Gray

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Binda Ecommerce", 15, 25);

    // Invoice title
    doc.setFontSize(16);
    doc.text("DIGITAL INVOICE", 150, 25);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Company Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(this.company.address, 15, 50);
    doc.text(`Phone: ${this.company.phone}`, 15, 55);
    doc.text(`Email: ${this.company.email}`, 15, 60);
    doc.text(`Website: ${this.company.website}`, 15, 65);

    // Invoice Details
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details:", 150, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: ${orderData.invoiceNumber}`, 150, 55);
    doc.text(`Order ID: ${orderData.orderId}`, 150, 60);
    doc.text(`Date: ${new Date(orderData.date).toLocaleDateString()}`, 150, 65);
    doc.text(`Payment Status: ${orderData.paymentStatus}`, 150, 70);

    // Customer Details
    const customer = orderData.customer;
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, 85);
    doc.setFont("helvetica", "normal");
    doc.text(`${customer.firstName} ${customer.lastName}`, 15, 90);
    doc.text(customer.email, 15, 95);
    if (customer.phone) {
      doc.text(customer.phone, 15, 100);
    }

    // Points Information
    if (orderData.pointsEarned > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Loyalty Points:", 150, 85);
      doc.setFont("helvetica", "normal");
      doc.text(`Points Earned: ${orderData.pointsEarned}`, 150, 90);
      doc.text(`Total Points: ${orderData.totalPoints}`, 150, 95);
    }

    // Table Header
    const tableTop = 120;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, tableTop, 180, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Product", 20, tableTop + 7);
    doc.text("Trader", 70, tableTop + 7);
    doc.text("Qty", 110, tableTop + 7);
    doc.text("Price", 130, tableTop + 7);
    doc.text("Total", 165, tableTop + 7);

    // Table Content
    doc.setFont("helvetica", "normal");
    let y = tableTop + 15;
    let grandTotal = 0;

    orderData.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;

      doc.text(item.name.substring(0, 25), 20, y);
      doc.text(item.trader, 70, y);
      doc.text(item.quantity.toString(), 110, y);
      doc.text(`₹${item.price.toLocaleString()}`, 130, y);
      doc.text(`₹${itemTotal.toLocaleString()}`, 165, y);

      y += 8;

      // Add line separator
      if (index < orderData.items.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.line(15, y - 2, 195, y - 2);
      }
    });

    // Totals Section
    y += 10;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, y, 195, y);
    y += 10;

    // Subtotal
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 130, y);
    doc.text(`₹${orderData.subtotal.toLocaleString()}`, 165, y);
    y += 8;

    // Discount (if any)
    if (orderData.discount > 0) {
      doc.setTextColor(34, 197, 94); // Green
      doc.text("Discount:", 130, y);
      doc.text(`-₹${orderData.discount.toLocaleString()}`, 165, y);
      if (orderData.promoCode) {
        doc.setFontSize(8);
        doc.text(`(${orderData.promoCode})`, 130, y + 4);
        doc.setFontSize(9);
      }
      doc.setTextColor(0, 0, 0); // Reset color
      y += 8;
    }

    // Tax
    doc.text("Tax (18%):", 130, y);
    doc.text(`₹${orderData.tax.toLocaleString()}`, 165, y);
    y += 8;

    // Shipping
    doc.text("Shipping:", 130, y);
    doc.text("Free", 165, y);
    y += 10;

    // Final Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Amount:", 130, y);
    doc.text(`₹${orderData.finalTotal.toLocaleString()}`, 165, y);

    // Payment Information
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Information:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y += 8;
    doc.text(`Payment Method: PayPal`, 15, y);
    y += 5;
    doc.text(`Transaction ID: ${orderData.transactionId}`, 15, y);
    y += 5;
    doc.text(
      `Payment Date: ${new Date(orderData.paymentDate).toLocaleString()}`,
      15,
      y
    );

    // Trader Information
    if (orderData.traders && orderData.traders.length > 0) {
      y += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Seller Information:", 15, y);
      doc.setFont("helvetica", "normal");
      y += 8;

      orderData.traders.forEach((trader) => {
        doc.text(`• ${trader.name} - ${trader.shopName}`, 20, y);
        y += 5;
      });
    }

    // Footer
    const footerY = 270;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, 195, footerY);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for shopping with Binda Ecommerce!", 15, footerY + 8);
    doc.text(
      "For support, contact us at support@bptrade.com",
      15,
      footerY + 13
    );

    // Digital signature
    doc.text(
      "This is a digitally generated invoice and does not require a physical signature.",
      15,
      footerY + 18
    );

    return doc;
  }

  downloadInvoice(orderData, filename) {
    const doc = this.generateInvoice(orderData);
    doc.save(filename || `BP-Trade-Invoice-${orderData.invoiceNumber}.pdf`);
  }

  previewInvoice(orderData) {
    const doc = this.generateInvoice(orderData);
    window.open(doc.output("bloburl"), "_blank");
  }

  emailInvoice(orderData, emailAddress) {
    // This would integrate with your backend email service
    const doc = this.generateInvoice(orderData);
    const pdfBlob = doc.output("blob");

    // Create FormData for sending to backend
    const formData = new FormData();
    formData.append(
      "invoice",
      pdfBlob,
      `BP-Trade-Invoice-${orderData.invoiceNumber}.pdf`
    );
    formData.append("email", emailAddress);
    formData.append("orderData", JSON.stringify(orderData));

    return formData;
  }
}

export default new InvoiceService();
