import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import NurseDashboard from './components/NurseDashboard';
import EducatorDashboard from './components/EducatorDashboard';
import CoursePlayer from './components/CoursePlayer';
import { User, Course, AuthState, QuizAttempt } from './types';
import * as api from './services/api';

function App() {
  // --- App State with API Integration ---

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, currentUser: null });

  // UI State
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [changePinMode, setChangePinMode] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load Data from API on Mount ---

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        api.fetchUsers(),
        api.fetchCourses()
      ]);

      // Map MongoDB documents to frontend format
      const mappedUsers = usersData.map((u: any) => ({
        id: u.id,
        pin: u.pin,
        name: u.name,
        role: u.role,
        avatar: u.avatar || '',
        xp: u.xp || 0,
        streak: u.streak || 0,
        badges: u.badges || [],
        completedCourses: u.completedCourses || [],
        quizAttempts: u.quizAttempts || []
      }));

      const mappedCourses = coursesData.map((c: any) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        slides: c.slides || [],
        xpReward: c.xpReward || 0,
        durationMinutes: c.durationMinutes || 0,
        timestamp: c.timestamp || Date.now()
      }));

      setUsers(mappedUsers);
      setCourses(mappedCourses);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleLogin = (id: string, pin: string) => {
    const user = users.find(u => u.id === id && u.pin === pin);
    if (user) {
      setAuth({ isAuthenticated: true, currentUser: user });
      setLoginError(undefined);
    } else {
      setLoginError('Invalid Staff ID or PIN');
    }
  };

  const handleResetPin = async (id: string, newPin: string): Promise<boolean> => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      try {
        const updatedUser = { ...users[userIndex], pin: newPin };
        await api.updateUser(id, updatedUser);
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);
        return true;
      } catch (error) {
        console.error('Failed to reset PIN:', error);
        alert('Failed to reset PIN. Please try again.');
        return false;
      }
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, currentUser: null });
    setActiveCourse(null);
    setChangePinMode(false);
  };

  const handleChangePin = async () => {
    const newPin = prompt("Enter new 4-digit PIN:");
    if (newPin && newPin.length === 4 && !isNaN(Number(newPin)) && auth.currentUser) {
      try {
        const updatedUser = { ...auth.currentUser, pin: newPin };
        await api.updateUser(auth.currentUser.id, updatedUser);
        const updatedUsers = users.map(u =>
          u.id === auth.currentUser!.id ? updatedUser : u
        );
        setUsers(updatedUsers);
        setAuth(prev => ({ ...prev, currentUser: updatedUser }));
        alert("PIN updated successfully.");
      } catch (error) {
        console.error('Failed to update PIN:', error);
        alert('Failed to update PIN. Please try again.');
      }
    } else if (newPin) {
      alert("Invalid PIN format. Must be 4 digits.");
    }
  };

  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
  };

  // Triggered on every quiz answer attempt
  const handleQuizAttempt = async (courseId: string, slideId: string, question: string, answer: string, isCorrect: boolean) => {
    if (!auth.currentUser) return;

    const attempt: QuizAttempt = {
      courseId,
      slideId,
      question,
      selectedOption: answer,
      isCorrect,
      timestamp: Date.now()
    };

    const updatedUser = {
      ...auth.currentUser,
      quizAttempts: [...(auth.currentUser.quizAttempts || []), attempt]
    };

    try {
      await api.updateUser(auth.currentUser.id, updatedUser);
      const updatedUsers = users.map(u =>
        u.id === auth.currentUser?.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      setAuth(prev => ({ ...prev, currentUser: updatedUser }));
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
    }
  };

  const handleCompleteCourse = async (courseId: string, earnedXp: number) => {
    if (!auth.currentUser) return;

    // Prevent double reward
    if (auth.currentUser.completedCourses.includes(courseId)) {
      setActiveCourse(null);
      return;
    }

    // Find course to get max possible XP for badge calculation
    const course = courses.find(c => c.id === courseId);
    const maxPossibleXp = course ? course.slides.length * 50 : 0;
    const isPerfectScore = earnedXp === maxPossibleXp && maxPossibleXp > 0;

    const newXp = auth.currentUser.xp + earnedXp;
    const newCompleted = [...auth.currentUser.completedCourses, courseId];
    const newBadges = [...auth.currentUser.badges];

    // --- Simple Badge Logic ---
    if (newCompleted.length === 1 && !newBadges.includes('b1')) {
      newBadges.push('b1');
    }
    if (newXp >= 1000 && !newBadges.includes('b2')) {
      newBadges.push('b2');
    }
    if (isPerfectScore && !newBadges.includes('b4')) {
      newBadges.push('b4');
    }

    const updatedUser = {
      ...auth.currentUser,
      xp: newXp,
      badges: newBadges,
      completedCourses: newCompleted
    };

    try {
      await api.updateUser(auth.currentUser.id, updatedUser);
      const updatedUsers = users.map(u =>
        u.id === auth.currentUser!.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      setAuth({ isAuthenticated: true, currentUser: updatedUser });
    } catch (error) {
      console.error('Failed to save course completion:', error);
      alert('Failed to save progress. Please try again.');
    }

    setActiveCourse(null);
  };

  const handleAddCourse = async (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c${courses.length + 1}-${Date.now()}`,
      timestamp: Date.now()
    };
    try {
      await api.createCourse(newCourse);
      setCourses([...courses, newCourse]);
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      await api.updateCourse(updatedCourse.id, updatedCourse);
      setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  // --- User Management Handlers ---

  const handleAddUser = async (newUser: User) => {
    // Check for duplicate ID
    if (users.some(u => u.id === newUser.id)) {
      alert(`User with ID ${newUser.id} already exists.`);
      return;
    }
    try {
      await api.createUser(newUser);
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await api.updateUser(updatedUser.id, updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      // If we are updating the currently logged-in user, update auth state
      if (auth.currentUser?.id === updatedUser.id) {
        setAuth(prev => ({ ...prev, currentUser: updatedUser }));
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (userId === auth.currentUser?.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    if (confirm("Are you sure you want to remove this user? This cannot be undone.")) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleImportUsers = (importedUsers: User[]) => {
    const updatedUsers = [...users];

    importedUsers.forEach(imported => {
      const index = updatedUsers.findIndex(u => u.id === imported.id);
      if (index >= 0) {
        updatedUsers[index] = {
          ...updatedUsers[index],
          name: imported.name,
          pin: imported.pin,
          role: imported.role
        };
      } else {
        updatedUsers.push(imported);
      }
    });

    setUsers(updatedUsers);
    alert(`Successfully processed ${importedUsers.length} users.`);
  };

  // --- Render ---

  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center font-sans">
      {/* Mobile Simulator Container */}
      <div className="w-full max-w-[450px] h-[100dvh] sm:h-[850px] bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data from server...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main App */}
        {!loading && !error && (
          <>
            {!auth.isAuthenticated ? (
              <LoginScreen
                onLogin={handleLogin}
                onResetPin={handleResetPin}
                error={loginError}
              />
            ) : (
              <>
                {auth.currentUser?.role === 'Nurse' && (
                  <NurseDashboard
                    user={auth.currentUser}
                    allUsers={users}
                    courses={courses}
                    onStartCourse={handleStartCourse}
                    onLogout={handleLogout}
                    onChangePin={handleChangePin}
                  />
                )}

                {auth.currentUser?.role === 'Educator' && (
                  <EducatorDashboard
                    user={auth.currentUser}
                    users={users}
                    courses={courses}
                    onAddCourse={handleAddCourse}
                    onUpdateCourse={handleUpdateCourse}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onRemoveUser={handleRemoveUser}
                    onImportUsers={handleImportUsers}
                    onLogout={handleLogout}
                  />
                )}

                {/* Course Player Overlay */}
                {activeCourse && (
                  <CoursePlayer
                    course={activeCourse}
                    onClose={() => setActiveCourse(null)}
                    onComplete={handleCompleteCourse}
                    onQuizAttempt={handleQuizAttempt}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;