import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import Authorized_Signature from '../assets/Authorized_Signature.png';
import logo from '../assets/logo.png';

const CertificatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const donationRef = useRef(null);

  // Constants for Certificate Dimensions (16:9 Aspect Ratio)
  const CERT_WIDTH = 1200;
  const CERT_HEIGHT = 675;

  useEffect(() => {
    donationRef.current = donation;
  }, [donation]);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axiosInstance.get(`/payment/certificate/${id}`);
        setDonation(response.data);
      } catch (error) {
        toast.error('Certificate not found');
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

      // Desktop: Reserve space for Right Sidebar (Buttons) + Left Margin
      // Mobile: Standard padding
      const xPadding = isDesktop ? 400 : 40; 
      const yPadding = isDesktop ? 180 : 140; 

      const availableWidth = vw - xPadding;
      const availableHeight = vh - yPadding;

      const scaleX = availableWidth / CERT_WIDTH;
      const scaleY = availableHeight / CERT_HEIGHT;

      // Scale down a bit more on desktop (0.9 factor) as requested
      const maxScale = isDesktop ? 0.9 : 1.1;
      
      setScale(Math.min(scaleX, scaleY, maxScale));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  const generateCertificateImage = async () => {
    if (!certificateRef.current) return null;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${CERT_WIDTH}px`;
    tempContainer.style.height = `${CERT_HEIGHT}px`;
    document.body.appendChild(tempContainer);

    const clone = certificateRef.current.cloneNode(true);
    tempContainer.appendChild(clone);
    
    try {
        const canvas = await html2canvas(clone, { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          windowWidth: CERT_WIDTH,
          windowHeight: CERT_HEIGHT
        });
        
        return canvas.toDataURL('image/png');
    } finally {
        document.body.removeChild(tempContainer);
    }
  };

  const handleDownload = async () => {
    const toastId = toast.loading('Generating certificate...');
    try {
      const base64Image = await generateCertificateImage();
      if (!base64Image) throw new Error("Failed to generate image");

      const link = document.createElement('a');
      link.download = `Certificate-${donation.donorName}.png`;
      link.href = base64Image;
      link.click();

      toast.success('Certificate downloaded!', { id: toastId });

      if (!donation.certificateUrl) {
          try {
            await axiosInstance.post('/payment/upload-certificate', {
              image: base64Image,
              donationId: donation._id
            });
          } catch (uploadError) {
            console.error("Cloud upload failed", uploadError);
          }
      }

    } catch (err) {
      console.error("Download Error:", err);
      toast.error('Failed to generate certificate image', { id: toastId });
    }
  };

  const handleShare = async () => {
    const toastId = toast.loading('Preparing to share...');
    try {
      let shareUrl = donationRef.current?.certificateUrl;

      if (!shareUrl) {
         try {
           const base64Image = await generateCertificateImage();
           if (!base64Image) throw new Error("Failed to generate image for share");

           const uploadResponse = await axiosInstance.post('/payment/upload-certificate', {
              image: base64Image,
              donationId: donation._id
           });
           shareUrl = uploadResponse.data.url;
           setDonation(prev => ({ ...prev, certificateUrl: shareUrl }));
         } catch (err) {
           console.error("Share generation error", err);
           toast.error("Could not generate shareable link", { id: toastId });
           return;
         }
      }

      toast.dismiss(toastId);
      
      const shareData = {
        title: 'My Donation Certificate',
        text: `I just donated ₹${donation.amount} to Blackrose Foundation!`,
        url: shareUrl,
      };

      if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (shareError) {
            if (shareError.name !== 'AbortError') {
                 console.error("Navigator Share Error", shareError);
                 throw shareError; 
            }
        }
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      try {
           const urlToCopy = donationRef.current?.certificateUrl || window.location.href;
           await navigator.clipboard.writeText(urlToCopy);
           toast.success('Link copied to clipboard');
      } catch (e) { 
          toast.error('Unable to share.');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 font-semibold">Loading Certificate...</div>;
  if (!donation) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-start lg:items-center justify-center lg:justify-start lg:pl-16 overflow-hidden pt-28">
      
      {/* Desktop Right Sidebar Buttons */}
      <div className="hidden lg:flex flex-col gap-6 fixed right-16 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={handleDownload}
          className="bg-[#bf9b30] text-white w-48 py-4 rounded-xl font-bold shadow-xl hover:bg-[#a38325] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          <span className="text-xl">⬇️</span> Download
        </button>

        <button
          onClick={handleShare}
          className="bg-slate-800 text-white w-48 py-4 rounded-xl font-bold shadow-xl hover:bg-slate-900 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
        >
          <span className="text-xl">🔗</span> Share
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="bg-white text-slate-700 border border-slate-300 w-48 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 hover:-translate-x-1"
        >
          <span className="text-xl">⬅️</span> Back
        </button>
      </div>

      {/* Scaled Certificate Container */}
      <div 
        style={{ 
          width: CERT_WIDTH, 
          height: CERT_HEIGHT, 
          minWidth: CERT_WIDTH,
          minHeight: CERT_HEIGHT,
          transform: `scale(${scale})`,
          transition: 'transform 0.2s ease-out',
          // transformOrigin handled by Tailwind classes (origin-center lg:origin-left)
        }} 
        className="relative shadow-2xl flex-shrink-0 origin-center lg:origin-left"
      >
        <div
          ref={certificateRef}
          className="w-full h-full relative overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: '#ffffff', 
            borderColor: '#bf9b30', 
            borderWidth: '15px', 
            borderStyle: 'double' 
          }}
        >
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.05 }}>
            <img src={logo} alt="watermark" className="w-[40%]" crossOrigin="anonymous" />
          </div>

          <div className="relative h-full w-full p-10 flex flex-col justify-between" style={{ backgroundColor: '#ffffff' }}>
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <img src={logo} alt="Logo" className="h-16" crossOrigin="anonymous" />
              </div>
              <h1 className="text-4xl font-bold tracking-wide" style={{ fontFamily: "Cinzel, serif", color: '#bf9b30' }}>
                Certificate of Appreciation
              </h1>
              <p className="text-xl italic font-serif" style={{ color: '#64748b' }}>
                This certificate is proudly presented to
              </p>
            </div>

            <div className="text-center flex flex-col items-center justify-center py-2">
              <h2 className="text-5xl font-bold mb-4 font-serif" style={{ color: '#1e293b' }}>
                {donation.donorName}
              </h2>
              <div className="w-80 h-[2px] mb-6" style={{ background: 'linear-gradient(90deg, transparent, #bf9b30, transparent)' }} />
              <p className="text-lg leading-relaxed max-w-3xl mx-auto font-medium" style={{ color: '#475569' }}>
                In recognition of your generous donation of{" "}
                <span className="font-bold text-xl" style={{ color: '#0f172a' }}>₹{donation.amount}</span>{" "}
                towards empowering communities and transforming lives.
                <br />
                Your support truly makes a difference.
              </p>
            </div>

            <div className="mt-2">
              <div className="flex justify-between items-end w-full px-16">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Date</p>
                  <p className="text-lg font-bold pt-1 w-40 mx-auto" style={{ color: '#334155', borderTop: '1px solid #cbd5e1' }}>
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <img src={Authorized_Signature} alt="Signature" className="h-14 mx-auto mb-1" style={{ opacity: 0.9 }} crossOrigin="anonymous" />
                  <p className="text-lg font-bold pt-1 w-56 mx-auto" style={{ color: '#334155', borderTop: '1px solid #cbd5e1' }}>
                    Blackrose Foundation
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#94a3b8' }}>Authorized Signature</p>
                </div>
              </div>

              <div className="mt-6 pt-2 text-center text-[10px] font-mono flex justify-center gap-4 whitespace-nowrap" style={{ borderTop: '1px solid #f1f5f9', color: '#94a3b8' }}>
                <span>CIN: U96091UP2025NPL223505</span>
                <span>•</span>
                <span>NGO DARPAN ID: UP/2025/0631601</span>
                <span>•</span>
                <span>PAN NO: AANCB5505D</span>
                <span>•</span>
                <span>80G NO: AANCB5505DF20261</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Action Buttons (Bottom Pill) */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-4 z-50">
        <div className="bg-white/90 backdrop-blur-md shadow-2xl p-2 rounded-full flex gap-3 border border-slate-200">
          <button
            onClick={handleDownload}
            className="bg-[#bf9b30] text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm"
          >
            <span>⬇️</span> Download
          </button>
          <button
            onClick={handleShare}
            className="bg-slate-800 text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm"
          >
            <span>🔗</span> Share
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-white text-slate-700 border border-slate-300 px-5 py-3 rounded-full font-bold shadow text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
