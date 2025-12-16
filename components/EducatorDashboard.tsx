import React, { useState, useRef } from 'react';
import { User, Course, Role } from '../types';
import Button from './Button';
import Input from './Input';
import CourseBuilder from './CourseBuilder';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, BookOpen, Plus, LogOut, Search, Pencil, Download, Upload, Trash2, X, UserPlus } from 'lucide-react';

interface EducatorDashboardProps {
  users: User[];
  courses: Course[];
  onAddCourse: (courseData: Omit<Course, 'id'>) => void;
  onUpdateCourse: (course: Course) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
  onImportUsers: (users: User[]) => void;
  onLogout: () => void;
}

const EducatorDashboard: React.FC<EducatorDashboardProps> = ({ 
  users, 
  courses, 
  onAddCourse,
  onUpdateCourse,
  onAddUser,
  onUpdateUser,
  onRemoveUser,
  onImportUsers,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'compliance' | 'courses' | 'users'>('compliance');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // User Management State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserMode, setIsEditUserMode] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', id: '', pin: '', role: 'Nurse' as Role });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats Logic
  const nurses = users.filter(u => u.role === 'Nurse');
  const totalAssignments = nurses.length * courses.length;
  const totalCompletions = nurses.reduce((acc, user) => acc + user.completedCourses.length, 0);
  const completionRate = totalAssignments > 0 ? Math.round((totalCompletions / totalAssignments) * 100) : 0;

  const data = [
    { name: 'Completed', value: totalCompletions },
    { name: 'Pending', value: totalAssignments - totalCompletions },
  ];
  const COLORS = ['#10b981', '#cbd5e1']; // Green and Slate-300

  // Derive unique categories for the builder
  const availableCategories = Array.from(new Set(courses.map(c => c.category))).sort();

  // --- Course Handlers ---

  const handleSaveCourse = (courseData: Omit<Course, 'id'>) => {
    if (editingCourse) {
      onUpdateCourse({ ...courseData, id: editingCourse.id });
    } else {
      onAddCourse(courseData);
    }
    setIsBuilderOpen(false);
    setEditingCourse(null);
  };

  const handleCreateNew = () => {
    setEditingCourse(null);
    setIsBuilderOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsBuilderOpen(true);
  };

  // --- User Handlers ---

  const handleOpenAddUser = () => {
    setNewUser({ name: '', id: '', pin: '', role: 'Nurse' });
    setIsEditUserMode(false);
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setNewUser({
      name: user.name,
      id: user.id,
      pin: user.pin,
      role: user.role
    });
    setIsEditUserMode(true);
    setIsAddUserOpen(true);
  };

  const handleSaveUser = () => {
    if(!newUser.name || !newUser.id || !newUser.pin) return;
    
    if (isEditUserMode) {
      // Find original user to preserve XP, badges, etc.
      const originalUser = users.find(u => u.id === newUser.id);
      if (originalUser) {
        const updatedUser: User = {
          ...originalUser,
          name: newUser.name,
          pin: newUser.pin,
          role: newUser.role,
          // Update avatar if name changed, otherwise keep original
          avatar: originalUser.name !== newUser.name 
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`
            : originalUser.avatar
        };
        onUpdateUser(updatedUser);
      }
    } else {
      const user: User = {
        id: newUser.id,
        name: newUser.name,
        pin: newUser.pin,
        role: newUser.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`,
        xp: 0,
        streak: 0,
        badges: [],
        completedCourses: []
      };
      onAddUser(user);
    }
    
    setIsAddUserOpen(false);
    setNewUser({ name: '', id: '', pin: '', role: 'Nurse' });
    setIsEditUserMode(false);
  };

  const handleExportCSV = () => {
    const headers = ["id,name,pin,role,xp\n"];
    const rows = users.map(u => `${u.id},"${u.name}",${u.pin},${u.role},${u.xp}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mahsa_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const parsedUsers: User[] = [];

      // Skip header (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parse assuming no commas in values except name which might be quoted
        // A robust parser is recommended for production, but simple split works for basic needs
        const parts = line.split(',');
        // Handle basics: id,name,pin,role
        if (parts.length >= 4) {
           const id = parts[0].trim();
           // Remove quotes if present for name
           const name = parts[1].replace(/"/g, '').trim();
           const pin = parts[2].trim();
           const role = parts[3].trim() as Role;

           if(id && name && pin) {
             parsedUsers.push({
               id,
               name,
               pin,
               role: (role === 'Nurse' || role === 'Educator') ? role : 'Nurse',
               avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
               xp: 0,
               streak: 0,
               badges: [],
               completedCourses: []
             });
           }
        }
      }

      if (parsedUsers.length > 0) {
        onImportUsers(parsedUsers);
      } else {
        alert("No valid users found in CSV.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (isBuilderOpen) {
    return (
      <CourseBuilder 
        initialCourse={editingCourse || undefined}
        onSave={handleSaveCourse} 
        onCancel={() => { setIsBuilderOpen(false); setEditingCourse(null); }} 
        availableCategories={availableCategories}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-mahsa-navy">Educator Portal</h1>
          <p className="text-xs text-slate-500">MAHSA Admin</p>
        </div>
        <button onClick={onLogout} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('compliance')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'compliance' ? 'bg-white text-mahsa-navy shadow-sm' : 'text-slate-500'}`}
          >
            Compliance
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'courses' ? 'bg-white text-mahsa-navy shadow-sm' : 'text-slate-500'}`}
          >
            Courses
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${activeTab === 'users' ? 'bg-white text-mahsa-navy shadow-sm' : 'text-slate-500'}`}
          >
            Staff
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
        {activeTab === 'compliance' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Big Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-mahsa-teal">{completionRate}%</span>
                <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Completion Rate</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-mahsa-navy">{nurses.length}</span>
                <span className="text-xs text-slate-500 uppercase font-semibold mt-1">Total Staff</span>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col items-center">
               <h3 className="text-sm font-bold text-slate-700 w-full mb-2">Overall Compliance</h3>
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Completed</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Pending</div>
              </div>
            </div>

            {/* Staff List */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Staff Breakdown</h3>
              <div className="space-y-3">
                {nurses.map(nurse => {
                  const doneCount = nurse.completedCourses.length;
                  const total = courses.length;
                  const isAllDone = doneCount === total;
                  return (
                    <div key={nurse.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <img src={nurse.avatar} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                         <div>
                           <p className="text-sm font-bold text-slate-800">{nurse.name}</p>
                           <p className="text-xs text-slate-400">ID: {nurse.id}</p>
                         </div>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isAllDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                         {doneCount}/{total} Modules
                       </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             <Button fullWidth onClick={handleCreateNew} className="flex items-center justify-center gap-2 mb-4">
               <Plus size={20} /> Create New Course
             </Button>
             
             {courses.map(course => (
               <div 
                 key={course.id} 
                 onClick={() => handleEditCourse(course)}
                 className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
               >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800">{course.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{course.category} • {course.slides.length} slides</p>
                    </div>
                    <button className="text-slate-300 hover:text-mahsa-teal transition-colors">
                      <Pencil size={18}/>
                    </button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'users' && (
           <div className="space-y-4 animate-in fade-in duration-500">
             
             <div className="grid grid-cols-2 gap-3 mb-4">
                <Button onClick={handleOpenAddUser} className="flex items-center justify-center gap-2 text-sm">
                   <UserPlus size={18} /> Add User
                </Button>
                <div className="flex gap-2">
                   <button 
                     onClick={handleImportClick}
                     className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold hover:bg-slate-50"
                   >
                     <Upload size={16} /> Import
                   </button>
                   <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                   
                   <button 
                     onClick={handleExportCSV}
                     className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold hover:bg-slate-50"
                   >
                     <Download size={16} /> Export
                   </button>
                </div>
             </div>

             <div className="space-y-3">
               {users.map(u => (
                 <div key={u.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover"/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                           <span className="font-mono bg-slate-100 px-1 rounded">{u.id}</span>
                           <span>•</span>
                           <span className={u.role === 'Educator' ? 'text-purple-600 font-semibold' : ''}>{u.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEditUser(u)}
                        className="p-2 text-slate-300 hover:text-mahsa-teal hover:bg-cyan-50 rounded-full transition-colors"
                        title="Edit User"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => onRemoveUser(u.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                 </div>
               ))}
             </div>
             
             <div className="p-4 bg-blue-50 rounded-xl text-xs text-blue-700 leading-relaxed border border-blue-100">
               <p className="font-bold mb-1">CSV Format for Import:</p>
               <code className="block bg-white/50 p-2 rounded">id,name,pin,role</code>
               <p className="mt-2 opacity-80">Example: 99999,"John Doe",1234,Nurse</p>
             </div>
           </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {isAddUserOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-mahsa-navy">
                  {isEditUserMode ? 'Edit User' : 'Add New User'}
                </h3>
                <button onClick={() => setIsAddUserOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100">
                  <X size={20} className="text-slate-500"/>
                </button>
              </div>
              
              <div className="space-y-1">
                 <Input 
                   label="Staff ID" 
                   value={newUser.id} 
                   onChange={e => setNewUser({...newUser, id: e.target.value})} 
                   placeholder="e.g. 65432" 
                   disabled={isEditUserMode} // Disable ID editing
                 />
                 <Input 
                   label="Full Name" 
                   value={newUser.name} 
                   onChange={e => setNewUser({...newUser, name: e.target.value})} 
                   placeholder="e.g. Jane Doe" 
                 />
                 <Input 
                   label="PIN Code" 
                   value={newUser.pin} 
                   onChange={e => setNewUser({...newUser, pin: e.target.value})} 
                   maxLength={4} 
                   placeholder="4 Digits" 
                 />
                 
                 <div className="flex flex-col gap-1 mb-6">
                    <label className="text-sm font-medium text-slate-600 ml-1">Role</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setNewUser({...newUser, role: 'Nurse'})}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newUser.role === 'Nurse' ? 'bg-white shadow-sm text-mahsa-navy' : 'text-slate-400'}`}
                      >
                        Nurse
                      </button>
                      <button 
                        onClick={() => setNewUser({...newUser, role: 'Educator'})}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newUser.role === 'Educator' ? 'bg-white shadow-sm text-purple-700' : 'text-slate-400'}`}
                      >
                        Educator
                      </button>
                    </div>
                 </div>

                 <Button fullWidth onClick={handleSaveUser}>
                   {isEditUserMode ? 'Update User' : 'Create User'}
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EducatorDashboard;