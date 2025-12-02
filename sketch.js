// 定義角色物件
let player;

// 載入圖片的變數
let idleSpriteSheet;
let walkSpriteSheet;
let attackSpriteSheet;
let hurtSpriteSheet; // 🌟 新增: 受傷圖片
let deadSpriteSheet; // 🌟 新增: 死亡圖片
let backgroundImage; 

// 🚀 新增: 儲存所有火球物件的陣列
let fireballs = []; 

// 定義角色狀態常量
const STATE = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  RUN: 'RUN',
  ATTACK: 'ATTACK',
  HURT: 'HURT', // 🌟 新增受傷狀態
  DEAD: 'DEAD' // 🌟 新增死亡狀態
};

// 定義動畫設定
const animationData = {
  // IDLE 動畫設定 (6 張圖, 889x176)
  IDLE: {
    path: '2/IDLE/all.png',
    frameWidth: Math.floor(889 / 6), // 148
    frameHeight: 176,
    frameCount: 6,
    frameDelay: 8 
  },
  // WALK 動畫設定 (8 張圖, 1251x184)
  WALK: {
    path: '2/WALK/all.png',
    frameWidth: Math.floor(1251 / 8), // 156
    frameHeight: 184,
    frameCount: 8,
    frameDelay: 6 
  },
  // ATTACK 動畫設定 (8 張圖, 1635x184)
  ATTACK: {
    path: '2/ATTACK/all.png', 
    frameWidth: Math.floor(1635 / 8), // 204
    frameHeight: 184,
    frameCount: 8,
    frameDelay: 3 
  },
  // 🌟 HURT 動畫設定 (3 張圖, 370x192)
  HURT: {
    path: '2/HURT/all.png',
    frameWidth: Math.floor(370 / 3), // 123
    frameHeight: 192,
    frameCount: 3,
    frameDelay: 5 // 受傷動畫播放速度
  },
  // 🌟 DEAD 動畫設定 (3 張圖, 514x184)
  DEAD: {
    path: '2/DEAD/all.png',
    frameWidth: Math.floor(514 / 3), // 171
    frameHeight: 184,
    frameCount: 3,
    frameDelay: 10 // 死亡動畫播放速度
  }
};
/**
 * 預載入圖片資源
 */
function preload() {
  // 載入角色動畫精靈圖
  idleSpriteSheet = loadImage(animationData.IDLE.path);
  walkSpriteSheet = loadImage(animationData.WALK.path);
  attackSpriteSheet = loadImage(animationData.ATTACK.path); 
  hurtSpriteSheet = loadImage(animationData.HURT.path); // 🌟 載入受傷圖片
  deadSpriteSheet = loadImage(animationData.DEAD.path); // 🌟 載入死亡圖片
    
  // 載入背景圖片 (確保 'background.jpg' 檔案名稱和路徑正確)
  backgroundImage = loadImage('background.jpg'); 
}

/**
 * 設定程式初始化
 */
function setup() {
  // 產生一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 調整角色的初始 Y 座標，使其不要太靠底部
  player = new Player(windowWidth / 4, windowHeight * 0.6);
}

/**
 * 繪圖迴圈
 */
function draw() {
  // 1. 繪製背景
  image(backgroundImage, 0, 0, width, height);
  
  // 處理角色輸入
  handleInput();
  
  // 更新和繪製角色
  player.update();
  player.display();
    
  // 🚀 更新和繪製所有火球 (確保在角色之後繪製，讓火球看起來在前景)
  for (let i = fireballs.length - 1; i >= 0; i--) {
      fireballs[i].update();
      fireballs[i].display();
      
      // 如果火球不再存活 (飛出畫面)，則從陣列中移除
      if (!fireballs[i].isAlive) {
          fireballs.splice(i, 1);
      }
  }

  // 🌟 顯示生命值 (HP) 資訊
  displayHP();
}

/**
 * 🌟 新增: 顯示角色的 HP 資訊
 */
function displayHP() {
  push();
  fill(255);
  textSize(24);
  // 將文字放在畫布左上角
  text(`HP: ${player.hp}/${player.maxHp}`, 20, 40);
  
  if (player.currentState === STATE.DEAD) {
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("G A M E   O V E R", width / 2, height / 2);
  }
  pop();
}

/**
 * 處理鍵盤輸入
 */
