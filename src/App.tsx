/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DigitalLibraryView } from './components/DigitalLibraryView';
import { HeaderNav, type AppPage } from './components/HeaderNav';
import { HomeAboutView } from './components/HomeAboutView';
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
import type { DatabaseResource } from './data/libraryMeta';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | undefined>(undefined);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('agriculture');
  const [activeDatabase, setActiveDatabase] = useState<DatabaseResource | null>(null);

  const handleNavigate = (page: AppPage, serviceId?: string) => {
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
        <ScrollProgressRule />

        <HeaderNav
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenJournals={() => handleOpenJournals(selectedFacultyId)}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: INSTITUTIONAL_EASE }}
            >
              {(activePage === 'home' || activePage === 'about') && (
                <HomeAboutView
                  mode={activePage}
                  onNavigate={handleNavigate}
                  onSelectFacultyJournals={(facId) => handleOpenJournals(facId)}
                  onSelectDatabase={(db) => setActiveDatabase(db)}
                />
              )}

              {activePage === 'digital-library' && (
                <DigitalLibraryView
                  selectedFacultyId={selectedFacultyId}
                  onChangeFacultyId={setSelectedFacultyId}
                  onSelectDatabase={(db) => setActiveDatabase(db)}
                  onContactLibrarian={() => handleNavigate('contact')}
                  onNavigateServices={() => handleNavigate('services')}
                />
              )}

              {activePage === 'services' && (
                <ServicesView
                  highlightedServiceId={highlightedServiceId}
                  onOpenDigitalLibrary={() => handleNavigate('digital-library')}
                  onOpenJournals={() => handleOpenJournals(selectedFacultyId)}
                />
              )}

              {activePage === 'news' && (
                <NewsEventsView onOpenJournals={() => handleOpenJournals(selectedFacultyId)} />
              )}

              {activePage === 'contact' && <ContactView />}
            </motion.div>
          </AnimatePresence>
        </main>

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
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-[#0B3B69] hover:underline cursor-pointer"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </footer>

        <DatabaseModal database={activeDatabase} onClose={() => setActiveDatabase(null)} />
      </div>
    </MotionConfig>
  );
}
