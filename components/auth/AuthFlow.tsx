import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { MailIcon, LockClosedIcon, UserIcon, ArrowLeftIcon, SpinnerIcon, WrenchScrewdriverIcon } from '../common/icons';
import { TECHNICIAN_SKILLS_OPTIONS } from '../../shared/constants';

type AuthMode = 'login' | 'signup';
type UserRole = 'technician' | 'customer';

interface AuthFlowProps {
  userType: UserRole;
  onBack: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ userType, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const roleName = userType.charAt(0).toUpperCase() + userType.slice(1);

  const handleSkillsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSkills(selectedOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && userType === 'technician' && skills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: fullName,
            email: user.email,
            role: userType,
            avatarUrl: `https://picsum.photos/seed/${user.uid}/100/100`,
            skills: userType === 'technician' ? skills : null,
            createdAt: serverTimestamp()
          });
        } catch (dbError) {
          console.error("Error creating user document in AuthFlow.tsx: ", dbError);
          setError("Failed to save user profile. Please try again.");
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace('auth/', '').replace(/-/g, ' '));
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = () => {
    setMode(isLogin ? 'signup' : 'login');
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setSkills([]);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 relative animate-fade-in">
       <button 
        onClick={onBack} 
        className="absolute top-8 left-8 flex items-center font-semibold text-gray-600 hover:text-gray-900 transition-colors"
       >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Welcome
      </button>

      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${userType === 'technician' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {roleName} Portal
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-800">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-gray-500">{isLogin ? `Enter your credentials to access the ${roleName} dashboard.` : `Join us to get started.`}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="relative">
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {userType === 'technician' && (
                <div className="relative">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <label htmlFor="skills-select" className="sr-only">Select your skills</label>
                  <select
                    id="skills-select"
                    multiple
                    value={skills}
                    onChange={handleSkillsChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {TECHNICIAN_SKILLS_OPTIONS.map((skill: string) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 pl-1">Hold Ctrl/Cmd to select multiple skills.</p>
                </div>
              )}
            </>
          )}
          <div className="relative">
            <MailIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-lg capitalize">{error}</p>}
          
          {isLogin && <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 float-right">Forgot Password?</a>}
          
          <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-blue-400" disabled={loading}>
            {loading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={handleModeChange} className="ml-2 font-semibold text-blue-600 hover:text-blue-700">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
