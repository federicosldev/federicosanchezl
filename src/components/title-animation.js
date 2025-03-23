import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Verificar si estamos en la página de inicio con pantalla de carga
export function isHomeWithLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  return loadingScreen && loadingScreen.style.display !== 'none';
}

// Función para asegurar que el contenido sea visible
export function makeContentVisible() {
  // Hacer que los section headers sean visibles
  const headers = document.querySelectorAll('.section-header');
  headers.forEach(header => {
    header.style.cssText = 'opacity: 1 !important; visibility: visible !important;';
  });
  
  // Hacer que los elementos animados sean visibles
  const animatedElements = document.querySelectorAll('.animated-title, .animated-text');
  animatedElements.forEach(element => {
    element.style.cssText = 'opacity: 1 !important; visibility: visible !important;';
    
    // Hacer que las palabras sean visibles
    const words = element.querySelectorAll('.word');
    words.forEach(word => {
      word.style.cssText = 'opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important;';
    });
  });
}

function wrapWordsPreservingStructure(element) {
  // Handle elements with child nodes (like spans)
  if (element.childNodes.length > 0) {
    // Convert to array to avoid live NodeList issues during manipulation
    const childNodes = Array.from(element.childNodes)

    childNodes.forEach((node) => {
      // If it's a text node
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
        const words = node.textContent.split(" ").filter((word) => word.trim() !== "")
        const fragment = document.createDocumentFragment()

        words.forEach((word) => {
          const wordWrapper = document.createElement("span")
          wordWrapper.className = "word-wrapper"

          const wordSpan = document.createElement("span")
          wordSpan.className = "word"
          wordSpan.textContent = word

          wordWrapper.appendChild(wordSpan)
          fragment.appendChild(wordWrapper)

          // Add space after each word except the last one
          if (word !== words[words.length - 1]) {
            fragment.appendChild(document.createTextNode(" "))
          }
        })

        node.replaceWith(fragment)
      }
      // If it's an element node (like a span)
      else if (node.nodeType === Node.ELEMENT_NODE) {
        wrapWordsPreservingStructure(node)
      }
    })
  }
}

export function initTitleAnimations() {
  // Primero asegurarse de que todo sea visible (como respaldo)
  makeContentVisible();
  
  // Luego intentar ejecutar animaciones
  try {
    // Add a class to the body when animations are initialized
    document.body.classList.add("animations-ready")

    // Initialize title animations
    initAnimatedElements(".animated-title", {
      staggerValue: 0.1,
      durationValue: 1,
      delayValue: 0,
      endPosition: "bottom top+=100", // Full animation range for titles
    })

    // Initialize paragraph animations
    initAnimatedElements(".animated-text", {
      staggerValue: 0.02,
      durationValue: 1,
      delayValue: 1,
      endPosition: "center center", // End earlier for paragraphs
    })

    // Initialize section header animations - load immediately
    initSectionHeaderAnimations()
  } catch (error) {
    console.error("Animation error:", error);
    // Si algo falla, asegurarse de que el contenido sea visible
    makeContentVisible();
  }
}

// Function for scroll-triggered animations
function initAnimatedElements(selector, options = {}) {
  const { staggerValue = 0.1, durationValue = 1, delayValue = 0, endPosition = "bottom top+=100" } = options

  const animatedElements = document.querySelectorAll(selector)

  animatedElements.forEach((element) => {
    const isAutoanim = element.classList.contains("autoanim")
    const isTitle = selector === ".animated-title"

    // Apply word wrapping while preserving nested elements
    wrapWordsPreservingStructure(element)

    // Get all words across all lines
    const allWords = element.querySelectorAll(".word")

    // Set initial state - hide words initially
    gsap.set(allWords, {
      y: 50,
      opacity: 0,
    })

    // Apply GSAP styling
    gsap.set(element.querySelectorAll(".word, .word-wrapper"), {
      display: "inline-block",
    })

    // Apply different overflow settings based on element type
    gsap.set(element.querySelectorAll(".word-wrapper"), {
      overflow: isTitle ? "visible" : "hidden",
      verticalAlign: "top", // Helps with alignment in multi-line text
    })

    // Create ScrollTrigger for ALL elements, even those initially in view
    // This ensures consistent behavior with scrolling
    const scrollConfig = {
      trigger: element,
      start: "top bottom-=100", // Trigger a bit earlier
      end: endPosition, // Use the provided end position
      markers: false,
      pin: false,
      scrub: isAutoanim ? false : 1, // Use 1 for smoother scrubbing
      toggleActions: "play reverse play reverse", // Key change: fully sync with scroll direction
    }

    const tl = gsap.timeline({
      scrollTrigger: scrollConfig,
      delay: delayValue, // Apply delay if specified
    })

    tl.to(allWords, {
      y: 0,
      opacity: 1,
      duration: isAutoanim ? durationValue : durationValue / 2,
      stagger: isAutoanim ? staggerValue : staggerValue / 2,
      ease: "power3.out",
    })
  })
}

