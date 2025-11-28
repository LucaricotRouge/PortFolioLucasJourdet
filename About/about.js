import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('aboutCanvas');
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x696969);

function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    
    const [x, y, z] = Array(3).fill(null).map(() => (Math.random() - 0.5) * 200);
    star.position.set(x, y, z);
    
    scene.add(star);
}

for (let i = 0; i < 500; i++) {
    addStar();
}

const gridHelper = new THREE.GridHelper(50, 50, 0x00ff00, 0x333333);
gridHelper.position.y = -5;
scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000);

const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Animation variables
let model = null;

const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ff00, 10, 200);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 8, 200);
pointLight2.position.set(-5, 5, -5);
scene.add(pointLight2);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
gltfLoader.load('./personnalScan.glb', (gltf) => {
    const object = gltf.scene;
    console.log('Model loaded:', object);
    model = object;
    
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    object.position.sub(center);
    
    object.rotation.y = Math.PI / 2;
    
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                metalness: 0.5,
                roughness: 0.4,
                emissive: 0x0a0a0a,
                emissiveIntensity: 0.3
            });
        }
    });
    scene.add(object);
}, undefined, (error) => {
    console.error('Error loading GLB:', error);
});

const initialCameraPos = { x: 3, y: 7.3, z: -1.5 };
const initialLookAt = { x: 5, y: 7.8, z: -2.5 };
const finalCameraPos = { x: -8, y: -12, z: 5 };
const finalLookAt = { x: 5, y: 7.8, z: -2.5 };

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Calculate scroll progress (0 to 1)
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
    
    // Interpolate camera position using scroll progress
    camera.position.x = initialCameraPos.x + (finalCameraPos.x - initialCameraPos.x) * scrollProgress;
    camera.position.y = initialCameraPos.y + (finalCameraPos.y - initialCameraPos.y) * scrollProgress;
    camera.position.z = initialCameraPos.z + (finalCameraPos.z - initialCameraPos.z) * scrollProgress;
    
    // Interpolate lookAt position
    const lookAtX = initialLookAt.x + (finalLookAt.x - initialLookAt.x) * scrollProgress;
    const lookAtY = initialLookAt.y + (finalLookAt.y - initialLookAt.y) * scrollProgress;
    const lookAtZ = initialLookAt.z + (finalLookAt.z - initialLookAt.z) * scrollProgress;
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    renderer.render(scene, camera);
}

animate();

// GSAP ScrollTrigger animations
gsap.registerPlugin(ScrollTrigger);
window.addEventListener('beforeunload', () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});

// Faire défiler le texte du début à la fin du scroll
gsap.to("#scrollingText", {
  y: -500,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  }
});

// Download CV button
const downloadCVBtn = document.getElementById('downloadCVBtn');
if (downloadCVBtn) {
    downloadCVBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = './CVJourdetLucas.pdf';
        link.download = 'CVJourdetLucas.pdf';
        link.click();
        
    });
}

// Trigger scroll event on load to show about box
window.dispatchEvent(new Event('scroll'));

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
