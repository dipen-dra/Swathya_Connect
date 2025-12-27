import React, { useState, useEffect } from 'react';
import swasthyaLogo from '@/assets/swasthyalogo.png';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, ArrowUpRight, ArrowDownLeft, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import InvoiceDialog from '../common/InvoiceDialog';
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { transactionAPI } from '../../services/api';
import { useAuth } from '@/contexts/AuthContext';

const TransactionHistoryTab = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    // Delete Confirmation State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewInvoice = (transaction) => {
        setSelectedTransaction(transaction);
        setShowInvoice(true);
    };

    const confirmDelete = (transaction) => {
        setTransactionToDelete(transaction);
        setDeleteDialogOpen(true);
    };

    const handleDeleteTransaction = async () => {
        if (!transactionToDelete) return;

        try {
            await transactionAPI.delete(transactionToDelete.id, transactionToDelete.type);

            // Remove from state
            setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
            toast.success("Transaction history deleted");

            // Adjust pagination if needed
            if (currentTransactions.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            toast.error("Failed to delete transaction");
        } finally {
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
        }
    };

    const handleDownloadInvoice = async (transaction) => {
        try {
            const response = await transactionAPI.downloadPDF(transaction.id, transaction.type);

            // Create a blob link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${transaction.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Invoice downloaded successfully");
        } catch (error) {
            console.error('Download failed:', error);
            toast.error("Failed to download invoice");
        }
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
            <Card className="border-none shadow-none">
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
                        <div className="space-y-4">
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
                                        {currentTransactions.map((tx) => (
                                            <TableRow key={tx.id} className="font-normal">
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
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleViewInvoice(tx)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                                                            title="View Invoice"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDownloadInvoice(tx)}
                                                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8 w-8"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => confirmDelete(tx)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                            title="Delete History"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="grid grid-cols-3 items-center py-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, transactions.length)} of {transactions.length} entries
                                    </div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="text-sm font-medium whitespace-nowrap">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                    <div /> {/* Spacer for centering */}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <InvoiceDialog
                open={showInvoice}
                onOpenChange={setShowInvoice}
                transaction={selectedTransaction}
                patientName={user?.name}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to remove this transaction from your history?
                            This action cannot be undone, but it does not affect the actual medical or order records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTransaction}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TransactionHistoryTab;
