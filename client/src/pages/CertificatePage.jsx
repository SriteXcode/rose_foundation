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
      try {
        const canvas = await html2canvas(certificateRef.current, { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const base64Image = canvas.toDataURL('image/png');

        // Trigger immediate local download for speed
        const link = document.createElement('a');
        link.download = `Certificate-${donation.donorName}.png`;
        link.href = base64Image;
        link.click();

        // Background upload to Cloudinary for sharing/persistence
        try {
          const uploadResponse = await axiosInstance.post('/payment/upload-certificate', {
            image: base64Image,
            donationId: donation._id
          });
          
          if (uploadResponse.data.url) {
            setDonation(prev => ({ ...prev, certificateUrl: uploadResponse.data.url }));
            toast.success('Certificate saved to cloud!');
          }
        } catch (uploadError) {
          console.error("Cloud upload failed", uploadError);
          // Don't disturb user if local download worked
        }

      } catch (err) {
        console.error("Download Error:", err);
        toast.error('Failed to generate image');
      }
    }
  };

  const handleShare = async () => {
    // Generate URL if not already saved
    let shareUrl = donation.certificateUrl;

    if (!shareUrl && certificateRef.current) {
       try {
         const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
         const base64Image = canvas.toDataURL('image/png');
         const uploadResponse = await axiosInstance.post('/payment/upload-certificate', {
            image: base64Image,
            donationId: donation._id
         });
         shareUrl = uploadResponse.data.url;
         setDonation(prev => ({ ...prev, certificateUrl: shareUrl }));
       } catch (err) {
         console.error("Share generation error", err);
         toast.error("Could not generate shareable link");
         return;
       }
    }

    const shareData = {
      title: 'My Donation Certificate',
      text: `I just donated ₹${donation.amount} to Black Rose Foundation!`,
      url: shareUrl || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Certificate...</div>;
  if (!donation) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8 px-2 md:px-4">
      
      {/* Certificate Container */}
      <div 
        ref={certificateRef}
        className="relative w-full max-w-5xl aspect-[1.414/1] shadow-2xl p-6 md:p-12 text-center border-[10px] md:border-[20px] border-double border-[#bf9b30] flex flex-col items-center justify-center bg-no-repeat bg-center bg-cover overflow-hidden"
        style={{ 
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
          color: '#1e293b' // Default text color slate-800
        }}
      >
        {/* Corner Ornaments */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 w-8 h-8 md:w-16 md:h-16 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-[#bf9b30]"></div>
        <div className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-16 md:h-16 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-[#bf9b30]"></div>
        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-8 h-8 md:w-16 md:h-16 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-[#bf9b30]"></div>
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-8 h-8 md:w-16 md:h-16 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-[#bf9b30]"></div>

        <img src={logo} alt="Logo" className="h-12 md:h-24 mb-2 md:mb-6 opacity-90 invert" />
        
        <h1 className="text-2xl md:text-5xl lg:text-6xl font-serif text-[#bf9b30] mb-1 md:mb-2 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
          Certificate of Appreciation
        </h1>
        
        <p className="text-[10px] md:text-base italic mb-2 md:mb-8" style={{ color: '#6b7280' }}>This certificate is proudly presented to</p>
        
        <h2 className="text-xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-6 font-serif border-b md:border-b-2 border-[#bf9b30] pb-1 md:pb-2 px-4 md:px-8 min-w-[50%]" style={{ color: '#1e293b' }}>
          {donation.donorName}
        </h2>
        
        <p className="text-xs md:text-xl max-w-2xl leading-relaxed mb-4 md:mb-8 px-4" style={{ color: '#4b5563' }}>
          For your generous contribution of <span className="font-bold" style={{ color: '#1e293b' }}>₹{donation.amount}</span> towards 
          empowering communities and transforming lives. Your support makes a significant difference.
        </p>

        <div className="flex justify-between w-full max-w-3xl mt-4 md:mt-8 px-4 md:px-12">
          <div className="text-center">
            <p className="text-xs md:text-lg font-bold border-t pt-1 md:pt-2 px-2 md:px-4" style={{ color: '#1e293b', borderColor: '#9ca3af' }}>
              {new Date(donation.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[8px] md:text-sm uppercase tracking-widest mt-1" style={{ color: '#6b7280' }}>Date</p>
          </div>
          
          <div className="text-center">
            {/* Signature Placeholder */}
            <div className="font-cursive text-sm md:text-3xl mb-1" style={{ fontFamily: 'Dancing Script, cursive', color: '#1e293b' }}>Black Rose</div>
            <p className="text-xs md:text-lg font-bold border-t pt-1 md:pt-2 px-2 md:px-4" style={{ color: '#1e293b', borderColor: '#9ca3af' }}>Black Rose Foundation</p>
            <p className="text-[8px] md:text-sm uppercase tracking-widest mt-1" style={{ color: '#6b7280' }}>Authorized Signature</p>
          </div>
        </div>

        <div className="mt-8 text-[8px] md:text-xs font-mono opacity-70" style={{ color: '#9ca3af' }}>
          ID: {donation._id} | Transaction: {donation.transactionId || 'N/A'}
        </div>
      </div>

      {/* Action Buttons */}
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
          onClick={() => navigate('/profile')}
          className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-full font-bold shadow hover:bg-gray-50 transition-all"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default CertificatePage;
