import React, { useState, useEffect } from 'react';
import swasthyaLogo from '@/assets/swasthyalogo.png';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Receipt, ArrowUpRight, ArrowDownLeft, FileText, Download } from 'lucide-react';
import InvoiceDialog from '../common/InvoiceDialog';
import { transactionAPI } from '../../services/api';

const TransactionHistoryTab = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionAPI.getAll();
            if (response.data.success) {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = (transaction) => {
        setSelectedTransaction(transaction);
        setShowInvoice(true);
    };

    const getStatusBadge = (status) => {
        const variants = {
            paid: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            refunded: 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${variants[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        if (type === 'consultation') return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
        return <ArrowDownLeft className="w-4 h-4 text-purple-500" />;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                                <Receipt className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                Your financial history will appear here once you book a consultation or order medicines.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id} className="!border-black/5 font-normal">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {new Date(tx.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(tx.type)}
                                                    <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {tx.referenceName === 'Swasthya Connect Store' ? (
                                                        <img src={swasthyaLogo} alt="Swasthya Connect" className="w-6 h-6 rounded-full object-cover" />
                                                    ) : tx.referenceImage ? (
                                                        <img
                                                            src={tx.referenceImage.startsWith('http') ? tx.referenceImage : `http://localhost:5000${tx.referenceImage}`}
                                                            alt=""
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                                            {tx.referenceName ? tx.referenceName[0] : '?'}
                                                        </div>
                                                    )}
                                                    <span className="truncate max-w-[150px]" title={tx.referenceName}>
                                                        {tx.referenceName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize text-gray-600">
                                                {tx.paymentMethod || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                NPR {Number(tx.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewInvoice(tx)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View Invoice
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <InvoiceDialog
                open={showInvoice}
                onOpenChange={setShowInvoice}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default TransactionHistoryTab;
