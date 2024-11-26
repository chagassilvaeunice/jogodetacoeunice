let gatoPos, cachorroPos, ratoPos;
let ratoVel;
let gameDuration = 1 * 60 * 1000; // 1 minuto em milissegundos
let gameEnd;
let moedasGato = 0;
let moedasCachorro = 0;
let gameOver = false;
let baloes = []; // Array para balões

function setup() {
  createCanvas(800, 400);
  resetGame();
}

function draw() {
  background(100, 200, 100); // Fundo verde
  drawField();
  drawPlayers();
  
  if (!gameOver) {
    moveRato();
    smoothMoveGato();
    smoothMoveCachorro();
    checkCollisions();
    checkPlayersCollision();
    checkGoal();
    displayTimer();
    displayMoedas();
  } else {
    displayGameOver();
    releaseBaloes();
  }

  // Desenha balões e remove os que saíram da tela
  for (let i = baloes.length - 1; i >= 0; i--) {
    baloes[i].display();
    baloes[i].update();
    if (baloes[i].y < -50) {
      baloes.splice(i, 1); // Remove balão que saiu da tela
    }
  }
}

// Campo com traves
function drawField() {
  stroke(255);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);

  fill(255, 0, 0);
  rect(10, height / 2 - 50, 10, 150);
  fill(0, 0, 255);
  rect(width - 20, height / 2 - 50, 10, 150);
}

// Desenha jogadores e rato
function drawPlayers() {
  fill(200, 100, 100);
  ellipse(gatoPos.x, gatoPos.y, 50, 50);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Gato", gatoPos.x, gatoPos.y + 5);

  fill(100, 100, 200);
  ellipse(cachorroPos.x, cachorroPos.y, 50, 50);
  fill(0);
  text("Cachorro", cachorroPos.x, cachorroPos.y + 5);

  fill(150, 150, 150);
  ellipse(ratoPos.x, ratoPos.y, 20, 20);
}

// Movimento do rato com bordas para rebater
function moveRato() {
  ratoPos.add(ratoVel);
  ratoPos.x = constrain(ratoPos.x, 20, width - 20);
  ratoPos.y = constrain(ratoPos.y, 0, height);

  if (ratoPos.y <= 0 || ratoPos.y >= height) ratoVel.y *= -1;
  if (ratoPos.x <= 20 || ratoPos.x >= width - 20) ratoVel.x *= -1;
}

// Movimento suavizado do gato
function smoothMoveGato() {
  if (ratoPos.x < width / 2) {
    let targetY = ratoPos.y;
    gatoPos.y = lerp(gatoPos.y, targetY, 0.05); // Movimento suave
  }
  gatoPos.y = constrain(gatoPos.y, 0, height);
}

// Movimento suavizado do cachorro
function smoothMoveCachorro() {
  if (ratoPos.x > width / 2) {
    let targetY = ratoPos.y;
    cachorroPos.y = lerp(cachorroPos.y, targetY, 0.05); // Movimento suave
  }
  cachorroPos.y = constrain(cachorroPos.y, 0, height);
}

// Colisão do rato com jogadores
function checkCollisions() {
  if (dist(ratoPos.x, ratoPos.y, gatoPos.x, gatoPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, gatoPos);
    direction.setMag(6);
    ratoVel = direction;
  }
  if (dist(ratoPos.x, ratoPos.y, cachorroPos.x, cachorroPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, cachorroPos);
    direction.setMag(6);
    ratoVel = direction;
  }
}

// Impedir sobreposição entre gato e cachorro
function checkPlayersCollision() {
  let distance = dist(gatoPos.x, gatoPos.y, cachorroPos.x, cachorroPos.y);
  if (distance < 50) {
    let repel = p5.Vector.sub(cachorroPos, gatoPos);
    repel.setMag(3); // Suaviza a separação
    gatoPos.sub(repel);
    cachorroPos.add(repel);
  }
}

// Verifica se o rato entra no gol
function checkGoal() {
  if (ratoPos.x > width - 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasGato++;
    resetRato();
  }
  if (ratoPos.x < 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasCachorro++;
    resetRato();
  }
}

// Reseta a posição do rato
function resetRato() {
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
}

// Exibe temporizador
function displayTimer() {
  fill(0);
  textSize(20);
  let timeLeft = max(0, gameEnd - millis());
  let minutes = floor(timeLeft / 60000);
  let seconds = floor((timeLeft % 60000) / 1000);
  text(`Tempo: ${nf(minutes, 2)}:${nf(seconds, 2)}`, width / 2 - 50, 30);

  if (timeLeft <= 0) {
    gameOver = true;
  }
}

// Exibe moedas com símbolo
function displayMoedas() {
  textSize(20);
  fill(0);
  text(`💰 ${moedasGato}`, 60, 30);
  text(`💰 ${moedasCachorro}`, width - 60, 30);
}

