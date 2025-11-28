// Loading screen
const loadingScreen = document.getElementById('loadingScreen');
const loadingFill = document.querySelector('.loadingFill');
const loadingPercent = document.querySelector('.loadingPercent');

let loadedCount = 0;
const totalAnimations = 3; 

function updateLoadingBar() {
  if (!loadingFill || !loadingPercent) return;
  
  loadedCount++;
  const percent = Math.round((loadedCount / totalAnimations) * 100);
  loadingFill.style.width = percent + '%';
  loadingPercent.textContent = percent + '%';
}

function hideLoadingScreen() {
  if (!loadingScreen) return;
  
  loadingScreen.style.opacity = '0';
  loadingScreen.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 300);
}

// Canvas initialization
const projectContainer = document.querySelector('.ProjectAnimationContent .BoiteAnimation');
const projectCanvas = document.getElementById('projectAnimation');

const appProject = new PIXI.Application({
  view: projectCanvas,
  width: projectContainer.clientWidth,
  height: projectContainer.clientHeight,
  backgroundAlpha: 0,
  antialias: true
});

let projectAnim = null;
let projectAccessAnim = null;

const animations = {};

// Projects data
const projects = [
  { name: 'Mushroom Oven', animation: 'TVProjectBase' },
  { name: 'Research Paper', animation: 'TVProjectBase' },
  { name: 'Turning Traditional Printer Into Bioprinter', animation: 'TVProjectBase' }
];

let currentProjectIndex = 0;
let buttonAnimating = false;

// Preload animations
Promise.all([
  preloadAnimation('TVProjectBase'),
  preloadAnimation('KeyAccessAnimation'),
  preloadAnimation('TVProjectAccess')
]).then(() => {
  console.log("Toutes les animations du Project préchargées !");
  hideLoadingScreen();
  displayProjectAnimation('TVProjectBase');
  initProjectDoorButton();
});

function preloadAnimation(fileNameBase) {
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
        
        appProject.stage.addChild(warmupSprite);
        appProject.render();
        appProject.stage.removeChild(warmupSprite);
        warmupSprite.destroy();
        
        updateLoadingBar();
        resolve();
      });
    });
}

function displayProjectAnimation(name) {
  if (!animations[name]) {
    console.error("Animation non préchargée:", name);
    return;
  }

  if (projectAnim) {
    appProject.stage.removeChild(projectAnim);
    projectAnim.destroy();
  }

  projectAnim = new PIXI.AnimatedSprite(animations[name]);
  projectAnim.anchor.set(0.5);
  projectAnim.animationSpeed = 0.15;
  projectAnim.loop = true;

  updateProjectAnimationScale();
  appProject.stage.addChild(projectAnim);
  projectAnim.play();
}

function displayProjectButtonAnimation(name) {
  if (!animations[name]) {
    console.error("Animation non préchargée:", name);
    return;
  }

  if (projectButtonAnim) {
    appProjectButton.stage.removeChild(projectButtonAnim);
    projectButtonAnim.destroy();
  }

  projectButtonAnim = new PIXI.AnimatedSprite(animations[name]);
  projectButtonAnim.anchor.set(0.5);
  projectButtonAnim.animationSpeed = 0.15;
  projectButtonAnim.loop = true;

  updateProjectButtonAnimationScale();
  appProjectButton.stage.addChild(projectButtonAnim);
  projectButtonAnim.play();
}

function updateProjectAnimationScale() {
  if (!projectAnim) return;

  projectAnim.x = appProject.screen.width / 2;
  projectAnim.y = appProject.screen.height / 2;

  const firstFrame = projectAnim.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  const scaleX = appProject.screen.width / frameWidth;
  const scaleY = appProject.screen.height / frameHeight;
  projectAnim.scale.set(Math.min(scaleX, scaleY));
}

function initProjectDoorButton() {
  const doorButton = document.getElementById('projectDoorButton');
  doorButton.style.backgroundImage = "url('KeyAccess.png')";
  
  doorButton.addEventListener('click', onDoorButtonClick);
}

function onDoorButtonClick() {
  if (buttonAnimating) return;
  
  buttonAnimating = true;
  const doorButton = document.getElementById('projectDoorButton');
  
  // Lancer l'animation TVAccessButton
  playAccessButtonAnimation();
}

