import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import Authorized_Signature from '../assets/Authorized_Signature.png';
import logo from '../assets/logo.png';

const InvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  // A4 Aspect Ratio (~1:1.41)
  const INV_WIDTH = 800;
  const INV_HEIGHT = 1132;

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axiosInstance.get(`/payment/certificate/${id}`);
        setDonation(response.data);
      } catch (error) {
        toast.error('Donation record not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, navigate]);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDesktop = vw >= 1024;

      const xPadding = isDesktop ? 400 : 40; 
      const yPadding = isDesktop ? 100 : 120; 

      const availableWidth = vw - xPadding;
      const availableHeight = vh - yPadding;

      const scaleX = availableWidth / INV_WIDTH;
      const scaleY = availableHeight / INV_HEIGHT;

      setScale(Math.min(scaleX, scaleY, isDesktop ? 0.8 : 1));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  const handleDownload = async () => {
    const toastId = toast.loading('Generating invoice...');
    try {
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Invoice-${donation.transactionId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Invoice downloaded!', { id: toastId });
    } catch (err) {
      toast.error('Failed to generate invoice', { id: toastId });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold">Loading Invoice...</div>;
  if (!donation) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center lg:justify-start lg:pl-20 overflow-hidden pt-20 pb-10">
      
      {/* Action Buttons */}
      <div className="hidden lg:flex flex-col gap-4 fixed right-20 top-1/2 -translate-y-1/2 z-50">
        <button onClick={handleDownload} className="bg-red-600 text-white w-44 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
          <span>⬇️</span> Download
        </button>
        <button onClick={() => navigate(-1)} className="bg-white text-slate-700 border w-44 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
          <span>⬅️</span> Back
        </button>
      </div>

      <div 
        style={{ 
          width: INV_WIDTH, 
          height: INV_HEIGHT, 
          transform: `scale(${scale})`,
          transformOrigin: 'top center lg:top-left',
        }} 
        className="bg-white shadow-2xl origin-top lg:origin-left shrink-0"
      >
        <div ref={invoiceRef} className="p-12 h-full flex flex-col text-slate-800 border-[12px] border-slate-50">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-20" />
              <div>
                <h1 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Blackrose Foundation</h1>
                <p className="text-xs font-bold text-slate-500 max-w-xs">Empowering communities through sustainable development and social welfare.</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 uppercase mb-2">Donation Receipt</h2>
              <p className="text-sm font-bold">Receipt #: <span className="text-slate-600">{donation.transactionId?.slice(-8).toUpperCase()}</span></p>
              <p className="text-sm font-bold">Date: <span className="text-slate-600">{new Date(donation.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>

          {/* Org Info */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div>
              <h3 className="font-black text-slate-400 uppercase text-xs mb-2">Organization Details</h3>
              <p className="font-bold">Blackrose Foundation</p>
              <p className="text-slate-600">Kanpur, Uttar Pradesh, India</p>
              <p className="text-slate-600">Email: contact@blackrosefoundation.org</p>
              <p className="text-slate-600">PAN: AANCB5505D</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="font-black text-slate-400 uppercase text-xs mb-2">Tax Exemption Info</h3>
              <p className="text-[11px] leading-tight text-slate-500 italic">
                Donations to Blackrose Foundation are exempt from tax under Section 80G of the Income Tax Act, 1961.
              </p>
              <p className="mt-2 font-bold text-xs">80G Reg No: AANCB5505DF20261</p>
            </div>
          </div>

          {/* Donor Info */}
          <div className="mb-10">
            <h3 className="font-black text-slate-400 uppercase text-xs mb-3">Donor Information</h3>
            <div className="border rounded-xl p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Received From</p>
                <p className="text-xl font-black text-slate-800">{donation.donorName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold">Payment Mode</p>
                <p className="text-lg font-bold text-slate-700">{donation.paymentMethod || 'Online'}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-4 text-left rounded-tl-lg">Description</th>
                  <th className="p-4 text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-b">
                  <td className="p-6">
                    <p className="font-bold">Voluntary Donation</p>
                    <p className="text-sm text-slate-500 italic">Contribution towards foundation social welfare activities.</p>
                  </td>
                  <td className="p-6 text-right font-black text-2xl">₹{donation.amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td className="p-4 text-right font-bold uppercase text-slate-400">Total Amount Received</td>
                  <td className="p-4 text-right font-black text-3xl text-red-600">₹{donation.amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Footer */}
          <div className="mt-auto border-t-2 border-slate-100 pt-8 flex justify-between items-end">
            <div className="text-[10px] text-slate-400 font-mono space-y-1">
              <p>CIN: U96091UP2025NPL223505</p>
              <p>NGO DARPAN ID: UP/2025/0631601</p>
              <p>© Blackrose Foundation - Generated Electronically</p>
            </div>
            <div className="text-center">
              <img src={Authorized_Signature} alt="Sign" className="h-16 mx-auto mb-2" />
              <div className="w-48 h-px bg-slate-300 mx-auto mb-1"></div>
              <p className="text-xs font-black uppercase">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
        <div className="bg-white shadow-2xl p-2 rounded-full flex gap-2 border">
          <button onClick={handleDownload} className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg text-sm">
            Download Invoice
          </button>
          <button onClick={() => navigate(-1)} className="bg-gray-100 text-slate-700 px-6 py-3 rounded-full font-bold text-sm">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