function handleInput() {
  
  // 🌟 優先級最高: 如果角色已死亡或正在受傷，則忽略所有移動和攻擊輸入
  if (player.currentState === STATE.DEAD || player.currentState === STATE.HURT) {
    player.setVelocity(0);
    return;
  }
  
  // 1. 處理攻擊輸入 (如果正在攻擊，則忽略移動)
  if (player.currentState === STATE.ATTACK) {
    return;
  }
  
  // 判斷是否按下空白鍵 (SPACEBAR 的 keyCode 是 32)
  if (keyIsDown(32)) { 
    player.setState(STATE.ATTACK);
    player.setVelocity(0); // 攻擊時停止移動
    return;
  }
  
  
  // 2. 處理移動輸入 (如果沒有攻擊)
  
  let moving = false;
  
  // 按下鍵盤 'D' 鍵 (或 'd') - 向右移動
  if (keyIsDown(68)) { 
    player.setState(STATE.WALK);
    player.setVelocity(3); 
    player.setFacing(1); // 面向右邊
    moving = true;
  }
  
  // 按下鍵盤 'A' 鍵 (或 'a') - 向左移動
  if (keyIsDown(65)) { 
    player.setState(STATE.WALK);
    player.setVelocity(-3); // 負速度表示向左移動
    player.setFacing(-1); // 面向左邊
    moving = true;
  }
  
  // 3. 處理閒置狀態
  if (!moving && player.currentState !== STATE.ATTACK) {
    // 只有在沒有移動輸入且當前不是 ATTACK 狀態時，才切換到 IDLE
    player.setState(STATE.IDLE);
    player.setVelocity(0);
  }
}

/**
 * 🌟 新增: 處理單次按鍵事件 (用於測試受傷)
 */
function keyPressed() {
  // 按下 'K' 鍵 (或 'k', keyCode 75) 測試受傷
  if (keyCode === 75) {
    player.takeDamage();
  }
}