function playAccessButtonAnimation() {
  if (!animations['KeyAccessAnimation']) {
    console.error("Animation KeyAccessAnimation non préchargée");
    return;
  }

  const doorButton = document.getElementById('projectDoorButton');
  
  // Canvas à la taille du bouton
  const canvasWidth = 88;
  const canvasHeight = 88;
  
  // Créer un canvas dans le bouton pour afficher l'animation
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasWidth;
  tempCanvas.height = canvasHeight;
  tempCanvas.style.position = 'absolute';
  tempCanvas.style.width = '88px';
  tempCanvas.style.height = '88px';
  tempCanvas.style.top = '0';
  tempCanvas.style.left = '0';
  tempCanvas.style.imageRendering = 'pixelated';
  doorButton.style.backgroundImage = 'none';
  doorButton.style.position = 'relative';
  doorButton.appendChild(tempCanvas);

  const appAccessButton = new PIXI.Application({
    view: tempCanvas,
    width: canvasWidth,
    height: canvasHeight,
    backgroundAlpha: 0,
    antialias: false
  });

  const keyAccessAnim = new PIXI.AnimatedSprite(animations['KeyAccessAnimation']);
  keyAccessAnim.anchor.set(0.5);
  keyAccessAnim.animationSpeed = 0.15;
  keyAccessAnim.loop = false;

  keyAccessAnim.x = canvasWidth / 2;
  keyAccessAnim.y = canvasHeight / 2;

  const firstFrame = keyAccessAnim.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  
  // Calculer le scale pour remplir le canvas
  const scaleX = canvasWidth / frameWidth;
  const scaleY = canvasHeight / frameHeight;
  const scale = Math.min(scaleX, scaleY);
  
  keyAccessAnim.scale.set(scale);

  appAccessButton.stage.addChild(keyAccessAnim);

  // Quand l'animation est terminée
  keyAccessAnim.onComplete = () => {
    // Rendre le bouton transparent pour laisser voir le background blanc
    doorButton.style.backgroundColor = 'transparent';
    doorButton.style.backgroundImage = 'none';
    doorButton.removeChild(tempCanvas);
    doorButton.style.position = '';
    
    // Nettoyer le canvas
    appAccessButton.destroy();
    
    // Lancer l'animation TVProjectAccess
    playProjectAccessAnimation();
  };

  keyAccessAnim.play();
}

function playProjectAccessAnimation() {
  if (!animations['TVProjectAccess']) {
    console.error("Animation TVProjectAccess non préchargée");
    return;
  }

  if (projectAccessAnim) {
    appProject.stage.removeChild(projectAccessAnim);
    projectAccessAnim.destroy();
  }

  projectAccessAnim = new PIXI.AnimatedSprite(animations['TVProjectAccess']);
  projectAccessAnim.anchor.set(0.5);
  projectAccessAnim.animationSpeed = 0.15;
  projectAccessAnim.loop = false;

  projectAccessAnim.x = appProject.screen.width / 2;
  projectAccessAnim.y = appProject.screen.height / 2;

  const firstFrame = projectAccessAnim.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  const scaleX = appProject.screen.width / frameWidth;
  const scaleY = appProject.screen.height / frameHeight;
  projectAccessAnim.scale.set(Math.min(scaleX, scaleY));

  appProject.stage.addChild(projectAccessAnim);

  // Quand l'animation est terminée, rediriger
  projectAccessAnim.onComplete = () => {
    console.log("Animation TVProjectAccess terminée, redirection...");
    // Rediriger vers la page du projet avec URL absolue
    const projectName = projects[currentProjectIndex].name;
    
    // Mapper les noms aux URLs
    const projectUrls = {
      'Mushroom Oven': 'MushroomOven/mushroom-oven.html',
      'Research Paper': 'ResearchPapers/research-paper.html',
      'Turning Traditional Printer Into Bioprinter': 'Bioprinter/bioprinter.html'
    };
    
    const url = projectUrls[projectName];
    if (url) {
      const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
      const fullUrl = baseUrl + '/' + url;
      window.location.href = fullUrl;
    }
  };

  projectAccessAnim.play();
}

function updateProjectDisplay() {
  const project = projects[currentProjectIndex];
  document.querySelector('.optionDisplayProject').textContent = project.name;
  displayProjectAnimation(project.animation);
}

window.addEventListener('resize', () => {
  appProject.renderer.resize(projectContainer.clientWidth, projectContainer.clientHeight);
  updateProjectAnimationScale();
});

// Navigation controls
const prevBtnProject = document.getElementById('prevBtnProject');
const nextBtnProject = document.getElementById('nextBtnProject');

prevBtnProject.addEventListener('click', () => {
  if (buttonAnimating) return;
  
  currentProjectIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
  updateProjectDisplay();
  
  // Réinitialiser le bouton
  const doorButton = document.getElementById('projectDoorButton');
  doorButton.style.backgroundImage = "url('KeyAccess.png')";
  doorButton.style.backgroundColor = 'transparent';
  buttonAnimating = false;
});

nextBtnProject.addEventListener('click', () => {
  if (buttonAnimating) return;
  
  currentProjectIndex = (currentProjectIndex + 1) % projects.length;
  updateProjectDisplay();
  
  // Réinitialiser le bouton
  const doorButton = document.getElementById('projectDoorButton');
  doorButton.style.backgroundImage = "url('KeyAccess.png')";
  doorButton.style.backgroundColor = 'transparent';
  buttonAnimating = false;
});

// Initialize display
updateProjectDisplay();
