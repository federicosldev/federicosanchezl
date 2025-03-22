import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Verificar si estamos en la página de inicio con pantalla de carga
export function isHomeWithLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  return loadingScreen && loadingScreen.style.display !== 'none';
  
}
isHomeWithLoading();

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

// Pre-hide all section headers before any JavaScript runs
document.addEventListener("DOMContentLoaded", () => {
  // Add a style tag to hide section headers immediately
  const style = document.createElement("style")
  style.textContent = `
    .section-header {
      opacity: 0;
    }
  `
  document.head.appendChild(style)
})

export function initTitleAnimations() {
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

