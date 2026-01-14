import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from 'lucide-react';
import swasthyaLogo from '../../assets/swasthyalogo.png';

const InvoiceDialog = ({ open, onOpenChange, transaction, patientName }) => {
    const invoiceRef = useRef();

    if (!transaction) return null;

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${transaction.id}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; color: #1f2937; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
                        .logo { height: 60px; }
                        .title { text-align: right; }
                        .h1 { font-size: 24px; font-weight: bold; color: #7c3aed; margin: 0; }
                        .meta { color: #6b7280; font-size: 14px; margin-top: 5px; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; }
                        .info p { margin: 5px 0; font-size: 14px; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .table th { text-align: left; border-bottom: 2px solid #e5e7eb; padding: 10px; font-size: 12px; text-transform: uppercase; color: #6b7280; }
                        .table td { padding: 15px 10px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
                        .totals { width: 300px; margin-left: auto; }
                        .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                        .total-row { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 10px; font-weight: bold; font-size: 18px; color: #7c3aed; }
                        .footer { margin-top: 60px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const isConsultation = transaction.type === 'consultation';
    const isOrder = transaction.type === 'medicine_order';

    // Formatting helpers
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatCurrency = (amount) => `NPR ${Number(amount).toLocaleString()}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                {/* Actions Header */}
                <div className="flex justify-start gap-2 mb-4 mt-2 no-print">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </Button>
                </div>

                {/* Invoice Content */}
                <div ref={invoiceRef} className="p-8 bg-white border rounded-lg shadow-sm print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-8 mb-8 header">
                        <img src={swasthyaLogo} alt="Swasthya Connect" className="h-16 logo" onError={(e) => e.target.style.display = 'none'} />
                        <div className="text-right title">
                            <h1 className="text-3xl font-bold text-primary h1">INVOICE</h1>
                            <p className="text-gray-500 mt-2 meta">#{transaction.id.slice(-8).toUpperCase()}</p>
                            <p className="text-gray-500 meta">{formatDate(transaction.date)}</p>
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                {transaction.status}
                            </div>
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-12 mb-12 grid">
                        <div className="info">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 section-title">Billed From</h3>
                            <p className="font-semibold text-gray-900">{transaction.referenceName}</p>
                            <p className="text-gray-600 text-sm">Swasthya Connect Platform</p>
                            <p className="text-gray-600 text-sm">{isConsultation ? 'Telemedicine Services' : 'Pharmacy Partner'}</p>
                        </div>
                        <div className="info">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 section-title">Billed To</h3>
                            <p className="font-semibold text-gray-900">{patientName || 'Patient'}</p>
                            {/* We could pass actual patient name if available, for now Generic or relying on context */}
                            {isOrder && transaction.invoiceData?.deliveryAddress && (
                                <p className="text-gray-600 text-sm mt-1">{transaction.invoiceData.deliveryAddress}</p>
                            )}
                            <p className="text-gray-600 text-sm mt-2">Payment: <span className="capitalize">{transaction.paymentMethod || 'Online'}</span></p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-8 table">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Description</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Qty</th>
                                <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isConsultation && (
                                <tr>
                                    <td className="py-4 border-b border-gray-100">
                                        <p className="font-medium text-gray-900">{transaction.details?.specialty} Consultation</p>
                                        <p className="text-sm text-gray-500 capitalize">{transaction.subType} call with {transaction.referenceName}</p>
                                    </td>
                                    <td className="text-right py-4 border-b border-gray-100">1</td>
                                    <td className="text-right py-4 border-b border-gray-100 font-medium">{formatCurrency(transaction.amount)}</td>
                                </tr>
                            )}

                            {isOrder && transaction.invoiceData?.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 border-b border-gray-100">
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.dosage}</p>
                                    </td>
                                    <td className="text-right py-4 border-b border-gray-100 text-gray-600">{item.quantity}</td>
                                    <td className="text-right py-4 border-b border-gray-100 font-medium">{formatCurrency(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end totals">
                        <div className="w-80 space-y-3">
                            {isOrder && (
                                <>
                                    <div className="flex justify-between text-sm text-gray-600 row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(transaction.invoiceData.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 row">
                                        <span>Delivery</span>
                                        <span>{formatCurrency(transaction.invoiceData.deliveryCharges)}</span>
                                    </div>
                                    {transaction.invoiceData.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-red-600 row">
                                            <span>Discount {transaction.invoiceData.promoCode ? `(${transaction.invoiceData.promoCode})` : ''}</span>
                                            <span>- {formatCurrency(transaction.invoiceData.discountAmount)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="flex justify-between pt-4 border-t-2 border-gray-200 text-lg font-bold text-primary total-row">
                                <span>Total</span>
                                <span>{formatCurrency(transaction.amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 text-center border-t border-gray-200 footer">
                        <p className="text-gray-500 text-sm">Thank you for trusting Swasthya Connect for your healthcare needs.</p>
                        <p className="text-gray-400 text-xs mt-2">This is a computer-generated invoice and needs no signature.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceDialog;
