import React, { useState, useMemo } from 'react';
import { User, Course } from '../types';
import { Award, Flame, BookOpen, CheckCircle, Clock, Filter, ChevronDown, Trophy, Medal, Star, X, Info, RotateCcw, Crown } from 'lucide-react';
import { AVAILABLE_BADGES } from '../services/mockData';

interface NurseDashboardProps {
  user: User;
  allUsers: User[]; // Needed for leaderboard
  courses: Course[];
  onStartCourse: (course: Course) => void;
  onLogout: () => void;
  onChangePin: () => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ 
  user, 
  allUsers,
  courses, 
  onStartCourse, 
  onLogout,
  onChangePin
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showXpGuide, setShowXpGuide] = useState(false);

  // --- Gamification Logic ---
  
  // Calculate Level (Simple formula: 1 Level per 500 XP)
  const currentLevel = Math.floor(user.xp / 500) + 1;
  const nextLevelXp = currentLevel * 500;
  const prevLevelXp = (currentLevel - 1) * 500;
  const levelProgress = ((user.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map(c => c.category)));
    return ['All', ...uniqueCategories].sort();
  }, [courses]);

  const filteredCourses = courses.filter(course => 
    selectedCategory === 'All' || course.category === selectedCategory
  );

  // Leaderboard Logic
  const leaderboardData = useMemo(() => {
    return [...allUsers]
      .filter(u => u.role === 'Nurse')
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10); // Top 10
  }, [allUsers]);

  const userRank = leaderboardData.findIndex(u => u.id === user.id) + 1;

  // Render Leaderboard Modal
  const renderLeaderboard = () => (
    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
       <div className="bg-mahsa-navy p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative text-white">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-yellow-400 fill-yellow-400" /> Hall of Fame</h2>
             <button onClick={() => setShowLeaderboard(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
               <X size={20} />
             </button>
          </div>
          
          <div className="flex justify-center items-end gap-4 mb-4">
             {/* 2nd Place */}
             {leaderboardData[1] && (
               <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full border-4 border-slate-300 overflow-hidden mb-2 relative">
                   <img src={leaderboardData[1].avatar} alt="" className="w-full h-full object-cover"/>
                 </div>
                 <div className="bg-slate-300 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full -mt-5 z-10">2nd</div>
                 <p className="font-bold text-sm mt-1">{leaderboardData[1].name.split(' ')[0]}</p>
                 <p className="text-xs text-blue-200">{leaderboardData[1].xp} XP</p>
               </div>
             )}
             
             {/* 1st Place */}
             {leaderboardData[0] && (
               <div className="flex flex-col items-center -mt-6">
                 <div className="text-yellow-400 mb-1"><Flame fill="currentColor" size={24}/></div>
                 <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative shadow-lg shadow-yellow-500/20">
                   <img src={leaderboardData[0].avatar} alt="" className="w-full h-full object-cover"/>
                 </div>
                 <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full -mt-5 z-10">1st</div>
                 <p className="font-bold text-lg mt-1">{leaderboardData[0].name.split(' ')[0]}</p>
                 <p className="text-sm text-blue-200 font-bold">{leaderboardData[0].xp} XP</p>
               </div>
             )}

             {/* 3rd Place */}
             {leaderboardData[2] && (
               <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full border-4 border-orange-400 overflow-hidden mb-2 relative">
                   <img src={leaderboardData[2].avatar} alt="" className="w-full h-full object-cover"/>
                 </div>
                 <div className="bg-orange-400 text-orange-900 text-xs font-bold px-2 py-0.5 rounded-full -mt-5 z-10">3rd</div>
                 <p className="font-bold text-sm mt-1">{leaderboardData[2].name.split(' ')[0]}</p>
                 <p className="text-xs text-blue-200">{leaderboardData[2].xp} XP</p>
               </div>
             )}
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-6 -mt-4 z-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-1">
             {leaderboardData.slice(3).map((u, idx) => (
               <div key={u.id} className={`flex items-center p-3 rounded-xl ${u.id === user.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                  <span className="w-8 font-bold text-slate-400">{idx + 4}</span>
                  <img src={u.avatar} className="w-10 h-10 rounded-full bg-slate-200 object-cover mr-3" alt=""/>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${u.id === user.id ? 'text-mahsa-navy' : 'text-slate-700'}`}>
                      {u.name} {u.id === user.id && '(You)'}
                    </p>
                    <p className="text-xs text-slate-400">{Math.floor(u.xp / 500) + 1} Level Nurse</p>
                  </div>
                  <span className="font-bold text-mahsa-teal text-sm">{u.xp} XP</span>
               </div>
             ))}
          </div>

          <div className="mt-6 mb-8">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Medal size={18} className="text-mahsa-teal"/> Your Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_BADGES.map(badge => {
                const isUnlocked = user.badges.includes(badge.id);
                return (
                  <div key={badge.id} className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-60 grayscale'}`}>
                     <div className="text-2xl mb-2">{badge.icon}</div>
                     <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{badge.name}</p>
                     <p className="text-xs text-slate-500">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
       </div>
    </div>
  );

  const renderXpGuide = () => (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95">
          <button onClick={() => setShowXpGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
          
          <h3 className="text-xl font-bold text-mahsa-navy mb-4 flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" /> XP Guide
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><BookOpen size={20}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Training Modules</h4>
                <p className="text-xs text-slate-500 mt-1">Earn <span className="font-bold text-mahsa-teal">50 XP</span> per slide. Complete longer courses to earn more!</p>
              </div>
            </div>
            
             <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Flame size={20}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Level Up</h4>
                <p className="text-xs text-slate-500 mt-1">Every <span className="font-bold text-orange-500">500 XP</span> increases your Nurse Level.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <div className="bg-green-100 p-2 rounded-lg text-green-600"><Medal size={20}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Badges</h4>
                <p className="text-xs text-slate-500 mt-1">Unlock special badges by hitting milestones like 7-day streaks or 1000 XP.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button onClick={() => setShowXpGuide(false)} className="w-full py-3 bg-mahsa-navy text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20">Got it</button>
          </div>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {showLeaderboard && renderLeaderboard()}
      {showXpGuide && renderXpGuide()}

      {/* Header */}
      <div className="bg-mahsa-navy text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative z-10 transition-all">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-mahsa-teal object-cover" />
             <div>
               <p className="text-blue-200 text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
                 Level {currentLevel} Nurse
               </p>
               <h1 className="text-xl font-bold">{user.name}</h1>
             </div>
           </div>
           <button onClick={onLogout} className="text-blue-300 hover:text-white text-xs font-medium bg-blue-900/50 px-3 py-1 rounded-full">
             Log Out
           </button>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
           <div className="flex justify-between items-end text-xs text-blue-200 mb-1">
              <span className="font-bold text-white">{user.xp} XP</span>
              <button 
                onClick={() => setShowXpGuide(true)} 
                className="flex items-center gap-1 text-[10px] bg-blue-800/50 px-2 py-0.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Info size={10} /> How it works
              </button>
              <span className="opacity-70">Next: {nextLevelXp} XP</span>
           </div>
           <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-mahsa-teal to-cyan-300" style={{ width: `${levelProgress}%` }}></div>
           </div>
        </div>

        {/* Gamification Stats Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => setShowLeaderboard(true)}
            className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-400">
              <Trophy size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Rank #{userRank}</p>
              <p className="text-[10px] text-blue-200">Leaderboard</p>
            </div>
          </button>
          
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
             <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">{user.streak} Days</p>
              <p className="text-[10px] text-blue-200">Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 -mt-6 pb-6 overflow-y-auto z-20 no-scrollbar">
        <div className="flex flex-col gap-3 mb-4 mt-8">
           <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-800">My Training</h2>
             <button onClick={onChangePin} className="text-xs text-mahsa-teal font-semibold">Change PIN</button>
           </div>
           
           {/* Category Filter Dropdown */}
           <div className="relative w-full">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
               <Filter size={14} />
             </div>
             <select 
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
               className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-9 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mahsa-teal transition-shadow shadow-sm cursor-pointer"
             >
               {categories.map(cat => (
                 <option key={cat} value={cat}>{cat} {cat === 'All' ? `(${courses.length})` : ''}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
               <ChevronDown size={16} />
             </div>
           </div>
        </div>

        <div className="space-y-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const isCompleted = user.completedCourses.includes(course.id);
              // Check if course is "New" (created within last 7 days)
              const isNew = course.timestamp ? (Date.now() - course.timestamp) < (7 * 24 * 60 * 60 * 1000) : false;

              return (
                <div 
                  key={course.id}
                  onClick={() => onStartCourse(course)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden transition-transform active:scale-[0.98] cursor-pointer hover:shadow-md ${isCompleted ? 'bg-slate-50/50' : ''}`}
                >
                  {/* Status Indicator Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-green-500' : 'bg-mahsa-teal'}`} />
                  
                  {/* New Course Indicator */}
                  {isNew && !isCompleted && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 z-10 shadow-sm">
                      <Crown size={12} fill="currentColor" /> NEW
                    </div>
                  )}

                  <div className="flex justify-between items-start pl-3">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-100 px-2 py-0.5 rounded-md mb-2 inline-block">
                        {course.category}
                      </span>
                      <h3 className="font-bold text-slate-800 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                         <span className="flex items-center gap-1"><Clock size={12}/> {course.durationMinutes} min</span>
                         <span className="flex items-center gap-1 text-orange-500 font-medium"><Star size={12}/> {course.xpReward} XP</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {isCompleted ? (
                        <div className="flex flex-col items-center">
                           <CheckCircle className="text-green-500 mb-1" size={24} />
                           <span className="text-[10px] text-slate-400 font-semibold">Replay</span>
                        </div>
                      ) : (
                        <div className="bg-blue-50 text-mahsa-navy p-2 rounded-full mb-2 mt-2">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="mt-4 pl-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{isCompleted ? '100%' : '0%'}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-mahsa-teal w-1'}`} style={{ width: isCompleted ? '100%' : '2%' }} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-sm">No courses found in <span className="font-semibold text-slate-500">"{selectedCategory}"</span></p>
              <button 
                onClick={() => setSelectedCategory('All')} 
                className="mt-2 text-mahsa-teal text-xs font-semibold hover:underline"
              >
                View all courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;