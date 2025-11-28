const labContainer = document.querySelector('.BoiteAnimation');
const labCanvas = document.getElementById('labAnimation');

const appLab = new PIXI.Application({
  view: labCanvas,
  width: labContainer.clientWidth,
  height: labContainer.clientHeight,
  backgroundAlpha: 0,
  antialias: true
});

let labAnimMenu = null;
let labProjectAnimMenu = null;
let isPlayingProjectAnimation = false;

const loadingScreen = document.getElementById('loadingScreen');
const loadingFill = document.querySelector('.loadingFill');
const loadingPercent = document.querySelector('.loadingPercent');

let loadedCount = 0;
const totalAnimations = 2; 

function updateLoadingBar() {
  if (!loadingFill || !loadingPercent) return; // Vérifier que les éléments existent
  
  loadedCount++;
  const percent = Math.round((loadedCount / totalAnimations) * 100);
  loadingFill.style.width = percent + '%';
  loadingPercent.textContent = percent + '%';
}

function hideLoadingScreen() {
  if (!loadingScreen) return; // Vérifier que l'élément existe
  
  loadingScreen.style.opacity = '0';
  loadingScreen.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 300);
}

// Projects data
const projects = [
  { name: 'Elastup', image: 'Elastup.png' },
  { name: 'Multiplayer Fighting Game', image: 'RyuVsLucas.png' },
  { name: 'Rythm Game', image: 'RythmGame.png' },
  { name: 'Biohybrid Sensors', image: 'BiohybridSensors.png' },
  { name: 'Mnist Classifier', image: 'MnistClassifier.png' },
  { name: 'Airbnb Price Prediction', image: 'AirbnbPricePrediction.png' },
  { name: 'Concorde Modeling', image: 'ConcordeModeling.png' }
];

let currentProjectIndex = 0;
const animations = {};

Promise.all([
  preloadAnimation('Lab', 'Lab'),
  preloadAnimation('LabProjectChoice', 'LabProjectChoice')
]).then(() => {
  console.log("Toutes les animations du Lab préchargées !");
  hideLoadingScreen();
  displayLabAnimation('Lab');
  updateProjectDisplay();
});

async function preloadAnimations() {
  showLoadingScreen();
  
  try {
    await preloadAnimation('Lab', 'Lab');
    await preloadAnimation('LabProjectChoice', 'LabProjectChoice');
    
    // Preload project images
    for (let i = 0; i < projects.length; i++) {
      await preloadImage(projects[i].image, i);
    }
    
    displayLabAnimation('Lab');
    updateProjectDisplay();
    hideLoadingScreen();
  } catch (error) {
    console.error('Erreur lors du préchargement des animations:', error);
    hideLoadingScreen();
  }
}

function preloadAnimation(folder, fileNameBase) {
  const jsonPath = `${fileNameBase}.json`;
  const pngPath = `${fileNameBase}.png`;

  return fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      const texture = PIXI.Texture.from(pngPath);
      const frames = [];

      for (let key in data.frames) {
        const f = data.frames[key].frame;
        frames.push(
          new PIXI.Texture(
            texture,
            new PIXI.Rectangle(f.x, f.y, f.w, f.h)
          )
        );
      }

      animations[fileNameBase] = frames;

      // Initialiser le GPU en créant un sprite et en le rendant une fois
      return new Promise(resolve => {
        const warmupSprite = new PIXI.Sprite(frames[0]);
        warmupSprite.x = -9999;
        warmupSprite.y = -9999;
        
        appLab.stage.addChild(warmupSprite);
        appLab.render();
        appLab.stage.removeChild(warmupSprite);
        warmupSprite.destroy();
        
        updateLoadingBar();
        resolve();
      });
    });
}

function preloadImage(imageName, index) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      projectImages[index] = img.src;
      updateLoadingBar();
      resolve();
    };
    img.onerror = () => {
      console.warn(`Impossible de charger l'image: ${imageName}`);
      updateLoadingBar();
      resolve(); // Continue même si l'image n'existe pas
    };
    img.src = imageName;
  });
}

function displayLabAnimation(name) {
  if (!animations[name]) {
    console.error("Animation non préchargée:", name);
    return;
  }

  if (labAnimMenu) {
    appLab.stage.removeChild(labAnimMenu);
    labAnimMenu.destroy();
  }

  labAnimMenu = new PIXI.AnimatedSprite(animations[name]);
  labAnimMenu.anchor.set(0.5);
  labAnimMenu.animationSpeed = 0.15;
  labAnimMenu.loop = true;

  updateLabAnimationScale();
  appLab.stage.addChild(labAnimMenu);
  labAnimMenu.play();
}

function displayLabProjectAnimation() {
  if (!animations['LabProjectChoice']) {
    console.error("Animation LabProjectChoice non préchargée");
    return;
  }

  if (labAnimMenu) {
    appLab.stage.removeChild(labAnimMenu);
    labAnimMenu.destroy();
    labAnimMenu = null;
  }

  labProjectAnimMenu = new PIXI.AnimatedSprite(animations['LabProjectChoice']);
  labProjectAnimMenu.anchor.set(0.5);
  labProjectAnimMenu.animationSpeed = 0.15;
  labProjectAnimMenu.loop = false;

  updateLabAnimationScale();
  appLab.stage.addChild(labProjectAnimMenu);

  labProjectAnimMenu.onComplete = () => {
    // Navigate to project page with absolute URL
    const projectPages = [
      'elastup.html',
      'fighting-game.html',
      'rhythm-game.html',
      'biohybrid-sensors.html',
      'mnist-classifier.html',
      'airbnb-prediction.html',
      'concorde-modeling.html'
    ];
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    const fullUrl = baseUrl + '/' + projectPages[currentProjectIndex];
    window.location.href = fullUrl;
  };

  labProjectAnimMenu.play();
  isPlayingProjectAnimation = true;
}

function updateLabAnimationScale() {
  const sprite = labAnimMenu || labProjectAnimMenu;
  if (!sprite) return;

  sprite.x = appLab.screen.width / 2;
  sprite.y = appLab.screen.height / 2;

  const firstFrame = sprite.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  const scaleX = appLab.screen.width / frameWidth;
  const scaleY = appLab.screen.height / frameHeight;
  sprite.scale.set(Math.min(scaleX, scaleY));
}

function updateProjectDisplay() {
  const project = projects[currentProjectIndex];
  const projectImage = document.getElementById('projectImage');
  const indexDisplay = document.getElementById('projectIndexDisplay');

  projectImage.src = project.image;
  indexDisplay.textContent = currentProjectIndex + 1;

  document.querySelector('.optionDisplayLab').textContent = project.name;
}

window.addEventListener('resize', () => {
  appLab.renderer.resize(labContainer.clientWidth, labContainer.clientHeight);
  updateLabAnimationScale();
});

// Navigation controls
const prevBtnLab = document.getElementById('prevBtnLab');
const nextBtnLab = document.getElementById('nextBtnLab');
const projectImageContainer = document.querySelector('.LabProjectImageContainer');

prevBtnLab.addEventListener('click', () => {
  if (!isPlayingProjectAnimation) {
    currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
    updateProjectDisplay();
  }
});

nextBtnLab.addEventListener('click', () => {
  if (!isPlayingProjectAnimation) {
    currentProjectIndex = (currentProjectIndex + 1) % projects.length;
    updateProjectDisplay();
  }
});

projectImageContainer.addEventListener('click', () => {
  if (!isPlayingProjectAnimation) {
    displayLabProjectAnimation();
  }
});
