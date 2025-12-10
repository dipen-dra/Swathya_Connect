import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Eye, Download, Edit3, Trash2, CheckCircle2, Clock, Upload, X } from 'lucide-react';
import { documentsAPI } from '@/services/api';
import { toast } from 'sonner';

export default function DoctorDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [uploadForm, setUploadForm] = useState({
        documentType: 'license',
        documentName: '',
        notes: '',
        file: null
    });

    const [editForm, setEditForm] = useState({
        documentName: '',
        documentType: '',
        notes: ''
    });

    // Load documents on mount
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const response = await documentsAPI.getMyDocuments();
            setDocuments(response.data.data);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB');
                return;
            }
            setUploadForm(prev => ({ ...prev, file }));
        }
    };

    const handleUpload = async () => {
        if (!uploadForm.file || !uploadForm.documentName) {
            toast.error('Please fill in all required fields');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('document', uploadForm.file);
            formData.append('documentType', uploadForm.documentType);
            formData.append('documentName', uploadForm.documentName);
            formData.append('notes', uploadForm.notes);

            await documentsAPI.uploadDocument(formData);
            toast.success('Document uploaded successfully');
            setUploadDialog(false);
            setUploadForm({
                documentType: 'license',
                documentName: '',
                notes: '',
                file: null
            });
            loadDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = async () => {
        if (!editForm.documentName) {
            toast.error('Document name is required');
            return;
        }

        try {
            await documentsAPI.updateDocument(selectedDocument._id, editForm);
            toast.success('Document updated successfully');
            setEditDialog(false);
            setSelectedDocument(null);
            loadDocuments();
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error('Failed to update document');
        }
    };

    const handleDelete = async () => {
        try {
            await documentsAPI.deleteDocument(selectedDocument._id);
            toast.success('Document deleted successfully');
            setDeleteDialog(false);
            setSelectedDocument(null);
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const handleDownload = (doc) => {
        const url = `http://localhost:5000/api/documents/${doc._id}/download`;
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.documentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (doc) => {
        const url = `http://localhost:5000/api/documents/${doc._id}/view`;
        window.open(url, '_blank');
    };

    const openEditDialog = (doc) => {
        setSelectedDocument(doc);
        setEditForm({
            documentName: doc.documentName,
            documentType: doc.documentType,
            notes: doc.notes || ''
        });
        setEditDialog(true);
    };

    const openDeleteDialog = (doc) => {
        setSelectedDocument(doc);
        setDeleteDialog(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getDocumentTypeLabel = (type) => {
        const labels = {
            license: 'Medical License',
            degree: 'Degree',
            certificate: 'Certificate',
            verification: 'Verification Document',
            other: 'Other'
        };
        return labels[type] || type;
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Professional Documents</CardTitle>
                        <CardDescription>Manage your medical licenses, certificates, and credentials</CardDescription>
                    </div>
                    <Button
                        onClick={() => setUploadDialog(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Document
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                        <p className="text-sm text-gray-500 mt-1">Upload your professional documents to get verified</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.map((doc) => (
                            <Card key={doc._id} className="border border-gray-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-semibold text-lg text-gray-900">{doc.documentName}</h4>
                                                    <Badge className={`${getStatusColor(doc.status)} border font-medium`}>
                                                        {doc.status === 'verified' ? (
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <Clock className="h-3 w-3 mr-1" />
                                                        )}
                                                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                                    </Badge>
                                                    {doc.isVerificationDocument && (
                                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 border font-medium">
                                                            Registration Document
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{getDocumentTypeLabel(doc.documentType)}</p>
                                                {doc.notes && (
                                                    <p className="text-sm text-gray-500 mb-2">{doc.notes}</p>
                                                )}
                                                {doc.rejectionReason && (
                                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                        <p className="text-sm text-red-800">
                                                            <strong>Rejection Reason:</strong> {doc.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                                    <div>
                                                        <p className="text-gray-500 font-medium">Upload Date</p>
                                                        <p className="text-gray-900">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    {doc.verifiedAt && (
                                                        <div>
                                                            <p className="text-gray-500 font-medium">Verified Date</p>
                                                            <p className="text-gray-900">{new Date(doc.verifiedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(doc)}
                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                            {!doc.isVerificationDocument && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditDialog(doc)}
                                                        className="border-green-200 text-green-600 hover:bg-green-50"
                                                    >
                                                        <Edit3 className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDeleteDialog(doc)}
                                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Upload Dialog */}
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent className="bg-white max-w-md overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload your professional documents for verification
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
                        <div>
                            <Label htmlFor="documentType">Document Type *</Label>
                            <Select
                                value={uploadForm.documentType}
                                onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="license">Medical License</SelectItem>
                                    <SelectItem value="degree">Degree</SelectItem>
                                    <SelectItem value="certificate">Certificate</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="documentName">Document Name *</Label>
                            <Input
                                id="documentName"
                                value={uploadForm.documentName}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                                placeholder="e.g., Medical License - NMC"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={uploadForm.notes}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional information"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Document File * (PDF, JPG, PNG - Max 10MB)</Label>
                            <div className="mt-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full justify-start overflow-hidden"
                                >
                                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate block">
                                        {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setUploadDialog(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="bg-white max-w-md overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>Edit Document</DialogTitle>
                        <DialogDescription>
                            Update document information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
                        {/* Show current document */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">Current Document</p>
                                        <p className="text-xs text-gray-600 truncate">
                                            {selectedDocument?.documentUrl?.split('/').pop()}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleView(selectedDocument)}
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-shrink-0 ml-2"
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                </Button>
                            </div>
                            {selectedDocument?.status === 'verified' && (
                                <p className="text-xs text-green-600 mt-2 flex items-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1 flex-shrink-0" />
                                    Document is verified. File cannot be changed.
                                </p>
                            )}
                            {selectedDocument?.status !== 'verified' && (
                                <p className="text-xs text-gray-500 mt-2">
                                    To change the file, please delete this document and upload a new one.
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="editDocumentType">Document Type</Label>
                            <Select
                                value={editForm.documentType}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, documentType: value }))}
                                disabled={selectedDocument?.status === 'verified'}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="license">Medical License</SelectItem>
                                    <SelectItem value="degree">Degree</SelectItem>
                                    <SelectItem value="certificate">Certificate</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="editDocumentName">Document Name</Label>
                            <Input
                                id="editDocumentName"
                                value={editForm.documentName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, documentName: e.target.value }))}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="editNotes">Notes</Label>
                            <Input
                                id="editNotes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setEditDialog(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedDocument?.documentName}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
