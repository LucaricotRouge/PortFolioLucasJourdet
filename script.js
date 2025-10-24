const container = document.querySelector('.BoiteAnimation');

const app = new PIXI.Application({
  width: container.clientWidth,
  height: container.clientHeight,
  backgroundAlpha: 0
});

container.appendChild(app.view);

// Charger JSON et PNG depuis le bon dossier
fetch('Animations/Animation0Base/Imprimante3DBase.json')
  .then(res => res.json())
  .then(data => {
      const texture = PIXI.Texture.from('Animations/Animation0Base/Imprimante3DBase.png');
      const frames = [];

      for (let key in data.frames) {
          const frame = data.frames[key].frame;
          const frameTex = new PIXI.Texture(
              texture,
              new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h)
          );
          frames.push(frameTex);
      }

      const anim = new PIXI.AnimatedSprite(frames);
      anim.animationSpeed = 0.15;
      anim.loop = true;
      anim.play();

      anim.anchor.set(0.5);
      anim.x = app.screen.width / 2;
      anim.y = app.screen.height / 2;

      // Ajuste l’échelle pour tenir dans la div
      const scaleX = app.screen.width / frames[0].width;
      const scaleY = app.screen.height / frames[0].height;
      anim.scale.set(Math.min(scaleX, scaleY));

      app.stage.addChild(anim);
  })
  .catch(err => console.error('Erreur JSON ou PNG:', err));