/**
 * 當視窗大小改變時，重新調整畫布大小
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新調整角色位置
  if (player) {
    player.x = windowWidth / 4; 
    player.y = windowHeight * 0.75; 
  }
}


// --- Player 類別定義 ---

class Player {
  constructor(x, y) {
    this.x = x; 
    this.y = y; 
    this.velocity = 0; 
    this.scale = 1.5; 
    this.currentState = STATE.IDLE; 
    this.currentFrame = 0; 
    this.frameCounter = 0; 
    this.facing = 1; 
    this.animationFinished = false; 
    
    // 🌟 新增 HP 屬性 (可承受 5 次傷害)
    this.maxHp = 5;
    this.hp = this.maxHp;
  }

  setState(newState) {
    // 🌟 死亡狀態無法切換到其他狀態
    if (this.currentState === STATE.DEAD) {
      return;
    }
    
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.frameCounter = 0;
      
      // 🌟 ATTACK, HURT, DEAD 都是單次播放動畫
      if (newState === STATE.ATTACK || newState === STATE.HURT || newState === STATE.DEAD) {
        this.animationFinished = false;
      }
    }
  }

  setVelocity(vel) {
    this.velocity = vel;
  }

  setFacing(direction) {
    this.facing = direction; 
  }

  /**
   * 🌟 新增: 處理受傷邏輯
   */
  takeDamage(damage = 1) {
    // 死亡狀態下不再受傷
    if (this.currentState === STATE.DEAD) {
      return;
    }
    
    this.hp -= damage;
    
    if (this.hp <= 0) {
      this.setState(STATE.DEAD);
    } else {
      this.setState(STATE.HURT);
    }
    
    this.setVelocity(0); // 受傷時停止移動
  }

  update() {
    // 取得當前狀態的動畫數據
    let currentAnimData = animationData[this.currentState] || animationData.IDLE;
    
    // 🌟 攻擊、受傷、死亡時，角色不能移動
    if (this.currentState !== STATE.ATTACK && this.currentState !== STATE.HURT && this.currentState !== STATE.DEAD) {
      this.x += this.velocity;
    } else {
      this.velocity = 0; // 強制停止移動
    }
    
    // 邊界限制邏輯
    const characterWidth = currentAnimData.frameWidth * this.scale;
    this.x = constrain(this.x, 0, width - characterWidth);
    
    
    // --- 動畫幀更新邏輯 ---
    this.frameCounter++;
    
    if (this.frameCounter >= currentAnimData.frameDelay) {
      
      let nextFrame = this.currentFrame + 1;
      
      // 處理單次播放的動畫 (ATTACK, HURT, DEAD)
      if (this.currentState === STATE.ATTACK || this.currentState === STATE.HURT || this.currentState === STATE.DEAD) {
        
        // 攻擊發射火球邏輯 (只在 ATTACK 狀態執行)
        if (this.currentState === STATE.ATTACK) {
          const FIRE_FRAME = 4;
          if (this.currentFrame === FIRE_FRAME - 1) { 
                
            // 計算發射火球的位置 
            const spriteWidth = animationData.ATTACK.frameWidth * this.scale;
            const spriteHeight = animationData.ATTACK.frameHeight * this.scale;

            const startX = this.x + (this.facing === 1 ? spriteWidth * 0.9 : spriteWidth * 0.1);
            const startY = this.y + spriteHeight * 0.4; 
            
            // 創建並加入火球
            let newFireball = new Fireball(startX, startY, this.facing);
            fireballs.push(newFireball);
          }
        }

        // 動畫結束的處理
        if (nextFrame >= currentAnimData.frameCount) {
          this.currentFrame = currentAnimData.frameCount - 1; // 停在最後一幀
          this.animationFinished = true;
          
          // 攻擊或受傷動畫結束後，切換回 IDLE
          if (this.currentState === STATE.ATTACK || this.currentState === STATE.HURT) {
            this.setState(STATE.IDLE); 
          } 
          // DEAD 狀態則維持在最後一幀
        } else {
          this.currentFrame = nextFrame;
        }
      } else {
        // IDLE, WALK 是循環播放動畫
        this.currentFrame = nextFrame % currentAnimData.frameCount;
      }
      
      this.frameCounter = 0; // 重設計數器
    }
  }

  display() {
    let currentAnimData;
    let spriteSheet;

    // 根據狀態選擇圖片
    switch (this.currentState) {
      case STATE.IDLE:
        currentAnimData = animationData.IDLE;
        spriteSheet = idleSpriteSheet;
        break;
      case STATE.WALK:
        currentAnimData = animationData.WALK;
        spriteSheet = walkSpriteSheet;
        break;
      case STATE.ATTACK: 
        currentAnimData = animationData.ATTACK;
        spriteSheet = attackSpriteSheet;
        break;
      case STATE.HURT: // 🌟 新增
        currentAnimData = animationData.HURT;
        spriteSheet = hurtSpriteSheet;
        break;
      case STATE.DEAD: // 🌟 新增
        currentAnimData = animationData.DEAD;
        spriteSheet = deadSpriteSheet;
        break;
      default:
        return;
    }
    
    // 計算來源圖片精靈上的裁剪座標
    const srcX = this.currentFrame * currentAnimData.frameWidth;
    const srcW = currentAnimData.frameWidth;
    const srcH = currentAnimData.frameHeight;
    
    push();
    
    // 1. 移動到角色繪製的左上角點
    translate(this.x, this.y);
    
    // 2. 處理翻轉
    if (this.facing === -1) {
        // A. 向左平移一個完整的 (縮放後) 圖片寬度
        translate(srcW * this.scale, 0); 
        // B. 進行水平翻轉（只翻轉水平，不改變垂直縮放）
        scale(-1, 1); 
    }
    
    // 應用縮放
    scale(this.scale, this.scale);    // 繪製圖片精靈 (目標位置為 0, 0)
    image(
      spriteSheet, 
      0, 
      0, 
      srcW, 
      srcH, 
      srcX, 
      0, // 來源 Y 永遠是 0
      srcW, 
      srcH
    );
    
    pop();
  }
}


// --- Fireball 類別定義 (已調整為紅色火焰) ---
class Fireball {
    constructor(x, y, facing) {
        this.x = x; 
        this.y = y;
        this.size = 60; // 火球大小 (更大)
        this.speed = 12; // 火球速度 (更快，有往前飛行的感覺)
        this.facing = facing; // 繼承角色的朝向 (1 或 -1)
        this.isAlive = true; // 追蹤火球是否還存在於畫面
    }

    update() {
        // 根據朝向更新位置
        this.x += this.speed * this.facing;
        
        // 檢查火球是否飛出畫面
        if (this.x < -this.size || this.x > width + this.size) {
            this.isAlive = false;
        }
    }

    display() {
        if (!this.isAlive) return;

        push();
        noStroke();
        
        // 外層光暈效果 (透明橘紅光暈)
        fill(255, 100, 0, 80); 
        ellipse(this.x, this.y, this.size * 1.5);
        
        // 中層火球主體 (鮮橘色)
        fill(255, 150, 0, 240); 
        ellipse(this.x, this.y, this.size);
        
        // 內層高亮 (亮黃)
        fill(255, 200, 50, 255); 
        ellipse(this.x, this.y, this.size * 0.7);
        
        // 核心亮點（最亮的白黃）
        fill(255, 255, 200, 255); 
        ellipse(this.x, this.y, this.size * 0.35);
        
        pop();
    }
}