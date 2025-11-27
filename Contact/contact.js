// Canvas Contact Animation
const contactContainer = document.querySelector('.boiteContactAnimation');
const contactCanvas = document.getElementById('contactCanvas');

const appContact = new PIXI.Application({
  view: contactCanvas,
  width: contactContainer.clientWidth,
  height: contactContainer.clientHeight,
  backgroundAlpha: 0,
  antialias: true
});

let contactAnimMenu = null;

// Charger et afficher l'animation Contact
async function loadContactAnimation() {
  const jsonPath = 'Contact.json';
  const pngPath = 'Contact.png';

  try {
    const response = await fetch(jsonPath);
    const data = await response.json();

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

    contactAnimMenu = new PIXI.AnimatedSprite(frames);
    contactAnimMenu.anchor.set(0.5);
    contactAnimMenu.animationSpeed = 0.10;
    contactAnimMenu.loop = true;

    updateContactAnimationScale();
    appContact.stage.addChild(contactAnimMenu);
    contactAnimMenu.play();
  } catch (error) {
    console.error("Erreur lors du chargement de l'animation Contact:", error);
  }
}

function updateContactAnimationScale() {
  if (!contactAnimMenu) return;

  contactAnimMenu.x = appContact.screen.width / 2;
  contactAnimMenu.y = appContact.screen.height / 2;

  const firstFrame = contactAnimMenu.textures[0];
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;
  const scaleX = appContact.screen.width / frameWidth;
  const scaleY = appContact.screen.height / frameHeight;
  contactAnimMenu.scale.set(Math.min(scaleX, scaleY));
}

window.addEventListener('resize', () => {
  appContact.renderer.resize(contactContainer.clientWidth, contactContainer.clientHeight);
  updateContactAnimationScale();
});

// Charger l'animation au démarrage
loadContactAnimation();

// Gestion du compteur de caractères
const messageTextarea = document.getElementById('message');
const wordCountValue = document.getElementById('wordCountValue');
const MAX_CHARS = 1000;

messageTextarea.addEventListener('input', () => {
  let charCount = messageTextarea.value.length;

  if (charCount > MAX_CHARS) {
    // Limiter au maximum de caractères
    messageTextarea.value = messageTextarea.value.substring(0, MAX_CHARS);
    charCount = MAX_CHARS;
  }

  wordCountValue.textContent = charCount;
});

// Gestion du formulaire
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value ;

  // Créer un mailto link avec tous les paramètres
  const subject = `Message from ${name}`;
  const body = `${message}\n\nFrom: ${email}`;
  const mailtoLink = `mailto:lucas.jourdet@edu.devinci.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
});
