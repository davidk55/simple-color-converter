import './styles/main.scss';
import clipboard_icon from './assets/clipboard.svg';
//
// Set clipboard icons
const clipboard = document.getElementsByClassName(
  'converter__input-fields__color-table__icons__icon'
);
for (let i = 0; i < clipboard.length; i++) {
  clipboard[i].src = clipboard_icon;
}

// Get input data for js
function getInputString() {
  return document.querySelector('#color-input').value;
}

// Check what type of value it is (hex, rgb, hsl)
// 0 = hex, 1 = rgb, 2 = hsl, -1 = not a color type
function getColorType(colorString) {
  if (
    colorString[0] == '#' &&
    (colorString.length == 4 || colorString.length == 7)
  )
    return 0;
  if (colorString.substring(0, 4) == 'rgb(') return 1;
  if (colorString.substring(0, 4) == 'hsl(') return 2;
  return -1;
}

// Expects the functions as a String
function getValuesOfCSSFunction(CSSFunction) {
  return CSSFunction.split('(')[1].slice(0, -1).replace(/\s|%/g, '').split(',');
}

function getValuesOfHexcolor(hexcolor) {
  let hexValues = hexcolor.replace(/#/g, '');
  if (hexValues.length == 6) return hexValues.match(/.{1,2}/g);
  if (hexValues.length == 3)
    return [
      hexValues[0].repeat(2),
      hexValues[1].repeat(2),
      hexValues[2].repeat(2),
    ];
}

// Expects a correctly formatted HSL function as a string
// source: https://www.rapidtables.com/convert/color/hsl-to-rgb.html
function hslToRgbValues(hslValues) {
  let c = 1 - Math.abs(2 * hslValues[2] - 1) * hslValues[1];
  let x = c * (1 - Math.abs(((hslValues[0] / 60) % 2) - 1));
  let m = hslValues[2] - c / 2;
  let r, g, b;
  if (hslValues[0] > 0 && hslValues[0] < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hslValues[0] >= 60 && hslValues[0] < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hslValues[0] >= 120 && hslValues[0] < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hslValues[0] >= 180 && hslValues[0] < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hslValues[0] >= 240 && hslValues[0] < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (hslValues[0] >= 300 && hslValues[0] < 360) {
    r = c;
    g = 0;
    b = x;
  } else {
    throw 'H of HSL is not in range 0 < H < 360';
  }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function rgbToHslValues(rgbValues) {
  let r = rgbValues[0] / 255;
  let g = rgbValues[1] / 255;
  let b = rgbValues[2] / 255;
  let cmax = Math.max(r, g, b);
  let cmin = Math.min(r, g, b);
  let delta = cmax - cmin;
  let h, l, s;

  // Calculate h
  if (delta == 0) h = 0;
  if (cmax == r) {
    let hTemp = 60 * (((g - b) / delta) % 6);
    if (hTemp >= 0) h = hTemp;
  }
  if (cmax == g) {
    let hTemp = 60 * ((b - r) / delta + 2);
    if (hTemp >= 0) h = hTemp;
  }
  if (cmax == b) {
    let hTemp = 60 * ((r - g) / delta + 4);
    if (hTemp >= 0) h = hTemp;
  }

  // Calculate l
  l = (cmax + cmin) / 2;

  // Calculate s
  if (delta == 0) s = 0;
  else s = delta / (1 - Math.abs(2 * l - 1));

  return [
    Math.round(h),
    Number(s * 100).toFixed(1) + '%',
    Number(l * 100).toFixed(1) + '%',
  ];
}

function rgbToHexValues(rgbValues) {
  let hexValues = [];
  for (let i = 0; i < rgbValues.length; i++) {
    let hexTemp = parseInt(rgbValues[i]).toString(16);
    // add prefixed zero when hex value is a single char: F > 0F
    if (hexTemp.length == 1) hexValues[i] = '0' + hexTemp;
    else hexValues[i] = hexTemp;
  }
  return hexValues;
}

function hexToRgbValues(hexValues) {
  let rgbValues = [];
  for (let i = 0; i < hexValues.length; i++) {
    rgbValues[i] = parseInt(hexValues[i], 16);
  }
  return rgbValues;
}

// Expects a correctly formatted colorString and correct colorType
function evaluateHex(colorString, colorType) {
  if (colorType == 0) return colorString;
  let hex = '#';
  if (colorType == 1) {
    let rgbValues = getValuesOfCSSFunction(colorString);
    let hexValues = rgbToHexValues(rgbValues);
    hex += hexValues[0] + hexValues[1] + hexValues[2];
  } else if (colorType == 2) {
    let hslValues = getValuesOfCSSFunction(hslValues);
    let rgbValues = hslToRgbValues(colorString);
    let hexValues = rgbToHexValues(rgbValues);
    hex += hexValues[0] + hexValues[1] + hexValues[2];
  }
  return hex;
}

// Expects a correctly formatted colorString and correct colorType
function evaluateRGB(colorString, colorType) {
  if (colorType == 1) return colorString;
  let rgbValues;
  if (colorType == 0) {
    let hexValues = getValuesOfHexcolor(colorString);
    rgbValues = hexToRgbValues(hexValues);
  } else if (colorType == 2) {
    let hslValues = getValuesOfCSSFunction(colorString);
    rgbValues = hslToRgbValues(hslValues);
  }
  return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
}
function evaluateHSL(colorString, colorType) {
  if (colorType == 2) return colorString;
  let hslValues;
  if (colorType == 0) {
    let hexValues = getValuesOfHexcolor(colorString);
    let rgbValues = hexToRgbValues(hexValues);
    hslValues = rgbToHslValues(rgbValues);
  } else if (colorType == 1) {
    let rgbValues = getValuesOfCSSFunction(colorString);
    hslValues = rgbToHslValues(rgbValues);
  }
  return `hsl(${hslValues[0]}, ${hslValues[1]}, ${hslValues[2]})`;
}

function insertColors(colorString, colorType) {
  if (colorType == -1) return;

  let hex = evaluateHex(colorString, colorType);
  let rgb = evaluateRGB(colorString, colorType);
  let hsl = evaluateHSL(colorString, colorType);

  // apply color to current-color-square
  document.querySelector('#current-color-square').style.backgroundColor = hex;

  // insert calculated values in the table
  document.querySelector('#hex-display').value = hex;
  document.querySelector('#rgb-display').value = rgb;
  document.querySelector('#hsl-display').value = hsl;
}

function applyColors() {
  let inputString = getInputString();
  let colorType = getColorType(inputString);
  insertColors(inputString, colorType);
}

// Listener
let colorInput = document.querySelector('#color-input');
colorInput.addEventListener('change', () => {
  applyColors();
});
