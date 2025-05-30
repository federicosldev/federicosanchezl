import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Función para asegurar visibilidad de los elementos antes de animar
export function makeContentVisible() {
    document.querySelectorAll('.section-header, .animated-title, .animated-text').forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
    });
}

// Función para envolver palabras sin perder la estructura HTML
function wrapWordsPreservingStructure(element) {
    if (element.childNodes.length > 0) {
        const childNodes = Array.from(element.childNodes);

        childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
                const words = node.textContent.split(" ").filter((word) => word.trim() !== "");
                const fragment = document.createDocumentFragment();

                words.forEach((word) => {
                    const wordWrapper = document.createElement("span");
                    wordWrapper.className = "word-wrapper";

                    const wordSpan = document.createElement("span");
                    wordSpan.className = "word";
                    wordSpan.textContent = word;

                    wordWrapper.appendChild(wordSpan);
                    fragment.appendChild(wordWrapper);
                    fragment.appendChild(document.createTextNode(" "));
                });

                node.replaceWith(fragment);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                wrapWordsPreservingStructure(node);
            }
        });
    }
}

export function initTitleAnimations() {
    console.log("Inicializando animaciones...");

    makeContentVisible();

    try {
        document.body.classList.add("animations-ready");

        initAnimatedElements(".animated-title", {
            staggerValue: 0.1,
            durationValue: 1,
            delayValue: 0,
            endPosition: "bottom top+=100",
        });

        initAnimatedElements(".animated-text", {
            staggerValue: 0.02,
            durationValue: 1,
            delayValue: 1,
            endPosition: "center center",
        });

        initSectionHeaderAnimations();
    } catch (error) {
        console.error("Error en animaciones:", error);
        makeContentVisible();
    }
}

function initAnimatedElements(selector, options = {}) {
    const { staggerValue = 0.1, durationValue = 1, delayValue = 0, endPosition = "bottom top+=100" } = options;

    const animatedElements = document.querySelectorAll(selector);

    animatedElements.forEach((element) => {
        wrapWordsPreservingStructure(element);

        const allWords = element.querySelectorAll(".word");

        gsap.set(allWords, { y: 50, opacity: 0 });

        gsap.set(element.querySelectorAll(".word, .word-wrapper"), { display: "inline-block" });

        gsap.set(element.querySelectorAll(".word-wrapper"), {
            overflow: "visible",
            verticalAlign: "top",
        });

        const scrollConfig = {
            trigger: element,
            start: "top bottom-=100",
            end: endPosition,
            markers: false,
            scrub: 1,
            toggleActions: "play reverse play reverse",
        };

        const tl = gsap.timeline({ scrollTrigger: scrollConfig, delay: delayValue });

        tl.to(allWords, {
            y: 0,
            opacity: 1,
            duration: durationValue / 2,
            stagger: staggerValue / 2,
            ease: "power3.out",
        });
    });
}

function initSectionHeaderAnimations() {
  const sectionHeaders = document.querySelectorAll(".section-header");

  gsap.set(".section-header", { opacity: 1, visibility: "visible" });

  sectionHeaders.forEach((header) => {
      wrapWordsPreservingStructure(header);

      const allWords = header.querySelectorAll(".word");

      gsap.set(allWords, { y: 30, opacity: 0 });

      gsap.set(header.querySelectorAll(".word, .word-wrapper"), { display: "inline-block" });

      gsap.set(header.querySelectorAll(".word-wrapper"), {
          overflow: "visible",
          verticalAlign: "top",
      });

      gsap.timeline({ delay: 0.1 }).to(allWords, {
          y: 0,
          opacity: 1,
          duration: 0.6, 
          stagger: 0.04, 
          ease: "power2.out", 
      });
  });
}

export function showSectionHeadersOnMobile() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.opacity = '1';
        header.style.visibility = 'visible';
    });
}

export function showAnimatedElementsOnMobile() {
    document.querySelectorAll(".animated-title, .animated-text").forEach(element => {
        wrapWordsPreservingStructure(element);

        element.querySelectorAll(".word").forEach(word => {
            word.style.opacity = '1';
            word.style.visibility = 'visible';
            word.style.transform = 'translateY(0)';
        });
    });
}

// Función principal para iniciar animaciones
export function DOMReady() {
    console.log("DOM Ready - Chequeando ancho de pantalla");

    makeContentVisible();

    if (window.innerWidth > 1200) {
        console.log("Detectado Desktop - Ejecutando animaciones");
        initTitleAnimations();
    } else {
        console.log("Detectado Mobile - Mostrando elementos sin animaciones");
        showSectionHeadersOnMobile();
        showAnimatedElementsOnMobile();
    }

    ScrollTrigger.refresh();
}