// Tela de fim de jogo e vencedor
function displayGameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Fim de jogo!", width / 2, height / 3);

  if (moedasGato > moedasCachorro) {
    textSize(24);
    text("Gato venceu com mais moedas!", width / 2, height / 2);
  } else if (moedasCachorro > moedasGato) {
    textSize(24);
    text("Cachorro venceu com mais moedas!", width / 2, height / 2);
  } else {
    textSize(24);
    text("Empate! Ambos têm o mesmo número de moedas!", width / 2, height / 2);
  }

  textSize(20);
  text("Pressione 'R' para jogar novamente ou 'Q' para sair.", width / 2, height / 1.5);
}

// Soltar balões de celebração
function releaseBaloes() {
  if (frameCount % 10 === 0 && baloes.length < 30) { // Limite de balões
    let balao = new Balao(random(width / 4, 3 * width / 4), height, random(1, 2));
    baloes.push(balao);
  }
}

// Reseta o jogo
function resetGame() {
  moedasGato = 0;
  moedasCachorro = 0;
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
  gatoPos = createVector(50, height / 2);
  cachorroPos = createVector(width - 50, height / 2);
  gameEnd = millis() + gameDuration;
  gameOver = false;
  baloes = [];
}

// Reinício do jogo com tecla
function keyPressed() {
  if (gameOver) {
    if (key === 'R' || key === 'r') resetGame();
    if (key === 'Q' || key === 'q') noLoop();
  }
}
let gatoPos, cachorroPos, ratoPos;
let ratoVel;
let gameDuration = 1 * 60 * 1000; // 1 minuto em milissegundos
let gameEnd;
let moedasGato = 0;
let moedasCachorro = 0;
let gameOver = false;
let baloes = []; // Array para balões

function setup() {
  createCanvas(800, 400);
  resetGame();
}

function draw() {
  background(100, 200, 100); // Fundo verde
  drawField();
  drawPlayers();
  
  if (!gameOver) {
    moveRato();
    smoothMoveGato();
    smoothMoveCachorro();
    checkCollisions();
    checkPlayersCollision();
    checkGoal();
    displayTimer();
    displayMoedas();
  } else {
    displayGameOver();
    releaseBaloes();
  }

  // Desenha balões e remove os que saíram da tela
  for (let i = baloes.length - 1; i >= 0; i--) {
    baloes[i].display();
    baloes[i].update();
    if (baloes[i].y < -50) {
      baloes.splice(i, 1); // Remove balão que saiu da tela
    }
  }
}

// Campo com traves
function drawField() {
  stroke(255);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);

  fill(255, 0, 0);
  rect(10, height / 2 - 50, 10, 150);
  fill(0, 0, 255);
  rect(width - 20, height / 2 - 50, 10, 150);
}

// Desenha jogadores e rato
function drawPlayers() {
  fill(200, 100, 100);
  ellipse(gatoPos.x, gatoPos.y, 50, 50);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Gato", gatoPos.x, gatoPos.y + 5);

  fill(100, 100, 200);
  ellipse(cachorroPos.x, cachorroPos.y, 50, 50);
  fill(0);
  text("Cachorro", cachorroPos.x, cachorroPos.y + 5);

  fill(150, 150, 150);
  ellipse(ratoPos.x, ratoPos.y, 20, 20);
}

// Movimento do rato com bordas para rebater
function moveRato() {
  ratoPos.add(ratoVel);
  ratoPos.x = constrain(ratoPos.x, 20, width - 20);
  ratoPos.y = constrain(ratoPos.y, 0, height);

  if (ratoPos.y <= 0 || ratoPos.y >= height) ratoVel.y *= -1;
  if (ratoPos.x <= 20 || ratoPos.x >= width - 20) ratoVel.x *= -1;
}

// Movimento suavizado do gato
function smoothMoveGato() {
  if (ratoPos.x < width / 2) {
    let targetY = ratoPos.y;
    gatoPos.y = lerp(gatoPos.y, targetY, 0.05); // Movimento suave
  }
  gatoPos.y = constrain(gatoPos.y, 0, height);
}

// Movimento suavizado do cachorro
function smoothMoveCachorro() {
  if (ratoPos.x > width / 2) {
    let targetY = ratoPos.y;
    cachorroPos.y = lerp(cachorroPos.y, targetY, 0.05); // Movimento suave
  }
  cachorroPos.y = constrain(cachorroPos.y, 0, height);
}

// Colisão do rato com jogadores
function checkCollisions() {
  if (dist(ratoPos.x, ratoPos.y, gatoPos.x, gatoPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, gatoPos);
    direction.setMag(6);
    ratoVel = direction;
  }
  if (dist(ratoPos.x, ratoPos.y, cachorroPos.x, cachorroPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, cachorroPos);
    direction.setMag(6);
    ratoVel = direction;
  }
}

