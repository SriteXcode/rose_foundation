import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png'; // Make sure this path is correct or use a public URL

const CertificatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDownload = async () => {
    if (certificateRef.current) {
      const toastId = toast.loading('Generating certificate...');
      try {
        // Small delay to ensure rendering is stable
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(certificateRef.current, { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        });
        
        const base64Image = canvas.toDataURL('image/png');

        // Trigger immediate local download for speed
        const link = document.createElement('a');
        link.download = `Certificate-${donation.donorName}.png`;
        link.href = base64Image;
        link.click();

        toast.dismiss(toastId);
        toast.success('Certificate downloaded!');

        // Background upload to Cloudinary for sharing/persistence
        try {
          const uploadResponse = await axiosInstance.post('/payment/upload-certificate', {
            image: base64Image,
            donationId: donation._id
          });
          
          if (uploadResponse.data.url) {
            setDonation(prev => ({ ...prev, certificateUrl: uploadResponse.data.url }));
          }
        } catch (uploadError) {
          console.error("Cloud upload failed", uploadError);
        }

      } catch (err) {
        console.error("Download Error:", err);
        toast.dismiss(toastId);
        toast.error('Failed to generate certificate image');
      }
    }
  };

  const handleShare = async () => {
    const toastId = toast.loading('Preparing to share...');
    try {
      // Generate URL if not already saved
      let shareUrl = donation.certificateUrl;

      if (!shareUrl && certificateRef.current) {
         try {
           await new Promise(resolve => setTimeout(resolve, 500));
           const canvas = await html2canvas(certificateRef.current, { 
             scale: 2, 
             useCORS: true, 
             backgroundColor: '#ffffff',
             allowTaint: true 
           });
           const base64Image = canvas.toDataURL('image/png');
           const uploadResponse = await axiosInstance.post('/payment/upload-certificate', {
              image: base64Image,
              donationId: donation._id
           });
           shareUrl = uploadResponse.data.url;
           setDonation(prev => ({ ...prev, certificateUrl: shareUrl }));
         } catch (err) {
           console.error("Share generation error", err);
           toast.dismiss(toastId);
           toast.error("Could not generate shareable link");
           return;
         }
      }

      toast.dismiss(toastId);
      
      const shareData = {
        title: 'My Donation Certificate',
        text: `I just donated ₹${donation.amount} to Blackrose Foundation!`,
        url: shareUrl || window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      toast.dismiss(toastId);
      // If user cancelled share, don't show error
      if (err.name !== 'AbortError') {
        toast.error('Unable to share. Link copied to clipboard instead.');
        // Fallback copy
        try {
             await navigator.clipboard.writeText(donation.certificateUrl || window.location.href);
        } catch (e) { /* ignore */ }
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Certificate...</div>;
  if (!donation) return null;

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-3">
  
  {/* Certificate Wrapper */}
  <div
    ref={certificateRef}
    className="relative w-full max-w-5xl aspect-[1.414/1] bg-[#ffffff] overflow-hidden shadow-2xl"
    style={{
      border: "18px double #bf9b30",
    }}
  >
    {/* Background Watermark */}
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
      <img src={logo} alt="watermark" className="w-[55%] max-w-md" crossOrigin="anonymous" />
    </div>

    {/* Inner Padding */}
    <div className="relative h-full w-full px-6 md:px-14 py-6 md:py-12 flex flex-col justify-between">

      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <img src={logo} alt="Logo" className="h-14 md:h-24" crossOrigin="anonymous" />
        </div>

        <h1
          className="text-2xl md:text-5xl font-bold tracking-wide text-[#bf9b30]"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          Certificate of Appreciation
        </h1>

        <p className="mt-2 text-xs md:text-base italic text-[#6b7280]">
          This certificate is proudly presented to
        </p>
      </div>

      {/* Body */}
      <div className="text-center px-2 md:px-10">
        <h2 className="text-xl md:text-4xl font-bold text-[#0f172a] mt-4">
          {donation.donorName}
        </h2>

        <div className="mx-auto mt-2 w-40 md:w-72 h-[2px] bg-[#bf9b30]" />

        <p className="mt-5 md:mt-7 text-xs md:text-lg leading-relaxed text-[#374151] max-w-3xl mx-auto">
          In recognition of your generous donation of{" "}
          <span className="font-bold text-[#0f172a]">₹{donation.amount}</span>{" "}
          towards empowering communities and transforming lives.
          <br />
          Your support truly makes a difference.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end px-2 md:px-10">

        {/* Date */}
        <div className="text-center">
          <p className="text-xs md:text-lg font-semibold text-[#0f172a] border-t border-[#9ca3af] pt-2 w-28 md:w-48">
            {new Date(donation.createdAt).toLocaleDateString()}
          </p>
          <p className="text-[10px] md:text-sm uppercase tracking-widest text-[#6b7280] mt-1">
            Date
          </p>
        </div>

        {/* Center Stamp */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 md:h-24 md:w-24 rounded-full border-4 border-[#bf9b30] flex items-center justify-center text-center">
            <p className="text-[9px] md:text-xs font-bold text-[#bf9b30] leading-tight">
              OFFICIAL
              <br />
              SEAL
            </p>
          </div>
          <p className="text-[10px] md:text-xs text-[#9ca3af] mt-2">
            Verified
          </p>
        </div>

        {/* Signature */}
        <div className="text-center">
          <img src={logo} alt="Signature" className="h-8 md:h-14 mx-auto opacity-80 mb-1" crossOrigin="anonymous" />
          <p className="text-xs md:text-lg font-semibold text-[#0f172a] border-t border-[#9ca3af] pt-2 w-28 md:w-52">
            Blackrose Foundation
          </p>
          <p className="text-[10px] md:text-sm uppercase tracking-widest text-[#6b7280] mt-1">
            Authorized Signature
          </p>
        </div>
      </div>

      {/* Bottom ID Row */}
      <div className="text-center text-[9px] md:text-xs font-mono text-[#9ca3af] mt-2">
        ID: {donation._id} | Transaction: {donation.transactionId || "N/A"}
      </div>
    </div>
  </div>

  {/* Buttons */}
  <div className="mt-8 flex gap-4 flex-wrap justify-center">
    <button
      onClick={handleDownload}
      className="bg-[#bf9b30] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#a38325] transition-all transform hover:scale-105 flex items-center gap-2"
    >
      <span>⬇️</span> Download Certificate
    </button>

    <button
      onClick={handleShare}
      className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-900 transition-all transform hover:scale-105 flex items-center gap-2"
    >
      <span>🔗</span> Share
    </button>

    <button
      onClick={() => navigate("/profile")}
      className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-full font-bold shadow hover:bg-gray-50 transition-all"
    >
      Back to Profile
    </button>
  </div>
</div>

  );
};

export default CertificatePage;
