class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;

    // Load turtle image
    this.turtleImage = new Image();
    this.turtleImage.src = "kailey-turtle.png";

    // Add error handling for image loading
    this.turtleImage.onerror = () => {
      console.error("Error loading turtle image");
    };

    this.turtleImage.onload = () => {
      console.log("Turtle image loaded successfully");
    };

    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: 100, // Adjusted for the image
      height: 100, // Adjusted for the image
      speed: 5,
      isMoving: false,
    };

    this.plants = [];
    this.collectedPlants = 0;
    this.reef = {
      x: 50,
      y: this.canvas.height - 100,
      width: 100,
      height: 80,
      growth: 0,
      stage: 0,
      maxStages: 3,
    };

    // Add bubble particles
    this.bubbles = [];
    this.maxBubbles = 20;
    this.generateBubbles();

    // Modify ocean currents to be more elaborate
    this.currents = [
      {
        x: 150,
        y: 100,
        width: 150,
        height: 250,
        strength: 2,
        direction: "right",
        type: "whirlpool",
        rotation: 0,
      },
      {
        x: 500,
        y: 200,
        width: 120,
        height: 180,
        strength: 1.5,
        direction: "left",
        type: "stream",
        waveOffset: 0,
      },
      {
        x: 300,
        y: 400,
        width: 100,
        height: 200,
        strength: 1,
        direction: "up",
        type: "vortex",
        radius: 0,
      },
    ];

    this.keys = {};
    this.setupEventListeners();
    this.generatePlants();
    this.gameLoop();
  }

  generateBubbles() {
    for (let i = 0; i < this.maxBubbles; i++) {
      this.bubbles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + Math.random() * 100,
        size: Math.random() * 10 + 5,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  }

  updateBubbles() {
    this.bubbles.forEach((bubble) => {
      bubble.y -= bubble.speed;
      bubble.x += Math.sin(bubble.y / 30) * 0.5;
      bubble.opacity = Math.max(0, bubble.opacity - 0.001);

      if (bubble.y < -bubble.size) {
        bubble.y = this.canvas.height + Math.random() * 100;
        bubble.x = Math.random() * this.canvas.width;
        bubble.opacity = Math.random() * 0.5 + 0.2;
      }
    });
  }

  updateCurrents() {
    this.currents.forEach((current) => {
      if (this.checkCollision(this.player, current)) {
        switch (current.type) {
          case "whirlpool":
            // Create circular motion
            const centerX = current.x + current.width / 2;
            const centerY = current.y + current.height / 2;
            const dx = this.player.x - centerX;
            const dy = this.player.y - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < current.width / 2) {
              this.player.x += Math.cos(angle + Math.PI / 2) * current.strength;
              this.player.y += Math.sin(angle + Math.PI / 2) * current.strength;
            }
            current.rotation += 0.02;
            break;

          case "stream":
            // Create wave-like motion
            current.waveOffset += 0.05;
            const waveEffect = Math.sin(current.waveOffset) * 2;
            if (current.direction === "left") {
              this.player.x -= current.strength;
              this.player.y += waveEffect;
            }
            break;

          case "vortex":
            // Create spiral motion
            current.radius += 0.1;
            if (current.direction === "up") {
              this.player.y -= current.strength;
              this.player.x += Math.sin(current.radius) * 1.5;
            }
            break;
        }
      }
    });
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  generatePlants() {
    // Clear existing plants
    this.plants = [];

    // Define minimum distance between plants
    const minDistance = 100;
    const maxAttempts = 50;

    // Generate 5 plants with spacing
    for (let i = 0; i < 5; i++) {
      let attempts = 0;
      let validPosition = false;
      let newPlant;

      while (!validPosition && attempts < maxAttempts) {
        // Generate random position
        newPlant = {
          x: Math.random() * (this.canvas.width - 40) + 20, // Keep away from edges
          y: Math.random() * (this.canvas.height - 150) + 50, // Keep away from bottom
          width: 30, // Increased size
          height: 30, // Increased size
          collected: false,
          type: Math.floor(Math.random() * 3), // Random plant type
        };

        // Check if this position is far enough from other plants
        validPosition = true;
        for (const plant of this.plants) {
          const dx = newPlant.x - plant.x;
          const dy = newPlant.y - plant.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      if (validPosition) {
        this.plants.push(newPlant);
      }
    }
  }

  update() {
    // Player movement - removed direction setting since we don't need it anymore
    let isMoving = false;
    if (this.keys["ArrowLeft"] || this.keys["a"]) {
      this.player.x -= this.player.speed;
      isMoving = true;
    }
    if (this.keys["ArrowRight"] || this.keys["d"]) {
      this.player.x += this.player.speed;
      isMoving = true;
    }
    if (this.keys["ArrowUp"] || this.keys["w"]) {
      this.player.y -= this.player.speed;
      isMoving = true;
    }
    if (this.keys["ArrowDown"] || this.keys["s"]) {
      this.player.y += this.player.speed;
      isMoving = true;
    }
    this.player.isMoving = isMoving;

    // Keep player in bounds
    this.player.x = Math.max(
      0,
      Math.min(this.canvas.width - this.player.width, this.player.x)
    );
    this.player.y = Math.max(
      0,
      Math.min(this.canvas.height - this.player.height, this.player.y)
    );

    // Update bubbles and currents
    this.updateBubbles();
    this.updateCurrents();

    // Plant collection
    this.plants.forEach((plant) => {
      if (!plant.collected && this.checkCollision(this.player, plant)) {
        plant.collected = true;
        this.collectedPlants++;
        document.getElementById("plantCount").textContent =
          this.collectedPlants;

        // Grow the reef and update stage
        this.reef.growth = Math.min(1, this.collectedPlants / 5);
        this.reef.stage = Math.floor(this.collectedPlants / 5);

        // Generate new plants when all are collected
        if (this.plants.every((p) => p.collected)) {
          this.generatePlants();
        }
      }
    });
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  drawReef() {
    const { x, y, width, height, growth, stage } = this.reef;

    // Draw sandy bottom
    const sandGradient = this.ctx.createLinearGradient(0, y, 0, y + height);
    sandGradient.addColorStop(0, "#f2d16c");
    sandGradient.addColorStop(1, "#d4b65c");
    this.ctx.fillStyle = sandGradient;
    this.ctx.fillRect(0, y, this.canvas.width, height + 50);

    // Draw coral formations based on stage
    const coralTypes = [
      { color: "#ff7e7e", highlight: "#ff9e9e" }, // Pink coral
      { color: "#ff9649", highlight: "#ffb679" }, // Orange coral
      { color: "#d162a4", highlight: "#e182c4" }, // Purple coral
      { color: "#30b3c4", highlight: "#50d3e4" }, // Blue coral
    ];

    // Draw one coral formation per stage
    for (let i = 0; i < stage; i++) {
      // Calculate position for this coral
      const coralX = (this.canvas.width / (stage + 1)) * (i + 1);
      const coralY = y - height * 0.4; // Slightly higher than before
      const coralType = coralTypes[i % coralTypes.length];

      // Draw larger branching coral
      this.drawBranchingCoral(
        coralX,
        coralY,
        50 + growth * 30, // Larger size
        coralType.color,
        coralType.highlight,
        stage
      );

      // Draw larger bubble coral clusters
      this.drawBubbleCoral(
        coralX + 30,
        coralY + 20,
        25 + growth * 15,
        coralType.color,
        coralType.highlight
      );
    }

    // Draw seaweed spread out across the bottom
    const seaweedSpacing = this.canvas.width / (5 + stage * 2);
    for (let i = 0; i < 5 + stage * 2; i++) {
      const seaweedX = seaweedSpacing * (i + 1);
      this.drawSeaweed(seaweedX, y, 60 + growth * 20);
    }
  }

  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawBranchingCoral(x, y, size, color, highlightColor, stage) {
    const time = Date.now() / 1000;
    const branches = 3 + stage;
    const swayAmount = 0.1;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Draw main branches
    for (let i = 0; i < branches; i++) {
      const angle =
        (i / branches) * Math.PI * 2 + Math.sin(time + i) * swayAmount;
      this.drawCoralBranch(0, 0, angle, size, color, highlightColor, 3);
    }

    this.ctx.restore();
  }

  drawCoralBranch(x, y, angle, length, color, highlightColor, depth) {
    if (depth <= 0) return;

    const time = Date.now() / 1000;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Draw branch
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.lineWidth = depth * 2;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();

    // Draw highlight
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.lineWidth = depth;
    this.ctx.strokeStyle = highlightColor;
    this.ctx.stroke();

    // Draw sub-branches
    const branchCount = 2;
    for (let i = 0; i < branchCount; i++) {
      const newAngle =
        angle + (Math.PI / 4) * (i - 0.5) + Math.sin(time + depth) * 0.1;
      this.drawCoralBranch(
        endX,
        endY,
        newAngle,
        length * 0.7,
        color,
        highlightColor,
        depth - 1
      );
    }
  }

  drawBubbleCoral(x, y, size, color, highlightColor) {
    const bubbleCount = 5;
    const time = Date.now() / 1000;

    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * Math.PI * 2;
      const distance = size * 0.5;
      const bubbleX = x + Math.cos(angle) * distance;
      const bubbleY = y + Math.sin(angle) * distance + Math.sin(time + i) * 2;
      const bubbleSize = size * (0.3 + Math.sin(time * 2 + i) * 0.1);

      // Draw main bubble
      this.ctx.beginPath();
      this.ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();

      // Draw highlight
      this.ctx.beginPath();
      this.ctx.arc(
        bubbleX - bubbleSize * 0.2,
        bubbleY - bubbleSize * 0.2,
        bubbleSize * 0.8,
        0,
        Math.PI * 2
      );
      this.ctx.fillStyle = highlightColor;
      this.ctx.fill();
    }
  }

  drawSeaweed(x, y, height) {
    const segments = 10;
    const segmentHeight = height / segments;
    const time = Date.now() / 1000;
    const frequency = 3;
    const amplitude = 15;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    for (let i = 0; i <= segments; i++) {
      const segmentY = y - i * segmentHeight;
      const swayAmount = Math.sin(time * frequency + i * 0.5) * amplitude;
      const segmentX = x + swayAmount;

      if (i === 0) {
        this.ctx.moveTo(segmentX, segmentY);
      } else {
        this.ctx.lineTo(segmentX, segmentY);
      }
    }

    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "#2d9b27";
    this.ctx.stroke();

    // Draw highlight
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#3cc636";
    this.ctx.stroke();
  }

  drawBubbles() {
    this.bubbles.forEach((bubble) => {
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
      this.ctx.fill();
    });
  }

  drawCurrents() {
    this.currents.forEach((current) => {
      this.ctx.save();

      switch (current.type) {
        case "whirlpool":
          // Draw spiral pattern
          this.ctx.translate(
            current.x + current.width / 2,
            current.y + current.height / 2
          );
          this.ctx.rotate(current.rotation);
          this.ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const radius = current.width / 2;
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          this.ctx.strokeStyle = "rgba(0, 150, 255, 0.3)";
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          break;

        case "stream":
          // Draw wave pattern
          this.ctx.beginPath();
          this.ctx.moveTo(current.x, current.y);
          for (let x = 0; x < current.width; x += 5) {
            const y = Math.sin(x / 20 + current.waveOffset) * 10;
            this.ctx.lineTo(current.x + x, current.y + y);
          }
          this.ctx.strokeStyle = "rgba(0, 150, 255, 0.2)";
          this.ctx.lineWidth = 3;
          this.ctx.stroke();
          break;

        case "vortex":
          // Draw spiral pattern
          this.ctx.translate(
            current.x + current.width / 2,
            current.y + current.height / 2
          );
          this.ctx.beginPath();
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const radius = (current.width / 2) * (1 - i / 12);
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          }
          this.ctx.strokeStyle = "rgba(0, 150, 255, 0.3)";
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          break;
      }

      this.ctx.restore();
    });
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background elements
    this.drawBubbles();
    this.drawCurrents();
    this.drawReef();

    // Draw plants with more interesting visuals
    this.plants.forEach((plant) => {
      if (!plant.collected) {
        const plantX = plant.x + plant.width / 2;
        const plantY = plant.y + plant.height / 2;
        const time = Date.now() / 1000;

        // Draw plant base
        this.ctx.beginPath();
        this.ctx.arc(plantX, plantY, plant.width / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = "#4CAF50";
        this.ctx.fill();
        this.ctx.strokeStyle = "#2E7D32";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw plant details based on type
        switch (plant.type) {
          case 0: // Seaweed-like
            for (let i = 0; i < 3; i++) {
              this.ctx.beginPath();
              this.ctx.moveTo(plantX - 10 + i * 10, plantY);
              this.ctx.quadraticCurveTo(
                plantX - 5 + i * 10 + Math.sin(time * 2) * 5,
                plantY - 15,
                plantX - 10 + i * 10,
                plantY - 30
              );
              this.ctx.strokeStyle = "#81C784";
              this.ctx.lineWidth = 4;
              this.ctx.stroke();
            }
            break;
          case 1: // Star-shaped
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2;
              this.ctx.beginPath();
              this.ctx.moveTo(plantX, plantY);
              this.ctx.lineTo(
                plantX + Math.cos(angle) * plant.width * 0.7,
                plantY + Math.sin(angle) * plant.height * 0.7
              );
              this.ctx.strokeStyle = "#81C784";
              this.ctx.lineWidth = 5;
              this.ctx.stroke();
            }
            break;
          case 2: // Bubble cluster
            for (let i = 0; i < 4; i++) {
              const angle = (i / 4) * Math.PI * 2;
              const bubbleX = plantX + Math.cos(angle) * 10;
              const bubbleY =
                plantY + Math.sin(angle) * 10 + Math.sin(time * 2 + i) * 3;
              this.ctx.beginPath();
              this.ctx.arc(bubbleX, bubbleY, 8, 0, Math.PI * 2);
              this.ctx.fillStyle = "#A5D6A7";
              this.ctx.fill();
              this.ctx.strokeStyle = "#81C784";
              this.ctx.lineWidth = 2;
              this.ctx.stroke();
            }
            break;
        }
      }
    });

    // Draw player (turtle)
    if (this.turtleImage.complete) {
      this.ctx.save();
      const bobOffset = this.player.isMoving
        ? Math.sin(Date.now() / 100) * 3
        : 0;
      this.ctx.drawImage(
        this.turtleImage,
        this.player.x,
        this.player.y + bobOffset,
        this.player.width,
        this.player.height
      );
      this.ctx.restore();
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  new Game();
});
