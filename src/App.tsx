/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DigitalLibraryView } from './components/DigitalLibraryView';
import { HeaderNav, type AppPage } from './components/HeaderNav';
import { HomeAboutView } from './components/HomeAboutView';
import { MemberDashboardView } from './components/MemberDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { FacultyLibraryView } from './components/FacultyLibraryView';
import { AuthModal } from './components/AuthModal';
import {
  INSTITUTIONAL_EASE,
  RevealOnScroll,
  ScrollProgressRule,
} from './components/MotionPrimitives';
import {
  ContactView,
  DatabaseModal,
  NewsEventsView,
  ServicesView,
} from './components/ServicesNewsContactViews';
import { NewspapersView } from './components/NewspapersView';
import type { DatabaseResource } from './data/libraryMeta';
import { api, type User } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | undefined>(undefined);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('agriculture');
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('agri');
  const [activeDatabase, setActiveDatabase] = useState<DatabaseResource | null>(null);

  // Authentication & Portal states
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.auth.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Verify token on mount
  useEffect(() => {
    api.auth
      .getStatus()
      .then((res) => {
        if (res.loggedIn && res.user) {
          setCurrentUser(res.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  }, []);

  const handleNavigate = (page: AppPage, serviceId?: string) => {
    // If navigating to member portal without login, show login modal
    if (page === 'member-portal' && !currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    // If navigating to admin portal without admin login, show login modal
    if (page === 'admin-portal' && (!currentUser || currentUser.role !== 'admin')) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    setActivePage(page);
    setHighlightedServiceId(serviceId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenJournals = (facultyId = 'agriculture') => {
    setSelectedFacultyId(facultyId);
    setActivePage('digital-library');
    window.setTimeout(() => {
      const el = document.getElementById('e-journals-directory');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  };

  const handleOpenFacultyLibrary = (libId = 'agri') => {
    setSelectedLibraryId(libId);
    setActivePage('faculty-library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSubmissionForm = () => {
    if (currentUser) {
      setActivePage('member-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen flex flex-col text-[#1C1917] ${
          activePage === 'member-portal' || activePage === 'admin-portal'
            ? 'bg-stone-100'
            : 'bg-[#FBF9F5]'
        }`}
      >
        <ScrollProgressRule />

        <HeaderNav
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenJournals={() => handleOpenJournals(selectedFacultyId)}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          onOpenSubmissionForm={handleOpenSubmissionForm}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {(activePage === 'home' || activePage === 'about') && (
                <HomeAboutView
                  mode={activePage}
                  onNavigate={handleNavigate}
                  onSelectFacultyJournals={(facId) => handleOpenJournals(facId)}
                  onSelectDatabase={(db) => setActiveDatabase(db)}
                  onOpenFacultyLibrary={handleOpenFacultyLibrary}
                />
              )}

              {activePage === 'faculty-library' && (
                <FacultyLibraryView
                  libraryId={selectedLibraryId}
                  onBack={() => {
                    handleNavigate('home');
                    window.setTimeout(() => {
                      const el = document.getElementById('our-libraries-heading');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  onOpenManuscriptSubmission={handleOpenSubmissionForm}
                  onContactLibrarian={() => handleNavigate('contact')}
                  onSelectOtherLibrary={(otherLibId) => {
                    setSelectedLibraryId(otherLibId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {activePage === 'digital-library' && (
                <DigitalLibraryView
                  selectedFacultyId={selectedFacultyId}
                  onChangeFacultyId={setSelectedFacultyId}
                  onSelectDatabase={(db) => setActiveDatabase(db)}
                  onContactLibrarian={() => handleNavigate('contact')}
                  onNavigateServices={() => handleNavigate('services')}
                  onNavigateNewspapers={() => handleNavigate('newspapers')}
                />
              )}

              {activePage === 'services' && (
                <ServicesView
                  highlightedServiceId={highlightedServiceId}
                  onOpenDigitalLibrary={() => handleNavigate('digital-library')}
                  onOpenJournals={() => handleOpenJournals(selectedFacultyId)}
                />
              )}

              {activePage === 'newspapers' && (
                <NewspapersView
                  onNavigateHome={() => handleNavigate('home')}
                  onNavigateDigitalLibrary={() => handleNavigate('digital-library')}
                />
              )}

              {activePage === 'news' && (
                <NewsEventsView onOpenJournals={() => handleOpenJournals(selectedFacultyId)} />
              )}

              {activePage === 'contact' && <ContactView />}

              {activePage === 'member-portal' && currentUser && (
                <MemberDashboardView
                  user={currentUser}
                  onLogout={handleLogout}
                  onNavigateHome={() => handleNavigate('home')}
                />
              )}

              {activePage === 'admin-portal' && currentUser?.role === 'admin' && (
                <AdminDashboardView
                  user={currentUser}
                  onLogout={handleLogout}
                  onNavigateHome={() => handleNavigate('home')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {activePage !== 'admin-portal' && activePage !== 'member-portal' && (
        <footer className="mt-12 border-t border-stone-200 bg-white">
          <RevealOnScroll yOffset={14}>
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600">
              <div className="space-y-1">
                <p className="font-serif text-sm font-semibold text-[#14452F]">
                  Niger Delta University Library
                </p>
                <p>
                  Wilberforce Island · P.M.B. 071, Yenagoa, Bayelsa State, Nigeria · Open Mon – Fri,
                  8:00am – 4:00pm
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => handleNavigate('about')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  About Library
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('services')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  Our Services
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('digital-library')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  Digital Library
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('news')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  News
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  Contact Us
                </button>

                <span className="text-stone-300">|</span>

                <button
                  type="button"
                  onClick={() => handleNavigate('member-portal')}
                  className="font-medium text-[#14452F] hover:underline cursor-pointer"
                >
                  Researcher Portal
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate('admin-portal')}
                  className="font-medium text-[#0B3B69] hover:underline cursor-pointer"
                >
                  Admin Console
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </footer>
        )}

        <DatabaseModal database={activeDatabase} onClose={() => setActiveDatabase(null)} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin') {
              handleNavigate('admin-portal');
            } else {
              handleNavigate('member-portal');
            }
          }}
        />
      </div>
    </MotionConfig>
  );
}
