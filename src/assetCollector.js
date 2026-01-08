// src/assetCollector.js
import {
  booksConfigMap, 
  BG_LAYOUTS, 
  SVG_DRAW_BG_IMAGES, 
  SVG_DRAW_GROUPS, 
  SECTION_3_ASSETS, 
  SECTION_4_ASSETS
} from './utils/Configs';


export function collectAssetPaths(device) {
  const texturePaths = new Set();
  const modelPaths = new Set();
  const svgPaths = new Set(); 
  

  // Collect Book Assets 
  const deviceBookConfig = booksConfigMap[device];
  if (deviceBookConfig) {
    deviceBookConfig.forEach(book => {
      if (book.coverMap) texturePaths.add(book.coverMap);
      if (book.firstPageMap) texturePaths.add(book.firstPageMap);
      if (book.firstPageMapFlipped) texturePaths.add(book.firstPageMapFlipped);
      if (book.backMap) texturePaths.add(book.backMap);
      if (book.spineMap) texturePaths.add(book.spineMap);
      if (book.coverTrickMap) texturePaths.add(book.coverTrickMap);

      if (book.pages) {
        book.pages.forEach(page => {
          if (page.pageMap) texturePaths.add(page.pageMap);
        });
      }
    });
  }


  // Collect Hover Images (from SvgDraw config)
  SVG_DRAW_BG_IMAGES.forEach(img => {
    if (img.url) texturePaths.add(img.url);
  });

  // Collect Concrete Wall Background Assets 
  const deviceBgConfig = BG_LAYOUTS[device];
  if (deviceBgConfig) {
    if (deviceBgConfig.map) texturePaths.add(deviceBgConfig.map);
    if (deviceBgConfig.normalMap) texturePaths.add(deviceBgConfig.normalMap);
    if (deviceBgConfig.roughnessMap) texturePaths.add(deviceBgConfig.roughnessMap);
  }

  //  Collect Section 3 & 4 assets
  if (SECTION_3_ASSETS.indesignLayoutSvg) {
    svgPaths.add(SECTION_3_ASSETS.indesignLayoutSvg);
  }
 
  if (SECTION_4_ASSETS.signatureCombined) svgPaths.add(SECTION_4_ASSETS.signatureCombined);
 
  //  Hardcoded Extras (Only load shelf model for non-mobile)
  if (device !== 'mobile') {
    texturePaths.add('/textures/wood/godLAST2K.jpg');
    texturePaths.add('/images/light.png');
    modelPaths.add('./models/shelfcombinednomat4.glb');
  }

   // Collect SVGs (from SvgDraw config) 
  SVG_DRAW_GROUPS.forEach(group => {
    group.parts.forEach(part => {
        const url = typeof part === 'string' ? part : part.url;
        svgPaths.add(url);
    });

    // Note: We don't strictly need to preload .lottie files here for the 
    // progress bar (unless later I write a custom loader for them), 
    // but the SVG drawing phase gives the Lottie plenty of time to load in the background. 
  });

  return {
    texturePaths: Array.from(texturePaths),
    modelPaths: Array.from(modelPaths),
    svgPaths: Array.from(svgPaths),
    
  };
}