//-----------------------------
     // Función para verificar si estamos en desktop (ancho > 1200px)
  function isDesktop() {
    return window.innerWidth > 1200;
  }

  // Función para envolver cada palabra en un span
  function wrapEachWord(paragraph) {
    const content = paragraph.innerHTML;
    const words = content.split(' ');
    const wrappedContent = words.map(word => 
      `<span class="word-wrapper"><span class="word">${word}</span></span>`
    ).join(' ');
    paragraph.innerHTML = wrappedContent;
  }

  // Función para animar párrafos palabra por palabra
  function paragraphs() {
    if (!isDesktop()) return;

    const paragraphs = Array.from(document.querySelectorAll(".hero-text p"));

    paragraphs.forEach((paragraph) => {
      const isAutoanim = paragraph.parentNode.classList.contains("autoanim");
      
      wrapEachWord(paragraph);
      gsap.set(paragraph.querySelectorAll("span"), { display: "inline-block" });
      gsap.set(paragraph.querySelectorAll("span.word-wrapper"), {
        overflow: "hidden",
        paddingTop: "0.2em", 
      });
      
      // Crear un ID único para este ScrollTrigger
      const triggerId = `paragraph-${Math.random().toString(36).substr(2, 9)}`;
      
      gsap
        .timeline({
          scrollTrigger: {
            trigger: paragraph,
            start: "top bottom-=200",
            end: "center center",
            markers: false,
            pin: false,
            id: triggerId, 
            scrub: isAutoanim ? false : 2,
            toggleActions: "play none none reverse", // onEnter / onLeave / onEnterBack / onLeaveBack
          },
        })
        .from(paragraph.querySelectorAll(".word"), {
          y: 50,
          duration: 0.5,
          opacity: 0,
          stagger: 0.02,
          ease: "power3.out",
          delay: 0.5,
        });
    });
  }

  function animateTitles() {
    if (!isDesktop()) return;

    const animTitles = document.querySelectorAll(".animTitle");
    
    animTitles.forEach((title, index) => {
      gsap.set(title, { 
        opacity: 0,
        y: 30,
        clipPath: "polygon(0 -20%, 100% -20%, 100% -20%, 0 -20%)",
        overflow: "visible"
      });
      
      const triggerId = `animTitle-${index}`;
      
      gsap.timeline({
        scrollTrigger: {
          trigger: title,
          start: "top bottom-=100", 
          end: "top center", 
          markers: false,
          id: triggerId, 
          toggleActions: "play none none reverse", 
        }
      })
      .to(title, {
        opacity: 1,
        y: 0,
        clipPath: "polygon(0 -20%, 100% -20%, 100% 120%, 0 120%)",
        duration: 1,
        ease: "power3.out"
      });
    });
  }

  // Función de inicialización de la animación principal
  function initAnimation() {
    if (!isDesktop()) {
      gsap.set(".hero-title, .hero-img, .hero-text, .animTitle", { 
        opacity: 1,
        clipPath: "none",
        y: 0
      });
      return;
    }

    // Crear un timeline para coordinar las animaciones
    const tl = gsap.timeline({
      defaults: { 
        ease: "power3.out",
      }
    });

    gsap.set(".hero-title, .hero-img", { 
      opacity: 0,
      y: 30,
      clipPath: "polygon(0 -20%, 100% -20%, 100% -20%, 0 -20%)",
      overflow: "visible"
    });

    gsap.set(".hero-text", { 
      opacity: 0,
      overflow: "visible"
    });

    tl.to(".hero-title", {
      opacity: 1,
      y: 0,
      clipPath: "polygon(0 -20%, 100% -20%, 100% 120%, 0 120%)", 
      duration: 1,
      stagger: 0.3 
    }, 0.2);

    tl.to(".hero-img", {
      opacity: 1,
      y: 0,
      clipPath: "polygon(0 -20%, 100% -20%, 100% 120%, 0 120%)", 
      duration: 1.2,
      stagger: 0.2
    }, 0.5);

    tl.to(".hero-text", {
      opacity: 1,
      duration: 0.5,
      onComplete: paragraphs
    }, 1);
  }

  // Función para inicializar todo
  function init() {
    initAnimation();
    animateTitles(); 
    
    if (isDesktop()) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }

  function handleResize() {
    const ourTriggers = ScrollTrigger.getAll().filter(st => {
      
      return st.vars.id && (
        st.vars.id.startsWith('paragraph-') || 
        st.vars.id.startsWith('animTitle-')
      );
    });
    
    ourTriggers.forEach(st => st.kill());
    
    gsap.killTweensOf(".hero-title, .hero-img, .hero-text, .animTitle");
    
    init();
  }

  
  document.addEventListener('astro:page-load', init);

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('html')?.hasAttribute('data-astro-transition')) {
      init();
    }
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
  });