// New function for section headers that animate on page load
function initSectionHeaderAnimations() {
  const sectionHeaders = document.querySelectorAll(".section-header")

  // First make section headers visible again (they were hidden by the early style tag)
  gsap.set(".section-header", { opacity: 1, visibility: "visible" })

  sectionHeaders.forEach((header) => {
    // Apply word wrapping while preserving nested elements
    wrapWordsPreservingStructure(header)

    // Get all words across all lines
    const allWords = header.querySelectorAll(".word")

    // Set initial state - hide words initially
    gsap.set(allWords, {
      y: 50,
      opacity: 0,
    })

    // Apply GSAP styling
    gsap.set(header.querySelectorAll(".word, .word-wrapper"), {
      display: "inline-block",
    })

    // Apply overflow visible for section headers (like titles)
    gsap.set(header.querySelectorAll(".word-wrapper"), {
      overflow: "visible",
      verticalAlign: "top",
    })

    // Create timeline for immediate animation (not scroll-triggered)
    const tl = gsap.timeline({
      delay: 0.1, // Reduced delay for faster start
    })

    tl.to(allWords, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.08,
      ease: "power3.out",
    })
  })
}

// Function to make section headers visible on mobile
export function showSectionHeadersOnMobile() {
  const sectionHeaders = document.querySelectorAll(".section-header")
  
  // Make sure all section headers are immediately visible
  gsap.set(".section-header", { opacity: 1, visibility: "visible" })
  
  // Also make all words inside section headers visible
  sectionHeaders.forEach(header => {
    // First apply the word wrapping to ensure structure is consistent
    wrapWordsPreservingStructure(header)
    
    // Then make all words visible
    const words = header.querySelectorAll(".word")
    gsap.set(words, { 
      y: 0, 
      opacity: 1,
      display: "inline-block"
    })
    
    // Make word wrappers visible and properly styled
    const wordWrappers = header.querySelectorAll(".word-wrapper")
    gsap.set(wordWrappers, {
      overflow: "visible",
      verticalAlign: "top",
      display: "inline-block"
    })
  })
  
  // Also directly set inline styles to override any !important styles
  sectionHeaders.forEach(header => {
    header.style.cssText = 'opacity: 1 !important; visibility: visible !important;';
  })
}

// Function to make animated elements visible on mobile
export function showAnimatedElementsOnMobile() {
  const animatedElements = document.querySelectorAll(".animated-title, .animated-text")
  
  animatedElements.forEach(element => {
    // Apply word wrapping to ensure structure is consistent
    wrapWordsPreservingStructure(element)
    
    // Make all words visible
    const words = element.querySelectorAll(".word")
    gsap.set(words, { 
      y: 0, 
      opacity: 1,
      display: "inline-block"
    })
    
    // Make word wrappers visible and properly styled
    const wordWrappers = element.querySelectorAll(".word-wrapper")
    gsap.set(wordWrappers, {
      overflow: "visible",
      verticalAlign: "top",
      display: "inline-block"
    })
    
    // Also directly set inline styles to override any !important styles
    element.style.cssText = 'opacity: 1 !important; visibility: visible !important;';
    words.forEach(word => {
      word.style.cssText = 'opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important;';
    });
  })
}

// Main function to initialize animations based on screen width
export function DOMReady() {
  console.log("DOM Ready - Checking screen width")
  
  // First make everything visible as a fallback
  makeContentVisible();
  
  if (window.innerWidth > 1200) {
    // Desktop - run animations
    console.log("Desktop detected - Running animations")
    initTitleAnimations()
    // Add other desktop-only animations here
  } else {
    // Mobile - make elements visible without animations
    console.log("Mobile detected - Skipping animations")
    showSectionHeadersOnMobile()
    showAnimatedElementsOnMobile()
    // Add other mobile-specific code here
  }
  
  // Common functions that run on both desktop and mobile
  // Add your common functions here, like:
  // menu()
  // marquee()
}