class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: 40,
      height: 40,
      speed: 5,
      direction: 0,
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
    for (let i = 0; i < 5; i++) {
      this.plants.push({
        x: Math.random() * (this.canvas.width - 30) + 15,
        y: Math.random() * (this.canvas.height - 100) + 50,
        width: 20,
        height: 20,
        collected: false,
      });
    }
  }

  update() {
    // Player movement
    if (this.keys["ArrowLeft"] || this.keys["a"]) {
      this.player.x -= this.player.speed;
      this.player.isMoving = true;
      this.player.direction = Math.PI;
    }
    if (this.keys["ArrowRight"] || this.keys["d"]) {
      this.player.x += this.player.speed;
      this.player.isMoving = true;
      this.player.direction = 0;
    }
    if (this.keys["ArrowUp"] || this.keys["w"]) {
      this.player.y -= this.player.speed;
      this.player.isMoving = true;
      this.player.direction = -Math.PI / 2;
    }
    if (this.keys["ArrowDown"] || this.keys["s"]) {
      this.player.y += this.player.speed;
      this.player.isMoving = true;
      this.player.direction = Math.PI / 2;
    }

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

    // Draw base reef with gradient
    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(
      0,
      `rgb(${50 + growth * 100}, ${150 + growth * 50}, ${200 + growth * 50})`
    );
    gradient.addColorStop(
      1,
      `rgb(${100 + growth * 100}, ${200 + growth * 50}, ${250 + growth * 50})`
    );
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      x,
      y - growth * 20,
      width + growth * 20,
      height + growth * 20
    );

    // Draw coral formations based on stage
    for (let i = 0; i < stage + 1; i++) {
      const coralX = x + (width * (i + 1)) / (stage + 2);
      const coralY = y - growth * 20;

      // Draw multiple coral branches with different patterns
      for (let j = 0; j < 3; j++) {
        this.ctx.beginPath();
        this.ctx.moveTo(coralX, coralY);

        // Create more complex coral patterns based on stage
        const branches = 3 + stage;
        for (let k = 0; k < branches; k++) {
          const angle = (Math.PI * 2 * k) / branches;
          const length = 20 + growth * 10 + Math.sin(Date.now() / 1000 + k) * 5;
          const branchAngle = angle + Math.sin(Date.now() / 1000 + k) * 0.2;

          this.ctx.lineTo(
            coralX + Math.cos(branchAngle) * length,
            coralY + Math.sin(branchAngle) * length
          );
        }

        this.ctx.closePath();

        // Create gradient for coral
        const coralGradient = this.ctx.createRadialGradient(
          coralX,
          coralY,
          0,
          coralX,
          coralY,
          30 + growth * 10
        );
        coralGradient.addColorStop(
          0,
          `rgb(${200 + growth * 55}, ${100 + growth * 50}, ${
            150 + growth * 50
          })`
        );
        coralGradient.addColorStop(
          1,
          `rgb(${150 + growth * 55}, ${50 + growth * 50}, ${100 + growth * 50})`
        );
        this.ctx.fillStyle = coralGradient;
        this.ctx.fill();
      }
    }
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

    // Draw plants
    this.ctx.fillStyle = "#4CAF50";
    this.plants.forEach((plant) => {
      if (!plant.collected) {
        this.ctx.fillRect(plant.x, plant.y, plant.width, plant.height);
      }
    });

    // Draw player (turtle) with updated rotation
    this.ctx.save();
    this.ctx.translate(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );
    this.ctx.rotate(
      this.player.direction +
        (this.player.isMoving ? Math.sin(Date.now() / 100) * 0.2 : 0)
    );

    // Turtle body
    this.ctx.fillStyle = "#2E7D32";
    this.ctx.fillRect(
      -this.player.width / 2,
      -this.player.height / 2,
      this.player.width,
      this.player.height
    );

    // Turtle head
    this.ctx.fillStyle = "#1B5E20";
    this.ctx.fillRect(
      this.player.width / 2 - 15,
      -this.player.height / 2 + 10,
      20,
      20
    );

    // Fins
    this.ctx.fillStyle = "#388E3C";
    this.ctx.fillRect(
      -this.player.width / 2,
      -this.player.height / 2 + 5,
      10,
      30
    );
    this.ctx.fillRect(
      this.player.width / 2 - 10,
      -this.player.height / 2 + 5,
      10,
      30
    );

    this.ctx.restore();
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
