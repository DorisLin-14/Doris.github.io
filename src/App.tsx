import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cat, 
  ChevronDown, 
  Home, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Instagram, 
  Twitter, 
  Mail, 
  Palette,
  ShoppingBag,
  Heart
} from 'lucide-react';

// --- Types ---
type View = 'home' | 'content' | 'works' | 'products';

// --- Custom Cursor ---
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Determine cursor image
  let cursorImg = '/assets/cat-paw-64.png';
  if (isClicking) cursorImg = '/assets/cat-pressed-64.png';
  else if (isHovering) cursorImg = '/assets/cat-link-64.png';

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      animate={{ x: position.x - 32, y: position.y - 32 }}
      transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.1 }}
    >
      <img src={cursorImg} className="w-16 h-16" alt="cat-cursor" />
    </motion.div>
  );
};

const ScrollParticles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.4
          }}
        />
      ))}
    </div>
  );
};

// --- Common Components ---
const CatButton = ({ children, onClick, className = "" }: { children: ReactNode, onClick?: () => void, className?: string }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`bg-white/80 backdrop-blur shadow-sm px-6 py-3 rounded-full flex items-center gap-2 font-semibold border border-cat-orange/20 hover:border-cat-orange text-cat-deep transition-all duration-300 ${className}`}
  >
    <Cat size={20} className="text-cat-orange shrink-0" />
    {children}
  </motion.button>
);

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [text]);

  return <p className="leading-relaxed text-cat-deep/80 whitespace-pre-line">{displayText}</p>;
};

