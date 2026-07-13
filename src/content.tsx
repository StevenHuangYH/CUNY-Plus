import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from "plasmo"
import RMPButton from "~features/ratings/components/RMPButton"

// Match CUNY domains and localhost for testing
export const config: PlasmoCSConfig = {
  matches: [
    "https://*.cuny.edu/*",
    "http://localhost:*/*",
    "http://127.0.0.1:*/*",
    "file://*/*"
  ]
}

// Injected styles inside Shadow DOM
export const getStyle: PlasmoGetStyle = () => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const parseFloatValue = parseFloat(remValue)
    const pixelsValue = parseFloatValue * baseFontSize
    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText + "\n :host { z-index: 9999 !important; }"
  return styleElement
}

const globalStyle = document.createElement("style")
globalStyle.textContent = "plasmo-csui { z-index: 9999 !important; }"
document.head.appendChild(globalStyle)


// Select all elements containing professor names
// We target both the actual CUNY Schedule Builder selector: div.rightnclear[title="Instructor(s)"]
// and our local simulator selector: .instructor-name
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = document.querySelectorAll('div.rightnclear[title="Instructor(s)"], .instructor-name')
  return Array.from(elements).map((el) => ({
    element: el,
    insertPosition: "afterend"
  }))
}

export default RMPButton
