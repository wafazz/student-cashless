import { Link } from '@inertiajs/react';
import ParentLayout from 'layouts/ParentLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Student } from 'types/models';
import { useRef } from 'react';

interface Props {
    student: Student;
}

export default function QrCode({ student }: Props) {
    const qrRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow || !qrRef.current) return;

        printWindow.document.write(`
            <html>
            <head><title>QR - ${student.name}</title></head>
            <body style="text-align:center;font-family:sans-serif;padding:40px;">
                <h2 style="margin-bottom:5px;">${student.name}</h2>
                <p style="color:#666;margin-top:0;">${student.class_name || ''} &middot; ${student.school?.name || ''}</p>
                ${qrRef.current.innerHTML}
                <p style="font-size:12px;color:#999;margin-top:20px;">Student Cashless Payment</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <ParentLayout title={`QR - ${student.name}`}>
            <Link href="/parent/children" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
                &larr; Back to Children
            </Link>

            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {student.class_name} &middot; {student.school?.name}
                    </p>

                    <div ref={qrRef} className="inline-block bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
                        <QRCodeSVG
                            value={student.wallet_uuid}
                            size={220}
                            level="H"
                            includeMargin={true}
                        />
                    </div>

                    <p className="text-xs text-gray-400 mt-4 mb-6">
                        Show this QR code at the canteen to pay
                    </p>

                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-2xl font-bold text-blue-600">
                            RM {Number(student.wallet_balance).toFixed(2)}
                        </p>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        Print QR Code
                    </button>
                </div>
            </div>
        </ParentLayout>
    );
}
