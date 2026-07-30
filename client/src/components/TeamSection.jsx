import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const JoinUsModal = lazy(() => import('./modals/JoinUsModal'));

const defaultTeam = [
  { name: 'Priscilla Sekar', designation: 'Founder & Director', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600' },
  { name: 'Karan Mehta', designation: 'Program Lead', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600' },
  { name: 'Priya Nair', designation: 'Outreach Manager', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600' },
  { name: 'Rohan Kumar', designation: 'Field Coordinator', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600' },
];

const TeamSection = ({ limit = 10 }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
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
      const response = await axiosInstance.get(`/volunteers?page=${pageNum}&limit=${limit}`);
      const { volunteers, totalPages } = response.data;
      
      if (volunteers && volunteers.length > 0) {
        setTeamMembers(prev => pageNum === 1 ? volunteers : [...prev, ...volunteers]);
        setHasMore(pageNum < totalPages);
      } else {
        setTeamMembers(defaultTeam);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch team members', error);
      setTeamMembers(defaultTeam);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam(page);
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

  const isLeader = (member) => {
    if (member.isTeamLeader || member.isLeader) return true;
    const roleStr = `${member.role || ''} ${member.designation || ''}`.toLowerCase();
    return (
      roleStr.includes('founder') ||
      roleStr.includes('director') ||
      roleStr.includes('leader') ||
      roleStr.includes('president') ||
      roleStr.includes('head') ||
      roleStr.includes('lead') ||
      roleStr.includes('chief')
    );
  };

  const rawMembers = teamMembers.length > 0 ? teamMembers : defaultTeam;

  // Sort team leaders ahead with highest priority
  const displayMembers = [...rawMembers].sort((a, b) => {
    const aLeader = isLeader(a);
    const bLeader = isLeader(b);
    if (aLeader && !bLeader) return -1;
    if (!aLeader && bLeader) return 1;
    return 0;
  });

  return (
    <section id="team" className="py-4 md:py-6 bg-white dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-6 sm:mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
            Our People
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Meet our dedicated team
          </h2>
        </div>

        {/* Carousel Container with Floating Arrows on Image */}
        <div className="relative group">

          {/* Left Arrow (Visible only if can scroll left) */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-lg backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer border border-gray-200/60 dark:border-zinc-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow (Visible only if can scroll right) */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              aria-label="Scroll right"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white shadow-lg backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer border border-gray-200/60 dark:border-zinc-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Horizontal Scroll Container across all device sizes */}
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {displayMembers.map((member, index) => {
              const imgSrc = member.image?.startsWith('http') 
                ? getOptimizedImageUrl(member.image, { width: 300, height: 300 })
                : member.image || defaultTeam[index % defaultTeam.length].image;
              const leader = isLeader(member);

              return (
                <div 
                  key={`${member._id || index}-${index}`} 
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all group shrink-0 w-44 sm:w-52 snap-start flex flex-col ${
                    leader ? 'border-amber-400/80 dark:border-amber-500/50 shadow-amber-500/5' : 'border-gray-200/70 dark:border-zinc-800'
                  }`}
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                    <img 
                      src={imgSrc} 
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {leader && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-zinc-950 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                        Team Lead
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors truncate">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                      {member.designation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Action Buttons: Show More & Join Our Team */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-6 py-3 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer group"
          >
            <span>Join Our Team</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Highlighted Scholar Disclaimer */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 dark:from-amber-400/10 dark:to-amber-400/10 border border-amber-300/60 dark:border-amber-700/50 px-5 py-2.5 rounded-full text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>This foundation is led by young scholars from college.</span>
          </div>
        </div>

      </div>

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


