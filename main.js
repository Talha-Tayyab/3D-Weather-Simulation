let scene, camera, renderer, gridHelper;
let weatherElements = [];
let weatherType = ''; 
let weatherIntensity = 0.5; 
let weatherSpeed = 1; 
let windSpeed = 0; 
let timeOfDay = 'day'; 
let ambientLight, directionalLight;
let lightningInterval;

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Add lights
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); 
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Initialize weather elements
    createWeatherElements();

    // Render scene
    animate();
}

function createWeatherElements() {
    // Remove existing elements and clear interval if it exists
    weatherElements.forEach(element => scene.remove(element));
    weatherElements = [];
    scene.fog = null;

    if (lightningInterval) {
        clearInterval(lightningInterval);
        lightningInterval = null;
        renderer.setClearColor(0x000000); // Reset background after thunderstorm
    }

    // Add weather elements based on current weather type
    switch (weatherType) {
        case 'rainy':
            renderer.setClearColor(0x777777); // Grey for rainy
            addRain();
            break;
        case 'snowy':
            renderer.setClearColor(0xcccccc); // Light grey for snowy
            addSnow();
            break;
        case 'foggy':
            renderer.setClearColor(0xb0c4de); // Light steel blue for foggy
            scene.fog = new THREE.FogExp2(0xb0c4de, 0.05 * weatherIntensity);
            break;
        case 'cloudy':
            renderer.setClearColor(0x708090); // Slate grey for cloudy
            addClouds();
            break;
        case 'thunderstorm':
            renderer.setClearColor(0x2f4f4f); // Dark slate grey for thunderstorm
            addRain();
            addLightning();
            break;
        case 'windy':
            renderer.setClearColor(0x87ceeb); // Light blue for windy
            addWindEffect();
            break;
    }

    // Update scene based on time of day
    updateTimeOfDay();
}

function addRain() {
    const geometry = new THREE.CylinderGeometry(0.05 * weatherIntensity, 0.05 * weatherIntensity, 1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    for (let i = 0; i < 100; i++) {
        const raindrop = new THREE.Mesh(geometry, material);
        raindrop.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
        scene.add(raindrop);
        weatherElements.push(raindrop);
    }
}

function addSnow() {
    const geometry = new THREE.SphereGeometry(0.1 * weatherIntensity, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 100; i++) {
        const snowflake = new THREE.Mesh(geometry, material);
        snowflake.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
        scene.add(snowflake);
        weatherElements.push(snowflake);
    }
}

function addClouds() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xdddddd }); // Light grey for clouds
    for (let i = 0; i < 20; i++) {
        const cloud = new THREE.Mesh(geometry, material);
        cloud.position.set(Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 20 - 10);
        scene.add(cloud);
        weatherElements.push(cloud);
    }
}

function addLightning() {
    // Implement a simple lightning effect by flashing the screen
    lightningInterval = setInterval(() => {
        renderer.setClearColor(0xffffff); // Flash
        setTimeout(() => {
            if (weatherType === 'thunderstorm') { // Ensure still in thunderstorm mode
                renderer.setClearColor(0x2f4f4f); // Dark slate grey
            }
        }, 100);
    }, 5000); // Lightning strikes every 5 seconds
}

function addWindEffect() {
    // Implement wind effect, such as leaves blowing
    const geometry = new THREE.PlaneGeometry(0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }); // Green for leaves
    for (let i = 0; i < 50; i++) {
        const leaf = new THREE.Mesh(geometry, material);
        leaf.position.set(Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 20 - 10);
        leaf.rotation.z = Math.random() * 2 * Math.PI;
        scene.add(leaf);
        weatherElements.push(leaf);
    }
}

function updateTimeOfDay() {
    timeOfDay = document.getElementById('time').value;
    if (timeOfDay === 'day') {
        ambientLight.color.setHex(0xffffff); // White light for day
        ambientLight.intensity = 0.5;
        directionalLight.color.setHex(0xffffff);
        directionalLight.intensity = 0.5;
    } else if (timeOfDay === 'night') {
        ambientLight.color.setHex(0x404040); // Dim light for night
        ambientLight.intensity = 0.1;
        directionalLight.color.setHex(0x404040);
        directionalLight.intensity = 0.2;
    }
}

function updateIntensity() {
    weatherIntensity = parseFloat(document.getElementById('intensity').value);
    document.getElementById('intensity-value').textContent = weatherIntensity.toFixed(1);
    createWeatherElements();
}

function updateSpeed() {
    weatherSpeed = parseFloat(document.getElementById('speed').value);
    document.getElementById('speed-value').textContent = weatherSpeed.toFixed(1);
}

function updateWindSpeed() {
    windSpeed = parseFloat(document.getElementById('wind').value);
    document.getElementById('wind-value').textContent = windSpeed.toFixed(1);
}

function toggleGrid() {
    if (!gridHelper) {
        gridHelper = new THREE.GridHelper(10, 10);
        scene.add(gridHelper);
    } else {
        scene.remove(gridHelper);
        gridHelper = null;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Update animations with wind effect
    weatherElements.forEach(element => {
        if (weatherType === 'rainy' || weatherType === 'snowy' || weatherType === 'windy') {
            element.position.y -= 0.1 * weatherSpeed;
            element.position.x += 0.01 * windSpeed;
            if (element.position.y < -10) {
                element.position.y = 10;
            }
        }
    });

    renderer.render(scene, camera);
}

function setWeather(type) {
    weatherType = type;
    createWeatherElements();
}

// Initialize the scene
init();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
