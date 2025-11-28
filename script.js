const container = document.querySelector('.BoiteAnimation');
const canvas = document.getElementById('animation');

const btnContainer = document.querySelector('.ButtonContainer');
const btnCanvas = document.getElementById('animationBtn');

const animations = {};

const loadingScreen = document.getElementById('loadingScreen');
const loadingFill = document.querySelector('.loadingFill');
const loadingPercent = document.querySelector('.loadingPercent');

let loadedCount = 0;
const totalAnimations = 6;

function updateLoadingBar() {
  loadedCount++;
  const percent = Math.round((loadedCount / totalAnimations) * 100);
  loadingFill.style.width = percent + '%';
  loadingPercent.textContent = percent + '%';
}

function hideLoadingScreen() {
  loadingScreen.style.opacity = '0';
  loadingScreen.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 300);
}

const app = new PIXI.Application({
  view: canvas,
  width: container.clientWidth,
  height: container.clientHeight,
  backgroundAlpha: 0,
  antialias: true
});

const appBtn = new PIXI.Application({
  view: btnCanvas,
  width: btnContainer.clientWidth,
  height: btnContainer.clientHeight,
  backgroundAlpha: 0,
  antialias: true
});

let animMenu = null;

let playAnimation = false;
let btnAnim = null;

Promise.all([
  preloadAnimation("Animation0Base", "Animation0Base"),
  preloadAnimation("Animation1Lab", "Animation1Lab"),
  preloadAnimation("Animation2Project", "Animation2Project"),
  preloadAnimation("Animation3About", "Animation3About"),
  preloadAnimation("Animation4Contact", "Animation4Contact"),
  preloadAnimation("playBtn", "playBtn")
]).then(() => {
  console.log("Toutes les animations préchargées !");
  hideLoadingScreen();
  showAnimation("Animation0Base"); 
});


function preloadAnimation(folder, fileNameBase) {
  const jsonPath = `Animations/${folder}/${fileNameBase}.json`;
  const pngPath = `Animations/${folder}/${fileNameBase}.png`;

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
      
      // Jouer l'animation une fois en background pour initialiser le GPU
      return new Promise(resolve => {
        const warmupSprite = new PIXI.AnimatedSprite(frames);
        warmupSprite.animationSpeed = 0.15;
        warmupSprite.loop = false;
        
        // Jouer hors écran pour ne pas être visible
        warmupSprite.x = -9999;
        warmupSprite.y = -9999;
        
        app.stage.addChild(warmupSprite);
        
        warmupSprite.onComplete = () => {
          app.stage.removeChild(warmupSprite);
          warmupSprite.destroy();
          updateLoadingBar();
          resolve();
        };
        
        warmupSprite.play();
      });
    });
}

function showAnimation(name) {
  if (!animations[name]) {
    console.error("Animation non préchargée :", name);
    return;
  }

  if (animMenu) {
    app.stage.removeChild(animMenu);
    animMenu.destroy();
    animMenu = null;
  }

  animMenu = new PIXI.AnimatedSprite(animations[name]);
  animMenu.anchor.set(0.5);
  animMenu.animationSpeed = 0.15;
  animMenu.loop = !playAnimation;
  animMenu.play();

  // Si une animation est en cours de lecture, ajouter un listener pour charger la page HTML quand elle finit
  if (playAnimation) {
    animMenu.onComplete = () => {
      // Charger la page HTML correspondante
      const pages = {
        0: 'Lab/lab.html',
        1: 'Project/project.html',
        2: 'About/about.html',
        3: 'Contact/contact.html'
      };

      history.pushState({ page: pages[currentOptionIndex] }, '', pages[currentOptionIndex]);
      window.location.href = pages[currentOptionIndex];
    };
  }

  updateAnimationScale();
  app.stage.addChild(animMenu);
}


// Fonction pour mettre à jour la position et l'échelle de l'animation
function updateAnimationScale() {
  if (!animMenu) return;
  
  animMenu.x = app.screen.width / 2;
  animMenu.y = app.screen.height / 2;
  
  // Utiliser les dimensions de la première frame pour le scaling
  const firstFrame = animMenu.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  const scaleX = app.screen.width / frameWidth;
  const scaleY = app.screen.height / frameHeight;
  animMenu.scale.set(Math.min(scaleX, scaleY)); 
}

// Fonction pour mettre à jour la position et l'échelle de l'animation du bouton
function updateBtnAnimationScale() {
  if (!btnAnim) return;
  
  // Positionner au centre horizontalement et en bas verticalement
  btnAnim.x = appBtn.screen.width / 2;
  btnAnim.y = appBtn.screen.height - 60; // 60 pour placer au-dessus de la marge
  
  const firstFrame = btnAnim.textures[0];
  const scaleX = appBtn.screen.width / firstFrame.width;
  const scaleY = appBtn.screen.height / firstFrame.height;
  btnAnim.scale.set(Math.min(scaleX, scaleY));
}


window.addEventListener('resize', () => {
  app.renderer.resize(container.clientWidth, container.clientHeight);
  appBtn.renderer.resize(btnContainer.clientWidth, btnContainer.clientHeight);
  updateAnimationScale();
  updateBtnAnimationScale();
});


const options = ['Lab', 'Project', 'About', 'Contact'];
let currentOptionIndex = 0;

const optionDisplay = document.querySelector('.optionDisplay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playPauseBtn = document.getElementById('playPauseBtn');

function updateOptionDisplay() {
  optionDisplay.textContent = options[currentOptionIndex];
}

prevBtn.addEventListener('click', () => {
  currentOptionIndex = (currentOptionIndex - 1 + options.length) % options.length;
  updateOptionDisplay();
});

nextBtn.addEventListener('click', () => {
  currentOptionIndex = (currentOptionIndex + 1) % options.length;
  updateOptionDisplay();
});

playPauseBtn.addEventListener('click', () => {
  playAnimation = true;
  playPauseBtn.style.visibility = 'hidden';

  if (!btnAnim) {
    btnAnim = new PIXI.AnimatedSprite(animations["playBtn"]);
    btnAnim.anchor.set(0.5);
    btnAnim.animationSpeed = 0.15;
    btnAnim.loop = false;
    
    appBtn.stage.addChild(btnAnim);
  }
  
  updateBtnAnimationScale();
  btnAnim.gotoAndPlay(0);

  // Lancer l'animation correspondante
  const name = `Animation${currentOptionIndex + 1}${options[currentOptionIndex]}`;
  showAnimation(name);
});