// Impedir sobreposição entre gato e cachorro
function checkPlayersCollision() {
  let distance = dist(gatoPos.x, gatoPos.y, cachorroPos.x, cachorroPos.y);
  if (distance < 50) {
    let repel = p5.Vector.sub(cachorroPos, gatoPos);
    repel.setMag(3); // Suaviza a separação
    gatoPos.sub(repel);
    cachorroPos.add(repel);
  }
}

// Verifica se o rato entra no gol
function checkGoal() {
  if (ratoPos.x > width - 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasGato++;
    resetRato();
  }
  if (ratoPos.x < 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasCachorro++;
    resetRato();
  }
}

// Reseta a posição do rato
function resetRato() {
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
}

// Exibe temporizador
function displayTimer() {
  fill(0);
  textSize(20);
  let timeLeft = max(0, gameEnd - millis());
  let minutes = floor(timeLeft / 60000);
  let seconds = floor((timeLeft % 60000) / 1000);
  text(`Tempo: ${nf(minutes, 2)}:${nf(seconds, 2)}`, width / 2 - 50, 30);

  if (timeLeft <= 0) {
    gameOver = true;
  }
}

// Exibe moedas com símbolo
function displayMoedas() {
  textSize(20);
  fill(0);
  text(`💰 ${moedasGato}`, 60, 30);
  text(`💰 ${moedasCachorro}`, width - 60, 30);
}

// Tela de fim de jogo e vencedor
function displayGameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Fim de jogo!", width / 2, height / 3);

  if (moedasGato > moedasCachorro) {
    textSize(24);
    text("Gato venceu com mais moedas!", width / 2, height / 2);
  } else if (moedasCachorro > moedasGato) {
    textSize(24);
    text("Cachorro venceu com mais moedas!", width / 2, height / 2);
  } else {
    textSize(24);
    text("Empate! Ambos têm o mesmo número de moedas!", width / 2, height / 2);
  }

  textSize(20);
  text("Pressione 'R' para jogar novamente ou 'Q' para sair.", width / 2, height / 1.5);
}

// Soltar balões de celebraçãolet gatoPos, cachorroPos, ratoPos;
let ratoVel;
let gameDuration = 1 * 60 * 1000; // 1 minuto em milissegundos
let gameEnd;
let moedasGato = 0;
let moedasCachorro = 0;
let gameOver = false;
let baloes = []; // Array para balões

function setup() {
  createCanvas(800, 400);
  resetGame();
}

function draw() {
  background(100, 200, 100); // Fundo verde
  drawField();
  drawPlayers();
  
  if (!gameOver) {
    moveRato();
    smoothMoveGato();
    smoothMoveCachorro();
    checkCollisions();
    checkPlayersCollision();
    checkGoal();
    displayTimer();
    displayMoedas();
  } else {
    displayGameOver();
    releaseBaloes();
  }

  // Desenha balões e remove os que saíram da tela
  for (let i = baloes.length - 1; i >= 0; i--) {
    baloes[i].display();
    baloes[i].update();
    if (baloes[i].y < -50) {
      baloes.splice(i, 1); // Remove balão que saiu da tela
    }
  }
}

// Campo com traves
function drawField() {
  stroke(255);
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);

  fill(255, 0, 0);
  rect(10, height / 2 - 50, 10, 150);
  fill(0, 0, 255);
  rect(width - 20, height / 2 - 50, 10, 150);
}

// Desenha jogadores e rato
function drawPlayers() {
  fill(200, 100, 100);
  ellipse(gatoPos.x, gatoPos.y, 50, 50);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Gato", gatoPos.x, gatoPos.y + 5);

  fill(100, 100, 200);
  ellipse(cachorroPos.x, cachorroPos.y, 50, 50);
  fill(0);
  text("Cachorro", cachorroPos.x, cachorroPos.y + 5);

  fill(150, 150, 150);
  ellipse(ratoPos.x, ratoPos.y, 20, 20);
}

// Movimento do rato com bordas para rebater
function moveRato() {
  ratoPos.add(ratoVel);
  ratoPos.x = constrain(ratoPos.x, 20, width - 20);
  ratoPos.y = constrain(ratoPos.y, 0, height);

  if (ratoPos.y <= 0 || ratoPos.y >= height) ratoVel.y *= -1;
  if (ratoPos.x <= 20 || ratoPos.x >= width - 20) ratoVel.x *= -1;
}

// Movimento suavizado do gato
function smoothMoveGato() {
  if (ratoPos.x < width / 2) {
    let targetY = ratoPos.y;
    gatoPos.y = lerp(gatoPos.y, targetY, 0.05); // Movimento suave
  }
  gatoPos.y = constrain(gatoPos.y, 0, height);
}