// --- Page Views ---
export default function App() {
  const [view, setView] = useState<View>('home');
  const [isScrollLocked, setIsScrollLocked] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [returnAnchor, setReturnAnchor] = useState<string | null>(null);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start from top on refresh
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (isScrollLocked && view === 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isScrollLocked, view]);

  useEffect(() => {
    if (view === 'content' && returnAnchor) {
      const timer = setTimeout(() => {
        const refs: Record<string, any> = {
          'resume': resumeRef,
          'works': worksRef,
          'products': productsRef
        };
        const target = refs[returnAnchor]?.current;
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setReturnAnchor(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [view, returnAnchor]);

  const handleStartBrowsing = () => {
    setIsScrollLocked(false);
    setView('content');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateTo = (newView: View, anchor: string) => {
    setReturnAnchor(anchor);
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToHub = () => {
    setView('content');
    // returnAnchor is already set in navigateTo usually, or we can just go to resume
  };

  const scrollToTop = () => {
    if (view === 'content') {
      resumeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen relative font-sans ${isScrollLocked ? 'h-screen' : ''}`}>
      <CustomCursor />
      
      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImg(null)}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 cursor-pointer"
          >
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={zoomImg} 
              className="max-w-full max-h-full rounded-2xl shadow-2xl" 
            />
            <button className="absolute top-10 right-10 text-white hover:text-cat-orange">
              <X size={40} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            {/* Hero Section */}
            <section className="h-screen w-full flex flex-col items-center justify-center p-6 aurora-bg relative overflow-hidden shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -60, 0], 
                    x: [0, i % 2 === 0 ? 40 : -40, 0],
                    rotate: [0, 15, -15, 0] 
                  }}
                  transition={{ 
                    duration: 12 + i * 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute opacity-15 pointer-events-none"
                  style={{ 
                    top: `${10 + (i-1) * 25}%`, 
                    left: `${(i * 20) % 80 + 10}%` 
                  }}
                >
                  <Cat size={140 + i * 20} strokeWidth={0.5} />
                </motion.div>
              ))}

              <div className="z-10 text-center space-y-6">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <h1 className="text-4xl md:text-7xl font-bold text-cat-deep tracking-tight mb-4">
                    Welcome To My Cat Bar
                  </h1>
                  <p className="text-xl md:text-2xl text-cat-deep/60 font-medium">
                    化想像為現實的貓咪創意空間
                  </p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <CatButton onClick={handleStartBrowsing} className="mx-auto mt-12 bg-white/50 py-4 px-10 shadow-lg">
                    開始瀏覽
                    <ChevronDown size={20} className="animate-bounce" />
                  </CatButton>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}

        {view === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            {/* Content Sections */}
            <div ref={contentRef} className="max-w-6xl mx-auto w-full px-6 py-24 space-y-48 relative min-h-screen">
              <ScrollParticles />
              
              {/* Row 1: Intro/Resume */}
              <motion.div 
                ref={resumeRef}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-2 gap-16 items-center"
              >
                <div className="perspective-2000">
                  <motion.div
                    animate={{ rotateY: isExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative w-full aspect-square md:aspect-auto md:h-[550px] rounded-[40px] overflow-hidden shadow-2xl glass-card"
                  >
                    <div className="absolute inset-0 bg-cat-pink flex flex-col items-center justify-center p-12 backface-hidden">
                        <div className="w-full h-full p-4">
                           <img src="/assets/sticker_2.png" className="w-full h-full object-contain" alt="profile front" />
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-cat-orange/90 flex flex-col items-center justify-center p-12 backface-hidden rotate-y-180">
                      <div className="text-white text-center space-y-6">
                        <h3 className="text-5xl font-black tracking-tight">林詩芸</h3>
                        <div className="w-16 h-1.5 bg-white/40 mx-auto rounded-full"></div>
                        <p className="text-2xl text-white/90 font-bold uppercase tracking-widest">Lin, Shih-Yun</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="space-y-8 glass-card p-10 rounded-[40px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-cat-orange/20 rounded-xl flex items-center justify-center text-cat-orange">
                          <Palette size={20} />
                       </div>
                       <h2 className="text-3xl font-black tracking-tight text-cat-deep">
                         {isExpanded ? "林詩芸 | Lin, Shih-Yun" : "簡介"}
                       </h2>
                    </div>
                    <p className="text-xl leading-relaxed text-cat-deep/80">
                      希望能運用AI、生活中熱愛的興趣、喜歡的事物來化想像為現實。
                    </p>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-6 pt-6 border-t border-cat-orange/20"
                      >
                        <ResumeSection title="初衷" content="在科技快速發展的時代，AI的趨勢將會加速各工作效率，不熟悉的領域也可利用AI工具輔助。我希望能做到自產自銷，實現居家辦公和時間自由運用的生活。" />
                        <ResumeSection title="學歷" content="銘傳大學 數位媒體設計學系" />
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-cat-orange/80">技能</h4>
                          <div className="flex flex-wrap gap-2">
                             {['平面設計', '平面插圖', '網頁設計', '遊戲設計', '文字處理', '簡報排版設計', '影片剪輯'].map(skill => (
                               <span key={skill} className="px-3 py-1 bg-white/60 rounded-lg text-sm font-bold shadow-sm border border-cat-orange/10">{skill}</span>
                             ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-cat-orange/80">專案</h4>
                          <a href="https://my.spline.design/13main-fa30bfc259ec4d63d4cc8fd0c1acd120/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cat-deep/90 font-bold underline decoration-cat-orange hover:text-cat-orange transition-colors">
                            逛喫遊馬 3D互動地圖網頁 <ExternalLink size={14} />
                          </a>
                        </div>
                        
                        <div className="space-y-3">
                           <h4 className="text-sm font-bold uppercase tracking-widest text-cat-orange/80">證明</h4>
                           <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                              <motion.img 
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setZoomImg('/assets/TabeUma.jpg')}
                                src="/assets/TabeUma.jpg" 
                                className="h-20 w-20 object-cover rounded-xl shadow-md border-2 border-white cursor-zoom-in" 
                                alt="Proof" 
                              />
                              <div className="space-y-2">
                                <ul className="list-disc list-inside text-cat-deep/90 font-bold space-y-1">
                                  <li>TQC - PowerPoint</li>
                                  <li>Maya ACU 原廠國際認證</li>
                                </ul>
                              </div>
                           </div>
                        </div>

                        <ResumeSection title="工作經歷" content="遊戲企劃實習生 | 教育出版 企劃助理 (1年)" />
                        <ResumeSection title="語言能力" content="中文 - 母語 | 英文 - 中等 | 日語 - N2或N3" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-4">
                    <CatButton onClick={() => setIsExpanded(!isExpanded)} className={isExpanded ? "bg-cat-orange text-white" : ""}>
                      {isExpanded ? "收起履歷" : "展開履歷"}
                    </CatButton>
                  </div>
                </div>
              </motion.div>

              {/* Row 2: Works */}
              <motion.div 
                ref={worksRef}
                initial={{ opacity: 0, x: 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-2 gap-16 items-center"
              >
                <div className="order-2 md:order-1 space-y-8 glass-card p-10 rounded-[40px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-cat-pink/20 rounded-xl flex items-center justify-center text-cat-pink font-bold">W</div>
                       <h2 className="text-3xl font-black tracking-tight text-cat-deep">我的作品</h2>
                    </div>
                    <p className="text-xl leading-relaxed text-cat-deep/80">
                      探索我和AI的工作成果。在這裡，每一次點擊都是一場奇幻的人機共創旅程。
                    </p>
                  </div>
                  <CatButton onClick={() => navigateTo('works', 'works')}>
                    查看詳情
                    <ArrowRight size={20} />
                  </CatButton>
                </div>
                <div className="order-1 md:order-2 glass-card h-[400px] rounded-[40px] flex items-center justify-center group">
                   <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative w-72 h-72">
                      <div className="absolute inset-0 bg-cat-orange blur-3xl opacity-20"></div>
                      <img src="/assets/sticker_14.png" className="w-full h-full object-contain relative z-10" alt="Works" />
                   </motion.div>
                </div>
              </motion.div>

              {/* Row 3: Store */}
              <motion.div 
                ref={productsRef}
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-2 gap-16 items-center"
              >
                <div className="glass-card h-[400px] rounded-[40px] flex items-center justify-center group">
                   <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="relative w-72 h-72">
                     <div className="absolute inset-0 bg-cat-pink blur-3xl opacity-20"></div>
                     <img src="/assets/sticker_5.png" className="w-full h-full object-contain relative z-10" alt="Gold" />
                   </motion.div>
                </div>
                <div className="space-y-8 glass-card p-10 rounded-[40px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-cat-orange/20 rounded-xl flex items-center justify-center text-cat-orange">
                          <ShoppingBag size={20} />
                       </div>
                       <h2 className="text-3xl font-black tracking-tight text-cat-deep">挖挖黃金</h2>
                    </div>
                    <p className="text-xl leading-relaxed text-cat-deep/80">
                      收藏了我和AI產出的小物，歡迎參觀！或許你會在這裡找到屬於你的那根貓薄荷。
                    </p>
                  </div>
                  <CatButton onClick={() => navigateTo('products', 'products')}>
                    進入窗口
                    <ArrowRight size={20} />
                  </CatButton>
                </div>
              </motion.div>

            </div>

             {/* Footer */}
             <footer className="bg-cat-deep text-white/90 py-16 px-6">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-end">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-2xl font-bold text-cat-orange">
                    <Cat fill="currentColor" />
                     Doris' Cat Bar
                  </div>
                  <p className="text-white/60 max-w-sm">
                    家裡養著一隻樂天橘貓"哭奇 / Cookie"，喜歡以Cookie為主題的各種創作。
                  </p>
                </div>
                <div className="space-y-6">
                  <p className="font-bold text-lg flex items-center gap-2">聯繫方式</p>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 opacity-70">
                    <a href="https://www.instagram.com/cookie_orange430?igsh=aGpvYXhhajV0Z2xz" target="_blank" rel="noreferrer" className="hover:text-cat-orange transition-all flex items-center gap-1.5 border-b border-transparent hover:border-cat-orange text-sm">
                      <Instagram size={18} /> Instagram
                    </a>
                    <a href="https://www.threads.com/@cookie_orange430" target="_blank" rel="noreferrer" className="hover:text-cat-orange transition-all flex items-center gap-1.5 border-b border-transparent hover:border-cat-orange text-sm">
                      <Mail size={18} /> Threads
                    </a>
                    <a href="https://x.com/Life2_Clear" target="_blank" rel="noreferrer" className="hover:text-cat-orange transition-all flex items-center gap-1.5 border-b border-transparent hover:border-cat-orange text-sm">
                      <Twitter size={18} /> X (Twitter)
                    </a>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs text-white/40 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2">
                       <Mail size={14} /> lindorisbaby@gmail.com
                    </div>
                    <span className="md:ml-auto">聲明 網頁由AI輔助製作 | 2026</span>
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {view === 'works' && (
          <ShowcasePage 
            key="works"
            title="作品展示"
            type="works"
            onBack={handleBackToHub}
            onNext={() => navigateTo('products', 'products')}
          />
        )}

        {view === 'products' && (
          <ShowcasePage 
            key="products"
            title="商品展示"
            type="products"
            onBack={handleBackToHub}
            onPrev={() => navigateTo('works', 'works')}
          />
        )}
      </AnimatePresence>

      {/* Back to Top / Home Hub Button */}
      {view !== 'home' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60]"
        >
          <motion.button
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="w-16 h-16 bg-cat-deep text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-cat-orange transition-colors"
          >
            <ChevronDown className="rotate-180" size={32} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

const ShowcasePage = ({ title, type, onBack, onNext, onPrev, key }: { 
  title: string, 
  type: 'works' | 'products',
  onBack: () => void,
  onNext?: () => void,
  onPrev?: () => void,
  key?: string
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const items = type === 'works' ? [
    { 
      id: 1, 
      title: '平面插圖', 
      tags: ['橘貓'], 
      icon: '/assets/sticker_19.png',
      details: [
        { 
          tag: '橘貓', 
          image: '/assets/paint.png', 
          text: '水彩風格的家養貓貓' 
        }
      ]
    },
    { 
      id: 2, 
      title: '遊戲專案', 
      tags: ['網頁文字遊戲'], 
      icon: '/assets/sticker_18.png',
      details: [
        { 
          tag: '網頁文字遊戲', 
          text: '利用AI工具做出來的網頁文字遊戲！',
          link: '#', 
          linkText: '前往遊玩'
        }
      ]
    },
  ] : [
    { 
      id: 1, 
      title: 'LINE 貼圖', 
      tags: ['呆橘貓', '聰明白貓'], 
      icon: '/assets/sticker_1.png', 
      details: [
        { 
          tag: '呆橘貓', 
          image: '/assets/sticker_1.png', 
          text: '又圓又Q的軟軟橘貓',
          link: 'https://line.me/S/sticker/33840747?_from=lcm',
          linkText: '前往購買'
        },
        { 
          tag: '聰明白貓', 
          image: '/assets/WhiteCat.png', 
          text: '獨立又認真的白貓貓',
          link: 'https://line.me/S/sticker/33898118?_from=lcm',
          linkText: '前往購買'
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: type === 'works' ? -100 : 100, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen bg-cat-peach p-6 md:p-12 relative overflow-hidden"
    >
      <ScrollParticles />
      
      <div className="max-w-5xl mx-auto space-y-16 pb-40 relative z-10">
        <div className="flex items-center gap-6 border-b-2 border-cat-orange/10 pb-10">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-3 bg-white/60 backdrop-blur rounded-2xl shadow-sm highlight-white/20 hover:text-cat-orange transition-colors"
          >
            <Home size={28} />
          </motion.button>
          <div>
            <span className="text-cat-orange font-bold tracking-widest text-sm uppercase">Curated Space</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-cat-deep">{title}</h1>
          </div>
        </div>

        <div className="grid gap-10">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className={`glass-card rounded-[40px] p-10 flex flex-col md:flex-row gap-12 items-center md:items-start transition-all overflow-hidden ${selectedId === item.id ? 'ring-2 ring-cat-orange' : ''}`}
            >
              <div className="w-56 h-56 bg-cat-pink/20 rounded-[30px] flex items-center justify-center p-4 shrink-0 shadow-inner group overflow-hidden">
                 <motion.img
                   src={item.details.find(d => d.tag === selectedTag)?.image || item.icon}
                   className="w-full h-full object-contain"
                   animate={{ 
                    scale: selectedId === item.id ? 1.05 : 1,
                    rotate: selectedId === item.id ? [0, 2, -2, 0] : 0
                   }}
                 />
              </div>
              
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h3 className="text-3xl font-black">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {item.tags.map(tag => (
                        <motion.button 
                          key={tag}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (selectedId === item.id && selectedTag === tag) {
                              setSelectedId(null);
                              setSelectedTag(null);
                            } else {
                              setSelectedId(item.id);
                              setSelectedTag(tag);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedId === item.id && selectedTag === tag ? 'bg-cat-orange text-white' : 'bg-cat-orange/10 text-cat-deep/70 hover:bg-cat-orange/20'}`}
                        >
                          #{tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="w-16 h-1 bg-cat-orange/10 rounded-full mx-auto md:mx-0"></div>
                </div>
                
                <AnimatePresence mode="wait">
                  {selectedId === item.id && selectedTag && (
                    <motion.div
                      key={selectedTag}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-8"
                    >
                      {item.details.find(d => d.tag === selectedTag)?.image && (
                         <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="max-w-md mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-lg border-4 border-white"
                         >
                            <img src={item.details.find(d => d.tag === selectedTag)?.image} className="w-full h-auto" />
                         </motion.div>
                      )}

                      <div className="text-lg leading-relaxed max-w-2xl font-bold">
                         <TypewriterText text={item.details.find(d => d.tag === selectedTag)?.text || ''} />
                      </div>
                      
                      {item.details.find(d => d.tag === selectedTag)?.link && (
                        <motion.a
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          href={item.details.find(d => d.tag === selectedTag)?.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-3 bg-cat-deep text-white px-8 py-3 rounded-full font-bold hover:bg-cat-orange transition-all shadow-xl group"
                        >
                          {item.details.find(d => d.tag === selectedTag)?.linkText}
                          <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </motion.a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!selectedId && (
                   <p className="text-cat-deep/40 italic font-medium">點擊標籤以查看詳細內容...</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 left-0 right-0 pointer-events-none z-50">
        <div className="max-w-5xl mx-auto px-6 flex justify-between pointer-events-auto">
          {onPrev && (
            <CatButton onClick={onPrev} className="bg-white/90 shadow-2xl backdrop-blur">
              <ArrowLeft size={20} />
               <span className="hidden sm:inline">前往作品展示窗</span>
               <span className="sm:hidden">作品</span>
            </CatButton>
          )}
          {onNext && (
            <div className="ml-auto">
              <CatButton onClick={onNext} className="bg-white/90 shadow-2xl backdrop-blur">
                <span className="hidden sm:inline">前往商店展示窗</span>
                <span className="sm:hidden">商店</span>
                <ArrowRight size={20} />
              </CatButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ResumeSection = ({ title, content }: { title: string, content: string }) => (
  <div className="space-y-1">
    <h4 className="text-sm font-bold uppercase tracking-widest text-cat-orange/80">{title}</h4>
    <p className="text-cat-deep/90 leading-relaxed font-medium">{content}</p>
  </div>
);

