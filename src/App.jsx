import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, Search, Bookmark, CheckSquare, Star, Plus, Film, Tv, 
  PlayCircle, X, ListVideo, Clock, Calendar, MoreVertical, KeyRound, AlertCircle,
  TrendingUp, Info, Zap, Sparkles, Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INIT ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- TMDB CONFIGURATION ---
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// --- EXPANDED VISUAL DATABASE ---
const MOCK_DB = [
  // MOVIES
  { id: 'm1', title: 'Dune: Part Two', type: 'Movie', year: '2024', genre: 'Sci-Fi', posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8lS80qr9R979Gp9uVqS3nYK.jpg', color: 'from-orange-600 to-amber-900' },
  { id: 'm2', title: 'Oppenheimer', type: 'Movie', year: '2023', genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv2mYqlUjXwDmsvdbmsgU1otX.jpg', color: 'from-gray-700 to-gray-900' },
  { id: 'm3', title: 'Spider-Man: Across the Spider-Verse', type: 'Movie', year: '2023', genre: 'Action', posterUrl: 'https://image.tmdb.org/t/p/w500/8VtB9m9c3v91o6ilDBY49VjP9vP.jpg', color: 'from-pink-600 to-indigo-900' },
  { id: 'm4', title: 'The Batman', type: 'Movie', year: '2022', genre: 'Crime', posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onDB.jpg', color: 'from-red-900 to-black' },
  { id: 'm5', title: 'Interstellar', type: 'Movie', year: '2014', genre: 'Sci-Fi', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlSabaC.jpg', color: 'from-blue-900 to-black' },
  { id: 'm6', title: 'The Dark Knight', type: 'Movie', year: '2008', genre: 'Action', posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDp9QmSbmM9zLqsybZf.jpg', color: 'from-zinc-700 to-zinc-900' },
  
  // TV SERIES
  { id: 't1', title: 'Succession', type: 'TV Series', year: '2023', genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/7YpS9mUThJpG9up3zD06uS97P9l.jpg', color: 'from-slate-600 to-slate-800' },
  { id: 't2', title: 'The Last of Us', type: 'TV Series', year: '2023', genre: 'Action', posterUrl: 'https://image.tmdb.org/t/p/w500/u3YvT2tZdzRJyvU6pYv9P9vP.jpg', color: 'from-stone-700 to-stone-900' },
  { id: 't3', title: 'The Bear', type: 'TV Series', year: '2022', genre: 'Drama', posterUrl: 'https://image.tmdb.org/t/p/w500/3of76u1UuJpG9uO8zD06uS97P9l.jpg', color: 'from-blue-800 to-zinc-900' },
  { id: 't4', title: 'Stranger Things', type: 'TV Series', year: '2022', genre: 'Sci-Fi', posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfev0moxmBEEp792YCYrj91O.jpg', color: 'from-red-700 to-purple-950' },
  { id: 't5', title: 'Shogun', type: 'TV Series', year: '2024', genre: 'History', posterUrl: 'https://image.tmdb.org/t/p/w500/7O4jANBTV9DCD3T7uU0v6uS97P9l.jpg', color: 'from-red-800 to-black' },
  
  // ANIME
  { id: 'a1', title: 'Attack on Titan', type: 'Anime', year: '2023', genre: 'Action', posterUrl: 'https://image.tmdb.org/t/p/w500/hEkaB4CdbnBsHX5oY9vP9vP.jpg', color: 'from-red-800 to-stone-900' },
  { id: 'a2', title: 'Jujutsu Kaisen', type: 'Anime', year: '2023', genre: 'Fantasy', posterUrl: 'https://image.tmdb.org/t/p/w500/hEkaB4CdbnBsHX5oY9vP9vP.jpg', color: 'from-indigo-800 to-black' },
  { id: 'a3', title: 'Demon Slayer', type: 'Anime', year: '2024', genre: 'Action', posterUrl: 'https://image.tmdb.org/t/p/w500/n79p6Eg9vP9vP.jpg', color: 'from-pink-700 to-teal-900' },
  { id: 'a4', title: 'Spy x Family', type: 'Anime', year: '2022', genre: 'Comedy', posterUrl: 'https://image.tmdb.org/t/p/w500/oEkaB4CdbnBsHX5oY9vP9vP.jpg', color: 'from-emerald-500 to-rose-400' },
  { id: 'a5', title: 'Your Name', type: 'Anime', year: '2016', genre: 'Romance', posterUrl: 'https://image.tmdb.org/t/p/w500/q79p6Eg9vP9vP.jpg', color: 'from-blue-400 to-indigo-600' },
  
  // KDRAMA
  { id: 'k1', title: 'Squid Game', type: 'KDrama', year: '2021', genre: 'Thriller', posterUrl: 'https://image.tmdb.org/t/p/w500/d9vP9vP.jpg', color: 'from-emerald-700 to-rose-900' },
  { id: 'k2', title: 'All of Us Are Dead', type: 'KDrama', year: '2022', genre: 'Horror', posterUrl: 'https://image.tmdb.org/t/p/w500/fEkaB4CdbnBsHX5oY9vP9vP.jpg', color: 'from-red-900 to-black' },
];

// --- COMPONENTS ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none backdrop-blur-md";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", icon: "p-2" };
  const variants = {
    primary: "bg-indigo-600/90 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]",
    secondary: "bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700/50",
    success: "bg-emerald-600/90 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    danger: "bg-rose-600/90 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50"
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const PosterCard = ({ item, actionIcon, onActionClick, secondaryAction, onSecondaryClick, statusInfo }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl transition-all duration-300">
      <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-all duration-500 group-hover:-translate-y-2 bg-gradient-to-br ${item.color || 'from-zinc-800 to-black'}`}>
        {item.posterUrl ? (
          <>
            {!imgLoaded && (
               <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 animate-pulse">
                 <ImageIcon size={24} className="text-zinc-700" />
               </div>
            )}
            <img 
              src={item.posterUrl} 
              alt={item.title} 
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110 group-hover:blur-[2px]`} 
              loading="lazy"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster'; }}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md z-10 mb-1">{item.title}</h3>
            {item.genre && <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium z-10">{item.genre}</span>}
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-[2px]">
          {actionIcon && (
            <Button variant="primary" onClick={() => onActionClick(item)} className="w-[85%] shadow-xl translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
              {actionIcon}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="success" onClick={() => onSecondaryClick(item)} className="w-[85%] shadow-xl translate-y-6 group-hover:translate-y-0 transition-transform duration-300 delay-75">
              {secondaryAction}
            </Button>
          )}
        </div>

        {/* Status Badge */}
        {statusInfo && (
          <div className="absolute top-2 right-2 z-30 drop-shadow-lg">
            {statusInfo}
          </div>
        )}
        
        {/* Genre Tag on Card Bottom (Visible always on desktop group) */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.genre || 'Media'}
          </span>
        </div>
      </div>

      <div className="px-1">
        <h4 className="text-zinc-100 font-bold text-sm truncate tracking-wide" title={item.title}>{item.title}</h4>
        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
          <span>{item.year}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span className="truncate">{item.type}</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [user, setUser] = useState(null);
  const [userLibrary, setUserLibrary] = useState([]);
  const [discoverResults, setDiscoverResults] = useState(MOCK_DB);
  const [isSearching, setIsSearching] = useState(false);
  
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [itemToLog, setItemToLog] = useState(null);

  const filters = ['All', 'Movie', 'TV Series', 'Anime', 'KDrama'];

  // --- FIREBASE INITIALIZATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING (FIRESTORE) ---
  useEffect(() => {
    if (!user) return;
    const libraryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'library');
    const unsubscribe = onSnapshot(libraryRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserLibrary(data);
    }, (err) => { console.error(err); });
    return () => unsubscribe();
  }, [user]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setDiscoverResults(MOCK_DB);
        return;
      }

      if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        const localResults = MOCK_DB.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setDiscoverResults(localResults);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.results) {
          setDiscoverResults(data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .map(item => ({
              id: String(item.id),
              title: item.title || item.name,
              type: item.media_type === 'tv' ? 'TV Series' : 'Movie',
              year: (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A',
              posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
              color: 'from-zinc-800 to-zinc-950'
            })));
        }
      } catch (err) { console.error(err); } finally { setIsSearching(false); }
    };

    const delayDebounceFn = setTimeout(() => performSearch(), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleAddToWatchlist = async (item) => {
    if (!user) return;
    const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'library', String(item.id));
    await setDoc(itemRef, { ...item, status: 'watchlist', dateAdded: new Date().toISOString() });
  };

  const handleOpenLogModal = (item) => {
    const existing = userLibrary.find(p => p.id === String(item.id));
    setItemToLog(existing || item);
    setLogModalOpen(true);
  };

  const handleSaveLog = async (loggedItem) => {
    if (!user) return;
    const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'library', String(loggedItem.id));
    await setDoc(itemRef, { ...loggedItem, status: 'watched', dateAdded: new Date().toISOString() });
  };

  const handleRemoveFromLibrary = async (itemId) => {
    if (!user) return;
    const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'library', String(itemId));
    await deleteDoc(itemRef);
  };

  const watchlistedItems = useMemo(() => userLibrary.filter(item => item.status === 'watchlist'), [userLibrary]);
  const watchedItems = useMemo(() => userLibrary.filter(item => item.status === 'watched'), [userLibrary]);
  const filteredDiscoverDB = useMemo(() => discoverResults.filter(item => activeFilter === 'All' || item.type === activeFilter), [discoverResults, activeFilter]);

  // --- RENDER HELPERS ---
  const renderDiscover = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black text-white tracking-tighter">Discover</h1>
            <Sparkles className="text-indigo-400 animate-pulse" size={32} />
          </div>
          <p className="text-zinc-400 text-lg font-medium">Millions of stories. Find yours today.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search titles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-2xl"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sticky top-4 z-30 py-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              activeFilter === filter 
                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-indigo-400/30' 
                : 'bg-zinc-900/80 text-zinc-500 hover:text-zinc-200 border border-zinc-800/50 hover:bg-zinc-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isSearching ? (
        <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredDiscoverDB.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredDiscoverDB.map((item, idx) => {
            const inLibrary = userLibrary.find(u => String(u.id) === String(item.id));
            return (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                <PosterCard 
                  item={item}
                  actionIcon={
                    <span className="flex items-center gap-2">
                      {inLibrary?.status === 'watchlist' ? <CheckSquare size={16}/> : <Bookmark size={16} />} 
                      {inLibrary?.status === 'watchlist' ? 'Tracked' : 'Watchlist'}
                    </span>
                  }
                  onActionClick={handleAddToWatchlist}
                  secondaryAction={
                    <span className="flex items-center gap-2">
                      {inLibrary?.status === 'watched' ? <Star size={16} className="fill-current text-amber-400"/> : <Plus size={16} />}
                      {inLibrary?.status === 'watched' ? 'Edit Log' : 'Log Movie'}
                    </span>
                  }
                  onSecondaryClick={handleOpenLogModal}
                  statusInfo={
                    inLibrary?.status === 'watched' ? (
                      <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-xl"><CheckSquare size={16} /></div>
                    ) : inLibrary?.status === 'watchlist' ? (
                      <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-xl"><Bookmark size={16} className="fill-current" /></div>
                    ) : null
                  }
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-40 text-center"><p className="text-zinc-600">No matches found for your search.</p></div>
      )}

      {/* API Key CTA (Bottom) */}
      {TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE' && (
        <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><KeyRound size={20}/> Need More Results?</h3>
            <p className="text-zinc-400 text-sm mt-1">Add a TMDB API Key to unlock millions of titles from the live web.</p>
          </div>
          <Button variant="secondary" onClick={() => window.open('https://www.themoviedb.org/settings/api', '_blank')}>Get Free Key</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Shared with previous versions */}
      <div className="flex pb-24 md:pb-0">
        <aside className="hidden md:flex flex-col w-72 fixed h-screen border-r border-zinc-900 bg-black/40 backdrop-blur-3xl z-40">
          <div className="p-10 flex items-center gap-3 text-white font-black text-3xl tracking-tighter italic">
            <Film size={32} className="text-indigo-500 drop-shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
            TrackIt
          </div>
          <nav className="flex-1 px-6 space-y-2 mt-6">
            <NavItem icon={<Home />} label="Discover" isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
            <NavItem icon={<Bookmark />} label="Watchlist" isActive={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} badge={watchlistedItems.length} />
            <NavItem icon={<CheckSquare />} label="Diary" isActive={activeTab === 'diary'} onClick={() => setActiveTab('diary')} badge={watchedItems.length} />
          </nav>
          <div className="p-8">
            <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Community</p>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[8px]">U{i}</div>)}
                <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-indigo-600 flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 md:ml-72 p-6 md:p-12 lg:p-16 max-w-[1800px] mx-auto w-full">
          {activeTab === 'discover' && renderDiscover()}
          {activeTab === 'watchlist' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h1 className="text-5xl font-black text-white tracking-tighter mb-10">Watchlist</h1>
               {watchlistedItems.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {watchlistedItems.map(item => <PosterCard key={item.id} item={item} actionIcon={<span className="flex items-center gap-2"><CheckSquare size={16} /> Mark Watched</span>} onActionClick={handleOpenLogModal} secondaryAction={<span className="flex items-center gap-2 text-rose-300"><X size={16} /> Drop</span>} onSecondaryClick={(i) => handleRemoveFromLibrary(i.id)} />)}
                 </div>
               ) : <div className="py-40 text-center text-zinc-600">Your queue is currently empty.</div>}
             </div>
          )}
          {activeTab === 'diary' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h1 className="text-5xl font-black text-white tracking-tighter mb-10">Diary</h1>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {watchedItems.map(item => (
                    <div key={item.id} className="flex gap-6 bg-zinc-900/30 p-5 rounded-3xl border border-zinc-800/50 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                      <div className="w-28 shrink-0 aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden relative">
                        <img src={item.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 py-2">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-white truncate">{item.title}</h3>
                           <div className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-amber-400/20">
                             <Star size={12} className="fill-current" /> {item.rating}
                           </div>
                        </div>
                        <p className="text-zinc-500 text-xs mb-4 flex items-center gap-2"><Calendar size={12}/> Logged on {new Date(item.dateAdded).toLocaleDateString()}</p>
                        <p className="text-zinc-400 text-sm italic leading-relaxed line-clamp-3">"{item.review || 'No review written for this title.'}"</p>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
        </main>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-900 flex justify-around p-3 z-50">
        <MobileNavItem icon={<Home size={22} />} isActive={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
        <MobileNavItem icon={<Bookmark size={22} />} isActive={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} />
        <MobileNavItem icon={<CheckSquare size={22} />} isActive={activeTab === 'diary'} onClick={() => setActiveTab('diary')} />
      </div>

      {/* Shared Modals */}
      <div className="fixed bottom-10 right-10 z-50 hidden md:block">
         <div className="bg-indigo-600 p-4 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.6)] cursor-pointer hover:scale-110 transition-transform">
           <Zap className="text-white" size={24} />
         </div>
      </div>
      
      {/* Log Modal (Existing) */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all duration-500 ${logModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {itemToLog && (
           <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-lg p-10 relative shadow-2xl">
              <div className="flex gap-8">
                 <div className="w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shrink-0">
                    <img src={itemToLog.posterUrl} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="flex-1">
                    <h2 className="text-3xl font-black text-white leading-tight mb-2">{itemToLog.title}</h2>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{itemToLog.type} • {itemToLog.year}</p>
                 </div>
              </div>
              <div className="mt-10 space-y-8">
                 <div>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Rating</p>
                    <div className="flex gap-2">
                       {[1,2,3,4,5].map(i => (
                         <button key={i} onClick={() => setItemToLog({...itemToLog, rating: i})} className="transition-transform active:scale-90">
                           <Star size={36} className={`${i <= (itemToLog.rating || 0) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-zinc-800'}`} />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Notes</p>
                    <textarea 
                      value={itemToLog.review || ''} 
                      onChange={(e) => setItemToLog({...itemToLog, review: e.target.value})}
                      placeholder="Add your thoughts..." 
                      className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                    />
                 </div>
              </div>
              <div className="mt-10 flex gap-4">
                 <Button className="flex-1 rounded-2xl py-4" onClick={() => { handleSaveLog(itemToLog); setLogModalOpen(false); }}>Save Entry</Button>
                 <Button variant="ghost" className="flex-1" onClick={() => setLogModalOpen(false)}>Discard</Button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600 shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] text-white' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'}`}>
      <span className={`${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`}>{React.cloneElement(icon, { size: 20 })}</span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
      {badge !== undefined && badge > 0 && <span className={`ml-auto text-[10px] py-1 px-2.5 rounded-lg font-black ${isActive ? 'bg-indigo-400 text-white' : 'bg-zinc-800 text-zinc-400'}`}>{badge}</span>}
    </button>
  );
}

function MobileNavItem({ icon, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`p-4 transition-all ${isActive ? 'text-indigo-400 scale-110' : 'text-zinc-600'}`}>
      {icon}
    </button>
  );
}