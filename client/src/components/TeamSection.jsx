import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, GraduationCap, X, QrCode, Heart } from 'lucide-react';
import { CardSkeleton } from './SkeletonLoader';

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const JoinUsModal = lazy(() => import('./modals/JoinUsModal'));

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const truncateBio = (text, limit = 20) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
};

const TeamSection = ({ limit = 10 }) => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  const fetchTeam = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/volunteers?page=${pageNum}&limit=${limit}&status=approved&showOnHome=true&_t=${Date.now()}`);
      const { volunteers, totalPages } = response.data;
      
      if (volunteers && volunteers.length > 0) {
        setTeamMembers(prev => pageNum === 1 ? volunteers : [...prev, ...volunteers]);
        setHasMore(pageNum < totalPages);
      } else {
        setTeamMembers([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch team members', error);
      setTeamMembers([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam(page);

    const handleTeamUpdate = () => {
      fetchTeam(1);
    };

    window.addEventListener('team-updated', handleTeamUpdate);
    window.addEventListener('focus', handleTeamUpdate);

    return () => {
      window.removeEventListener('team-updated', handleTeamUpdate);
      window.removeEventListener('focus', handleTeamUpdate);
    };
  }, [page]);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [teamMembers]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const getMemberDisplayRole = (member) => {
    if (!member) return 'Volunteer';
    const role = member?.role;
    const des = member?.designation;
    if (!des || des === role || ['Volunteer', 'Intern', 'Team Leader'].includes(des)) {
      return role || des || 'Volunteer';
    }
    return des;
  };

  const isLeader = (member) => {
    if (member?.role === 'Team Leader' || member?.isTeamLeader || member?.isLeader) return true;
    if (member?.role === 'Volunteer' || member?.role === 'Intern') return false;
    const roleStr = `${member?.role || ''} ${member?.designation || ''}`.toLowerCase();
    return (
      roleStr.includes('founder') ||
      roleStr.includes('director') ||
      roleStr.includes('president') ||
      roleStr.includes('head') ||
      roleStr.includes('lead') ||
      roleStr.includes('chief')
    );
  };

  const displayMembers = [...teamMembers].sort((a, b) => {
    const aLeader = isLeader(a);
    const bLeader = isLeader(b);
    if (aLeader && !bLeader) return -1;
    if (!aLeader && bLeader) return 1;
    return 0;
  });

  return (
    <section id="team" className="py-4 md:py-6 bg-white dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-5 sm:mb-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
            Our People
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Meet our dedicated team
          </h2>
        </div>

        {/* Carousel Container */}
        {loading ? (
          <CardSkeleton count={4} columns="grid-cols-2 sm:grid-cols-4" />
        ) : (
          <div className="relative group">

          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-lg backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer border border-gray-200/60 dark:border-zinc-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-lg backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer border border-gray-200/60 dark:border-zinc-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Ultra-Compact Cards */}
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {displayMembers.map((member, index) => {
              const imgSrc = member.image?.startsWith('http') 
                ? getOptimizedImageUrl(member.image, { width: 250, height: 250 })
                : member.image || DEFAULT_AVATAR;
              const leader = isLeader(member);

              return (
                <div 
                  key={`${member._id || index}-${index}`} 
                  onClick={() => setSelectedMember(member)}
                  className={`bg-white dark:bg-zinc-900 border rounded-xl p-2 shadow-xs hover:shadow-md transition-all duration-300 transform hover:scale-[1.04] group shrink-0 w-[calc((100%-12px)/1.75)] md:w-[calc((100%-30px)/3.5)] lg:w-[calc((100%-36px)/4)] snap-start flex flex-col justify-between cursor-pointer ${
                    leader ? 'border-amber-400/80 dark:border-amber-500/50 shadow-amber-500/5 hover:border-amber-500' : 'border-gray-200/70 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <div>
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                      <img 
                        src={imgSrc} 
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {leader && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-zinc-950 font-extrabold text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-md">
                          Lead
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 px-0.5">
                      <h3 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {member.name}
                      </h3>
                      
                      <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                        {getMemberDisplayRole(member)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 pt-1 border-t border-gray-100 dark:border-zinc-800/80 text-center">
                    <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-semibold group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-6 py-3 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer group"
          >
            <span>Join Our Team</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Scholar Disclaimer Tag */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 dark:from-amber-400/10 dark:to-amber-400/10 border border-amber-300/60 dark:border-amber-700/50 px-5 py-2.5 rounded-full text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>This foundation is led by young scholars from college.</span>
          </div>
        </div>

      </div>

      {/* Detailed Team Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 w-full max-w-[290px] shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Avatar Photo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 mb-3 relative shadow-xs ring-2 ring-amber-400/30">
              <img 
                src={selectedMember.image?.startsWith('http') ? selectedMember.image : (selectedMember.image || DEFAULT_AVATAR)} 
                alt={selectedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Role */}
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white truncate">
              {selectedMember.name}
            </h3>
            
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                {getMemberDisplayRole(selectedMember)}
              </span>
              {isLeader(selectedMember) && (
                <span className="bg-amber-500 text-zinc-950 font-extrabold text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs">
                  Lead
                </span>
              )}
            </div>

            {/* Qualification */}
            {(selectedMember.qualification || 'M.A. Social Work') && (
              <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{selectedMember.qualification || 'M.A. Social Work'}</span>
              </div>
            )}

            {/* Bio (Max 20 Words) */}
            {(selectedMember.bio || 'Dedicated team member passionate about community development.') && (
              <div className="mt-2.5 bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 text-left">
                <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-normal font-normal">
                  {truncateBio(selectedMember.bio || 'Dedicated team member passionate about community development.', 20)}
                </p>
              </div>
            )}

            {/* Social Media Links */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800">
              {selectedMember.socialMedia?.linkedin ? (
                <a href={selectedMember.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-600 hover:text-white transition-all">
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="p-1.5 rounded-full bg-gray-50 dark:bg-zinc-800/40 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"><LinkedinIcon className="w-3.5 h-3.5" /></span>
              )}

              {selectedMember.socialMedia?.instagram ? (
                <a href={selectedMember.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-pink-600 hover:text-white transition-all">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="p-1.5 rounded-full bg-gray-50 dark:bg-zinc-800/40 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"><InstagramIcon className="w-3.5 h-3.5" /></span>
              )}

              {selectedMember.socialMedia?.twitter && (
                <a href={selectedMember.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-sky-500 hover:text-white transition-all">
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
              )}

              {selectedMember.socialMedia?.github && (
                <a href={selectedMember.socialMedia.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all">
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Support via Volunteer QR Button */}
            <button
              onClick={() => {
                navigate(`/v/${selectedMember.volunteerCode || selectedMember._id}`);
                setSelectedMember(null);
              }}
              className="w-full mt-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Donate via {selectedMember.name.split(' ')[0]}'s QR</span>
            </button>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        {showJoinModal && (
          <JoinUsModal 
            isOpen={showJoinModal} 
            onClose={() => setShowJoinModal(false)} 
          />
        )}
      </Suspense>
    </section>
  );
};

export default TeamSection;