// Movimento suavizado do cachorro
function smoothMoveCachorro() {
  if (ratoPos.x > width / 2) {
    let targetY = ratoPos.y;
    cachorroPos.y = lerp(cachorroPos.y, targetY, 0.05); // Movimento suave
  }
  cachorroPos.y = constrain(cachorroPos.y, 0, height);
}

// Colisão do rato com jogadores
function checkCollisions() {
  if (dist(ratoPos.x, ratoPos.y, gatoPos.x, gatoPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, gatoPos);
    direction.setMag(6);
    ratoVel = direction;
  }
  if (dist(ratoPos.x, ratoPos.y, cachorroPos.x, cachorroPos.y) < 35) {
    let direction = p5.Vector.sub(ratoPos, cachorroPos);
    direction.setMag(6);
    ratoVel = direction;
  }
}

// Impedir sobreposição entre gato e cachorro
function checkPlayersCollision() {
  let distance = dist(gatoPos.x, gatoPos.y, cachorroPos.x, cachorroPos.y);
  if (distance < 50) {
    let repel = p5.Vector.sub(cachorroPos, gatoPos);
    repel.setMag(3); // Suaviza a separação
    gatoPos.sub(repel);
    cachorroPos.add(repel);
  }
}

// Verifica se o rato entra no gol
function checkGoal() {
  if (ratoPos.x > width - 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasGato++;
    resetRato();
  }
  if (ratoPos.x < 20 && ratoPos.y > height / 2 - 50 && ratoPos.y < height / 2 + 50) {
    moedasCachorro++;
    resetRato();
  }
}

// Reseta a posição do rato
function resetRato() {
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
}

// Exibe temporizador
function displayTimer() {
  fill(0);
  textSize(20);
  let timeLeft = max(0, gameEnd - millis());
  let minutes = floor(timeLeft / 60000);
  let seconds = floor((timeLeft % 60000) / 1000);
  text(`Tempo: ${nf(minutes, 2)}:${nf(seconds, 2)}`, width / 2 - 50, 30);

  if (timeLeft <= 0) {
    gameOver = true;
  }
}

// Exibe moedas com símbolo
function displayMoedas() {
  textSize(20);
  fill(0);
  text(`💰 ${moedasGato}`, 60, 30);
  text(`💰 ${moedasCachorro}`, width - 60, 30);
}

// Tela de fim de jogo e vencedor
function displayGameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(0);
  text("Fim de jogo!", width / 2, height / 3);

  if (moedasGato > moedasCachorro) {
    textSize(24);
    text("Gato venceu com mais moedas!", width / 2, height / 2);
  } else if (moedasCachorro > moedasGato) {
    textSize(24);
    text("Cachorro venceu com mais moedas!", width / 2, height / 2);
  } else {
    textSize(24);
    text("Empate! Ambos têm o mesmo número de moedas!", width / 2, height / 2);
  }

  textSize(20);
  text("Pressione 'R' para jogar novamente ou 'Q' para sair.", width / 2, height / 1.5);
}

// Soltar balões de celebração
function releaseBaloes() {
  if (frameCount % 10 === 0 && baloes.length < 30) { // Limite de balões
    let balao = new Balao(random(width / 4, 3 * width / 4), height, random(1, 2));
    baloes.push(balao);
  }
}

// Reseta o jogo
function resetGame() {
  moedasGato = 0;
  moedasCachorro = 0;
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
  gatoPos = createVector(50, height / 2);
  cachorroPos = createVector(width - 50, height / 2);
  gameEnd = millis() + gameDuration;
  gameOver = false;
  baloes = [];
}

// Reinício do jogo com tecla
function keyPressed() {
  if (gameOver) {
    if (key === 'R' || key === 'r') resetGame();
    if (key === 'Q' || key === 'q') noLoop();
  }
}

function releaseBaloes() {
  if (frameCount % 10 === 0 && baloes.length < 30) { // Limite de balões
    let balao = new Balao(random(width / 4, 3 * width / 4), height, random(1, 2));
    baloes.push(balao);
  }
}

// Reseta o jogo
function resetGame() {
  moedasGato = 0;
  moedasCachorro = 0;
  ratoPos = createVector(width / 2, height / 2);
  ratoVel = p5.Vector.random2D().mult(random(4, 6));
  gatoPos = createVector(50, height / 2);
  cachorroPos = createVector(width - 50, height / 2);
  gameEnd = millis() + gameDuration;
  gameOver = false;
  baloes = [];
}

// Reinício do jogo com tecla
function keyPressed() {
  if (gameOver) {
    if (key === 'R' || key === 'r') resetGame();
    if (key === 'Q' || key === 'q') noLoop();
  }
}
