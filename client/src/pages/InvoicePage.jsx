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
      const isTablet = vw >= 768 && vw < 1024;

      // Account for navbar (pt-24) and some bottom padding
      const navbarHeight = 90; 
      
      let xPadding = 40;
      if (isDesktop) xPadding = 450;
      else if (isTablet) xPadding = 100;
      
      const yPadding = (isDesktop || isTablet) ? navbarHeight + 60 : 120; 

      const availableWidth = vw - xPadding;
      const availableHeight = vh - yPadding;

      const scaleX = availableWidth / INV_WIDTH;
      const scaleY = availableHeight / INV_HEIGHT;

      // Fit logic
      let maxScale = 1;
      if (isDesktop) maxScale = 0.9;
      else if (isTablet) maxScale = 0.85;
      else maxScale = 1.1; // Mobile allows a bit of zoom-out overflow if needed
      
      setScale(Math.min(scaleX, scaleY, maxScale));
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  const generateInvoiceImage = async () => {
    if (!invoiceRef.current) return null;
    
    // Give enough time for images to load if they haven't
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${INV_WIDTH}px`;
    tempContainer.style.height = `${INV_HEIGHT}px`;
    document.body.appendChild(tempContainer);

    const clone = invoiceRef.current.cloneNode(true);
    tempContainer.appendChild(clone);
    
    try {
        const canvas = await html2canvas(clone, { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          windowWidth: INV_WIDTH,
          windowHeight: INV_HEIGHT
        });
        
        return canvas.toDataURL('image/png');
    } finally {
        document.body.removeChild(tempContainer);
    }
  };

  const handleDownload = async () => {
    const toastId = toast.loading('Generating invoice...');
    try {
      const base64Image = await generateInvoiceImage();
      if (!base64Image) throw new Error("Failed to generate image");

      const link = document.createElement('a');
      link.download = `Invoice-${donation.transactionId || 'don'}.png`;
      link.href = base64Image;
      link.click();
      toast.success('Invoice downloaded!', { id: toastId });
    } catch (err) {
      console.error("Invoice Download Error:", err);
      toast.error('Failed to generate invoice', { id: toastId });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold">Loading Invoice...</div>;
  if (!donation) return null;

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-start lg:items-center justify-center lg:justify-start lg:pl-20 md:pl-10 overflow-hidden pt-28 pb-10">
      
      {/* Action Buttons */}
      <div className="hidden md:flex flex-col gap-4 fixed right-6 lg:right-20 top-1/2 -translate-y-1/2 z-50">
        <button onClick={handleDownload} className="bg-red-600 text-white w-32 lg:w-44 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm lg:text-base">
          <span>⬇️</span> Download
        </button>
        <button onClick={() => navigate(-1)} className="bg-white text-slate-700 border w-32 lg:w-44 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm lg:text-base">
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
        <div ref={invoiceRef} className="p-12 h-full flex flex-col border-[12px]" style={{ color: '#1e293b', borderColor: '#f8fafc', backgroundColor: '#ffffff' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 pb-8 mb-8" style={{ borderColor: '#f1f5f9' }}>
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-20" crossOrigin="anonymous" />
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: '#dc2626' }}>Blackrose Foundation</h1>
                <p className="text-xs font-bold max-w-xs" style={{ color: '#64748b' }}>Empowering communities through sustainable development and social welfare.</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black uppercase mb-2" style={{ color: '#e2e8f0' }}>Donation Receipt</h2>
              <p className="text-sm font-bold">Receipt #: <span style={{ color: '#475569' }}>{donation.transactionId?.slice(-8).toUpperCase()}</span></p>
              <p className="text-sm font-bold">Date: <span style={{ color: '#475569' }}>{new Date(donation.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>

          {/* Org Info */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div>
              <h3 className="font-black uppercase text-xs mb-2" style={{ color: '#94a3b8' }}>Organization Details</h3>
              <p className="font-bold">Blackrose Foundation</p>
              <p style={{ color: '#475569' }}>Kanpur, Uttar Pradesh, India</p>
              <p style={{ color: '#475569' }}>Email: blackrosefoundation111@gmail.com</p>
              <p style={{ color: '#475569' }}>PAN: AANCB5505D</p>
              <p style={{ color: '#475569' }}>Phone: +91 6394107475, +91 93052 71187</p>
              <p style={{ color: '#475569' }}>Website: blackrosefoundation.org.in</p>


            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
              <h3 className="font-black uppercase text-xs mb-2" style={{ color: '#94a3b8' }}>Tax Exemption Info</h3>
              <p className="text-[11px] leading-tight italic" style={{ color: '#64748b' }}>
                Donations to Blackrose Foundation are exempt from tax under Section 80G of the Income Tax Act, 1961.
              </p>
              <p className="mt-2 font-bold text-xs">80G Reg No: AANCB5505DF20261</p>
            </div>
          </div>

          {/* Donor Info */}
          <div className="mb-10">
            <h3 className="font-black uppercase text-xs mb-3" style={{ color: '#94a3b8' }}>Donor Information</h3>
            <div className="border rounded-xl p-5 grid grid-cols-2 gap-4" style={{ borderColor: '#e2e8f0' }}>
              <div>
                <p className="text-xs uppercase font-bold" style={{ color: '#94a3b8' }}>Received From</p>
                <p className="text-xl font-black" style={{ color: '#1e293b' }}>{donation.donorName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold" style={{ color: '#94a3b8' }}>Payment Mode</p>
                <p className="text-lg font-bold" style={{ color: '#334155' }}>{donation.paymentMethod || 'Online'}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  <th className="p-4 text-left rounded-tl-lg">Description</th>
                  <th className="p-4 text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-b" style={{ borderColor: '#f1f5f9', backgroundColor: '#ffffff' }}>
                  <td className="p-6">
                    <p className="font-bold">Voluntary Donation</p>
                    <p className="text-sm italic" style={{ color: '#64748b' }}>Contribution towards foundation social welfare activities.</p>
                  </td>
                  <td className="p-6 text-right font-black text-2xl">₹{donation.amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <td className="p-4 text-right font-bold uppercase" style={{ color: '#94a3b8' }}>Total Amount Received</td>
                  <td className="p-4 text-right font-black text-3xl" style={{ color: '#dc2626' }}>₹{donation.amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Footer */}
          <div className="mt-auto border-t-2 pt-8 flex justify-between items-end" style={{ borderColor: '#f1f5f9' }}>
            <div className="text-[10px] font-mono space-y-1" style={{ color: '#94a3b8' }}>
              <p>CIN: U96091UP2025NPL223505</p>
              <p>NGO DARPAN ID: UP/2025/0631601</p>
              <p>© Blackrose Foundation - Generated Electronically</p>
            </div>
            <div className="text-center">
              <img src={Authorized_Signature} alt="Sign" className="h-16 mx-auto mb-2" crossOrigin="anonymous" />
              <div className="w-48 h-px mx-auto mb-1" style={{ backgroundColor: '#e2e8f0' }}></div>
              <p className="text-xs font-black uppercase">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50">
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
