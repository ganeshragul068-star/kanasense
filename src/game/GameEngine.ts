import type { LevelId } from '../types/learning';
import type { GameSessionConfig } from './types';
import { createDefaultSessionConfig } from './types';
import type {
  GameState,
  AvatarId,
  ObstacleDef,
  ObstacleInstance,
  PlayerState,
  GameHUDStats,
  GameConfig,
  Hitbox,
  GameQuestion,
  ObstacleDifficulty,
  AnswerValidationResult,
  MistakeRecord,
} from './types';
import obstacleManifest from './obstacleManifest.json';
import { soundEffects } from './soundEffects';
import { QuestionGenerator } from './QuestionGenerator';
import { DEFAULT_GAME_WRITING_PASS_THRESHOLD } from './AnswerValidator';
import { recordAttempt, markItemMastered } from '../utils/progression';

type EngineListener = (
  stats: GameHUDStats,
  state: GameState,
  activeQuestion: GameQuestion | null
) => void;

// ── Obstacle-sequence state machine ─────────────────────────────────────────
//
//  RUNNING_NORMAL  →  obstacle sequence spawning (1–5 jumpable obstacles)
//                     ↓  (sequence cleared / all passed)
//  QUESTION_PENDING → pause, generate question, open popup
//                     ↓  (answered correctly or incorrectly)
//  RUNNING_NORMAL  → new sequence
//
// During RUNNING_NORMAL obstacles are purely physical — no question triggered.
// Questions are generated once per round after the sequence is cleared.
// ─────────────────────────────────────────────────────────────────────────────

type SequencePhase = 'normal' | 'question_pending';

export class GameEngine {
  private state: GameState = 'READY';
  private selectedAvatar: AvatarId = 'user';
  private selectedLevel: LevelId = 'beginner';
  private sessionConfig: GameSessionConfig = createDefaultSessionConfig();

  private config: GameConfig = {
    baseSpeed: 300,
    minSpeedPercent: 70,
    maxSpeedPercent: 180,
    speedStepCorrect: 5,
    speedStepCollision: 15,
    gravity: 1850,
    jumpForce: 720,
    virtualWidth: 960,
    virtualHeight: 540,
    groundY: 440,
    gameWritingPassThreshold: DEFAULT_GAME_WRITING_PASS_THRESHOLD,
    consecutiveCorrectToAdvance: 4,
    consecutiveWrongToDowngrade: 2,
    scoreRewards: {
      beginner: 10,
      intermediate: 15,
      advanced: 20,
    },
    hardQuestionTimerSeconds: 20,
    minNormalObstaclesBetweenQuestions: 1,
    maxNormalObstaclesBetweenQuestions: 5,
    writingScoreBonus: 25,
  };

  private player: PlayerState = {
    x: 110,
    y: 330,
    width: 76,
    height: 110,
    vy: 0,
    isGrounded: true,
    isJumping: false,
    invulnerableTime: 0,
    runAnimTime: 0,
    bobOffset: 0,
  };

  private stats: GameHUDStats = this.freshStats();

  private obstacles: ObstacleInstance[] = [];
  private nextObstacleUid = 1;
  private spawnCooldown = 1.4;
  private bgOffset = 0;

  private activeQuestion: GameQuestion | null = null;
  private questionResolvedLock = false;

  // ── Obstacle-sequence tracking ───────────────────────────────────────────
  private sequencePhase: SequencePhase = 'normal';
  /** How many normal obstacles remain in the current sequence */
  private normalObstaclesRemaining = 0;
  /** Count of normal obstacles cleared in the current sequence */
  private normalObstaclesCleared = 0;
  /** Target size of the current sequence */
  private normalSequenceTarget = 0;

  private noticeTimeoutId: number | null = null;
  private transitionTimeoutId: number | null = null;

  private allObstacleDefs: ObstacleDef[] = obstacleManifest as ObstacleDef[];

  private lastTime = 0;
  private animFrameId: number | null = null;
  private listeners: Set<EngineListener> = new Set();

  constructor() {
    this.resetPlayerPosition();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private freshStats(): GameHUDStats {
    return {
      score: 0,
      lives: 3,
      streak: 0,
      bestStreak: 0,
      speedPercent: 100,
      xp: 0,
      obstaclesCleared: 0,
      totalEncountered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      currentDifficulty: 'easy',
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      difficultyNotice: null,
      highestDifficulty: 'easy',
      totalCollisions: 0,
      writingChallengesAttempted: 0,
      difficultyStats: {
        easy: { attempted: 0, correct: 0, wrong: 0 },
        medium: { attempted: 0, correct: 0, wrong: 0 },
        hard: { attempted: 0, correct: 0, wrong: 0 },
      },
      mistakes: [],
    };
  }

  private randomSequenceTarget(): number {
    const min = this.config.minNormalObstaclesBetweenQuestions;
    const max = this.config.maxNormalObstaclesBetweenQuestions;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private startNewSequence() {
    this.sequencePhase = 'normal';
    this.normalSequenceTarget = this.randomSequenceTarget();
    this.normalObstaclesRemaining = this.normalSequenceTarget;
    this.normalObstaclesCleared = 0;
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  public subscribe(cb: EngineListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) =>
      cb({ ...this.stats }, this.state, this.activeQuestion)
    );
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  public getState(): GameState { return this.state; }
  public getStats(): Readonly<GameHUDStats> { return this.stats; }
  public getPlayer(): Readonly<PlayerState> { return this.player; }
  public getObstacles(): ReadonlyArray<ObstacleInstance> { return this.obstacles; }
  public getBgOffset(): number { return this.bgOffset; }
  public getConfig(): Readonly<GameConfig> { return this.config; }
  public getActiveQuestion(): GameQuestion | null { return this.activeQuestion; }
  public getAvatar(): AvatarId { return this.selectedAvatar; }
  public getLevel(): LevelId { return this.selectedLevel; }

  public setAvatar(avatarId: AvatarId) {
    this.selectedAvatar = avatarId;
    this.notify();
  }

  public setLevel(level: LevelId) {
    this.selectedLevel = level;
    this.sessionConfig.level = level;
    this.notify();
  }

  public getSessionConfig(): Readonly<GameSessionConfig> {
    return this.sessionConfig;
  }

  public setSessionConfig(config: GameSessionConfig) {
    this.sessionConfig = { ...config };
    this.selectedLevel = config.level;
    this.selectedAvatar = config.avatarId;
    this.notify();
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.notify();
  }

  // ── Difficulty notice ─────────────────────────────────────────────────────

  private showDifficultyNotice(message: string) {
    if (this.noticeTimeoutId !== null) {
      window.clearTimeout(this.noticeTimeoutId);
    }
    this.stats.difficultyNotice = message;
    this.notify();

    this.noticeTimeoutId = window.setTimeout(() => {
      this.stats.difficultyNotice = null;
      this.noticeTimeoutId = null;
      this.notify();
    }, 2200);
  }

  // ── Player position ───────────────────────────────────────────────────────

  private resetPlayerPosition() {
    this.player.x = 110;
    this.player.width = 76;
    this.player.height = 110;
    this.player.y = this.config.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.isJumping = false;
    this.player.invulnerableTime = 0;
    this.player.runAnimTime = 0;
    this.player.bobOffset = 0;
  }

  // ── Game lifecycle ────────────────────────────────────────────────────────

  public start() {
    this.reset();
    this.state = 'RUNNING';
    this.startNewSequence();
    this.lastTime = performance.now();
    this.notify();
    this.startLoop();
  }

  public pause() {
    if (this.state === 'RUNNING') {
      this.state = 'PAUSED';
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.notify();
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'RUNNING';
      this.lastTime = performance.now();
      this.notify();
      this.startLoop();
    }
  }

  /**
   * Restores initial state while preserving selectedAvatar and selectedLevel.
   */
  public reset() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.noticeTimeoutId !== null) {
      window.clearTimeout(this.noticeTimeoutId);
      this.noticeTimeoutId = null;
    }
    if (this.transitionTimeoutId !== null) {
      window.clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }

    this.stats = this.freshStats();
    this.obstacles = [];
    this.activeQuestion = null;
    this.questionResolvedLock = false;
    this.spawnCooldown = 1.2;
    this.bgOffset = 0;
    this.sequencePhase = 'normal';
    this.normalObstaclesRemaining = 0;
    this.normalObstaclesCleared = 0;
    this.normalSequenceTarget = 0;
    this.resetPlayerPosition();
    this.state = 'READY';
    this.notify();
  }

  public jump() {
    if (this.state !== 'RUNNING') return;
    if (this.player.isGrounded) {
      this.player.vy = -this.config.jumpForce;
      this.player.isGrounded = false;
      this.player.isJumping = true;
      soundEffects.playJump();
    }
  }

  // ── Obstacle-sequence question trigger ────────────────────────────────────

  /**
   * Called when the sequence phase should transition to a question round.
   * Pauses the game loop and opens the question popup.
   */
  private triggerSequenceQuestion() {
    if (this.state === 'GAME_OVER' || this.state === 'QUESTION') return;

    this.sequencePhase = 'question_pending';
    this.questionResolvedLock = false;

    // Use a dummy obstacle def to generate a question based on current difficulty
    const pool = this.allObstacleDefs.filter(
      (d) => d.difficulty === this.stats.currentDifficulty
    );
    if (pool.length === 0) {
      // Skip question, start new sequence
      this.startNewSequence();
      return;
    }
    const def = pool[Math.floor(Math.random() * pool.length)];
    const generated = QuestionGenerator.generateQuestion(this.sessionConfig, def);
    if (def.difficulty === 'hard') {
      generated.timerSeconds = this.config.hardQuestionTimerSeconds;
    }

    if (generated.interactionType === 'writing') {
      this.stats.writingChallengesAttempted += 1;
    }

    this.activeQuestion = generated;
    this.state = 'QUESTION';

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.notify();
  }

  /**
   * Legacy method kept for test-drawer compatibility: spawns a challenge at a
   * specific difficulty (still works as before).
   */
  public triggerDifficultyChallenge(difficulty: ObstacleDifficulty) {
    if (this.state === 'GAME_OVER') return;

    this.stats.currentDifficulty = difficulty;
    const matchingDefs = this.allObstacleDefs.filter((d) => d.difficulty === difficulty);
    if (matchingDefs.length === 0) return;
    const def = matchingDefs[Math.floor(Math.random() * matchingDefs.length)];

    const obs = this.createObstacleInstance(def, this.player.x + 140, true);
    this.obstacles.push(obs);
    this.stats.totalEncountered += 1;

    // Treat as an immediate question trigger
    this.sequencePhase = 'question_pending';
    this.questionResolvedLock = false;
    const generated = QuestionGenerator.generateQuestion(this.sessionConfig, def);
    if (def.difficulty === 'hard') {
      generated.timerSeconds = this.config.hardQuestionTimerSeconds;
    }
    this.activeQuestion = generated;
    this.state = 'QUESTION';

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.notify();
  }

  // ── Question resolution ───────────────────────────────────────────────────

  /**
   * Called by QuestionPopup or WritingChallenge when the student submits their answer.
   * Locked against duplicate submissions.
   */
  public resolveQuestion(result: AnswerValidationResult) {
    if (this.questionResolvedLock || this.state === 'GAME_OVER') return;
    this.questionResolvedLock = true;

    const answeredQuestion = this.activeQuestion;
    this.activeQuestion = null;

    // Record attempt into KanaSense progression storage
    if (answeredQuestion?.targetItem) {
      const item = answeredQuestion.targetItem;
      const numericScore =
        result.score !== undefined
          ? result.score
          : result.isCorrect
          ? 100
          : 40;
      recordAttempt(item.id, numericScore, result.isCorrect);
      if (result.isCorrect && numericScore >= 75) {
        markItemMastered(item.id, item.japanese, numericScore, 'free');
      }
    }

    // Per-difficulty tracking
    const diff = answeredQuestion?.difficulty ?? this.stats.currentDifficulty;
    this.stats.difficultyStats[diff].attempted += 1;

    if (result.isCorrect) {
      this.stats.difficultyStats[diff].correct += 1;
      this.onCorrectAnswer();
    } else {
      this.stats.difficultyStats[diff].wrong += 1;

      // Record mistake
      if (answeredQuestion) {
        if (this.stats.mistakes.length < 20) {
          const mistake: MistakeRecord = {
            questionId: answeredQuestion.id,
            japanese: answeredQuestion.targetItem.japanese,
            romaji: answeredQuestion.targetItem.romaji,
            meaning: answeredQuestion.targetItem.meaning ?? '',
            playerAnswer: result.playerAnswer ?? '(not recorded)',
            correctAnswer: answeredQuestion.correctAnswer,
            difficulty: answeredQuestion.difficulty,
            level: answeredQuestion.level,
            prompt: answeredQuestion.prompt,
            explanation: answeredQuestion.explanation,
            isWriting: answeredQuestion.interactionType === 'writing',
            writingScore: result.score,
          };
          this.stats.mistakes.push(mistake);
        }
      }
      this.onWrongAnswer();
    }
  }

  // ── Difficulty progression ────────────────────────────────────────────────

  private checkDifficultyAdvancement() {
    if (this.stats.consecutiveCorrect >= this.config.consecutiveCorrectToAdvance) {
      if (this.stats.currentDifficulty === 'easy') {
        this.stats.currentDifficulty = 'medium';
        this.stats.highestDifficulty = 'medium';
        this.stats.consecutiveCorrect = 0;
        this.syncUpcomingObstaclesToDifficulty('medium');
        this.showDifficultyNotice('DIFFICULTY UP: MEDIUM!');
        soundEffects.playDifficultyUp();
      } else if (this.stats.currentDifficulty === 'medium') {
        this.stats.currentDifficulty = 'hard';
        this.stats.highestDifficulty = 'hard';
        this.stats.consecutiveCorrect = 0;
        this.syncUpcomingObstaclesToDifficulty('hard');
        this.showDifficultyNotice('DIFFICULTY UP: HARD!');
        soundEffects.playDifficultyUp();
      }
    }
  }

  private checkDifficultyDowngrade() {
    if (this.stats.consecutiveWrong >= this.config.consecutiveWrongToDowngrade) {
      this.stats.consecutiveWrong = 0;
      if (this.stats.currentDifficulty === 'hard') {
        this.stats.currentDifficulty = 'medium';
        this.syncUpcomingObstaclesToDifficulty('medium');
        this.showDifficultyNotice('DIFFICULTY ADJUSTED: MEDIUM');
      } else if (this.stats.currentDifficulty === 'medium') {
        this.stats.currentDifficulty = 'easy';
        this.syncUpcomingObstaclesToDifficulty('easy');
        this.showDifficultyNotice('DIFFICULTY ADJUSTED: EASY');
      }
    }
  }

  private syncUpcomingObstaclesToDifficulty(newDiff: ObstacleDifficulty) {
    const pool = this.allObstacleDefs.filter((d) => d.difficulty === newDiff);
    if (pool.length === 0) return;
    for (const obs of this.obstacles) {
      if (!obs.questionTriggered && !obs.encounterHandled && !obs.passed) {
        const newDef = pool[Math.floor(Math.random() * pool.length)];
        obs.def = newDef;
      }
    }
  }

  // ── Answer event hooks ────────────────────────────────────────────────────

  public onCorrectAnswer(_targetObs?: ObstacleInstance) {
    if (this.state === 'GAME_OVER') return;

    this.stats.correctAnswers += 1;
    this.stats.streak += 1;
    if (this.stats.streak > this.stats.bestStreak) {
      this.stats.bestStreak = this.stats.streak;
    }

    this.stats.consecutiveCorrect += 1;
    this.stats.consecutiveWrong = 0;

    const baseReward = this.config.scoreRewards[this.selectedLevel] ?? 10;
    const comboBonus = (this.stats.streak - 1) * 5;
    this.stats.score += baseReward + comboBonus;
    this.stats.xp += baseReward;
    this.stats.obstaclesCleared += 1;

    this.stats.speedPercent = Math.min(
      this.config.maxSpeedPercent,
      this.stats.speedPercent + this.config.speedStepCorrect
    );

    this.checkDifficultyAdvancement();
    soundEffects.playCorrect();

    this.state = 'SUCCESS';
    this.notify();

    if (this.transitionTimeoutId !== null) {
      window.clearTimeout(this.transitionTimeoutId);
    }
    this.transitionTimeoutId = window.setTimeout(() => {
      this.transitionTimeoutId = null;
      if (this.state === 'SUCCESS') {
        this.state = 'RUNNING';
        this.startNewSequence(); // Begin next obstacle sequence
        this.lastTime = performance.now();
        this.notify();
        this.startLoop();
      }
    }, 320);
  }

  public onCollision(collidedObstacle?: ObstacleInstance) {
    if (this.state === 'GAME_OVER') return;

    if (collidedObstacle) {
      if (collidedObstacle.encounterHandled || collidedObstacle.hit) return;
      collidedObstacle.hit = true;
      collidedObstacle.passed = true;
      collidedObstacle.encounterHandled = true;
    } else if (this.player.invulnerableTime > 0 && this.state === 'RUNNING') {
      return;
    }

    this.stats.lives = Math.max(0, this.stats.lives - 1);
    this.stats.streak = 0;
    this.stats.consecutiveCorrect = 0;
    this.stats.consecutiveWrong += 1;
    this.stats.totalCollisions += 1;

    this.stats.speedPercent = Math.max(
      this.config.minSpeedPercent,
      this.stats.speedPercent - this.config.speedStepCollision
    );

    this.checkDifficultyDowngrade();

    this.player.invulnerableTime = 1.6;
    soundEffects.playCollision();

    if (this.stats.lives <= 0) {
      this.state = 'GAME_OVER';
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      soundEffects.playGameOver();
      this.notify();
      return;
    }

    this.state = 'COLLISION';
    this.notify();

    if (this.transitionTimeoutId !== null) {
      window.clearTimeout(this.transitionTimeoutId);
    }
    this.transitionTimeoutId = window.setTimeout(() => {
      this.transitionTimeoutId = null;
      if (this.state === 'COLLISION') {
        this.state = 'RUNNING';
        this.lastTime = performance.now();
        this.notify();
        this.startLoop();
      }
    }, 320);
  }

  public onWrongAnswer(failedObstacle?: ObstacleInstance) {
    this.stats.incorrectAnswers += 1;
    this.onCollision(failedObstacle);
  }

  // ── Obstacle management ───────────────────────────────────────────────────

  private getAvailableObstaclePool(): ObstacleDef[] {
    const currentDiff = this.stats.currentDifficulty;
    const pool = this.allObstacleDefs.filter((d) => d.difficulty === currentDiff);
    return pool.length > 0 ? pool : this.allObstacleDefs;
  }

  private createObstacleInstance(
    def: ObstacleDef,
    spawnX: number,
    isNormalObstacle = true
  ): ObstacleInstance {
    let renderHeight = 85;
    let renderWidth = 85;

    if (def.id === 'caltrops') {
      renderHeight = 44;
      renderWidth = 72;
    } else if (def.id === 'torii_gate') {
      renderHeight = 115;
      renderWidth = 140;
    } else if (def.id === 'lantern_rack') {
      renderHeight = 110;
      renderWidth = 135;
    } else if (def.id === 'bamboo_fence') {
      renderHeight = 65;
      renderWidth = 120;
    } else if (def.id === 'wooden_cart') {
      renderHeight = 82;
      renderWidth = 115;
    } else if (def.id === 'toro' || def.id === 'stone_jizo' || def.id === 'daruma') {
      renderHeight = 95;
      renderWidth = (def.width / def.height) * renderHeight;
    } else if (def.aerial) {
      renderHeight = 70;
      renderWidth = 80;
    } else {
      renderHeight = 80;
      renderWidth = (def.width / def.height) * renderHeight;
    }

    let spawnY = this.config.groundY - renderHeight;

    if (def.aerial) {
      if (def.id === 'cherry_blossoms') {
        spawnY = 180 + Math.random() * 80;
      } else if (def.id === 'kite') {
        spawnY = 190 + Math.random() * 70;
      }
    }

    return {
      uid: this.nextObstacleUid++,
      def,
      x: spawnX,
      y: spawnY,
      width: Math.round(renderWidth),
      height: Math.round(renderHeight),
      speedMultiplier: 1.0,
      rotation: 0,
      waveOffset: Math.random() * Math.PI * 2,
      cleared: false,
      passed: false,
      hit: false,
      questionTriggered: false,
      encounterHandled: false,
      isNormalObstacle,
    };
  }

  /**
   * Spawn a normal (jumpable, non-question) obstacle.
   * Called during RUNNING_NORMAL sequence phase.
   */
  private spawnNormalObstacle() {
    if (this.state === 'GAME_OVER') return;
    if (this.normalObstaclesRemaining <= 0) return;
    if (this.obstacles.length >= 4) return;

    const pool = this.getAvailableObstaclePool();
    if (pool.length === 0) return;

    const def = pool[Math.floor(Math.random() * pool.length)];
    const instance = this.createObstacleInstance(
      def,
      this.config.virtualWidth + 60,
      true // isNormalObstacle
    );

    this.obstacles.push(instance);
    this.normalObstaclesRemaining -= 1;
    this.stats.totalEncountered += 1;

    const currentSpeed = (this.stats.speedPercent / 100) * this.config.baseSpeed;
    const minGapPixels = 480;
    const minSeconds = minGapPixels / currentSpeed;
    this.spawnCooldown = minSeconds + 0.8 + Math.random() * 0.7;
  }

  // ── Game loop ─────────────────────────────────────────────────────────────

  private startLoop() {
    if (this.animFrameId !== null) return;

    const loop = (currentTime: number) => {
      if (
        this.state !== 'RUNNING' &&
        this.state !== 'COLLISION' &&
        this.state !== 'SUCCESS'
      ) {
        this.animFrameId = null;
        return;
      }

      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.update(dt);

      if (
        this.state === 'RUNNING' ||
        this.state === 'COLLISION' ||
        this.state === 'SUCCESS'
      ) {
        this.animFrameId = requestAnimationFrame(loop);
      } else {
        this.animFrameId = null;
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    const currentSpeedPixels = (this.stats.speedPercent / 100) * this.config.baseSpeed;

    // 1. Player physics
    if (!this.player.isGrounded) {
      this.player.vy += this.config.gravity * dt;
      this.player.y += this.player.vy * dt;

      const groundPlayerY = this.config.groundY - this.player.height;
      if (this.player.y >= groundPlayerY) {
        this.player.y = groundPlayerY;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
      }
    }

    if (this.player.isGrounded) {
      this.player.runAnimTime += dt * (this.stats.speedPercent / 100) * 16;
      this.player.bobOffset = Math.sin(this.player.runAnimTime) * 3.5;
    } else {
      this.player.bobOffset = 0;
    }

    if (this.player.invulnerableTime > 0) {
      this.player.invulnerableTime = Math.max(0, this.player.invulnerableTime - dt);
    }

    // 2. Parallax background
    this.bgOffset =
      (this.bgOffset + currentSpeedPixels * 0.35 * dt) % this.config.virtualWidth;

    // 3. Obstacle spawning (normal sequence only)
    if (this.sequencePhase === 'normal') {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0 && this.normalObstaclesRemaining > 0) {
        this.spawnNormalObstacle();
      }
    }

    // 4. Obstacle update + normal-obstacle collision
    const playerHitbox = this.getPlayerHitbox();
    let allNormalCleared = true;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      obs.x -= currentSpeedPixels * obs.speedMultiplier * dt;

      if (obs.def.rolling) {
        obs.rotation -= (currentSpeedPixels / (obs.width / 2)) * dt * 0.9;
      }

      if (obs.def.aerial) {
        if (obs.def.id === 'cherry_blossoms') {
          obs.waveOffset += dt * 3.5;
          obs.y += 15 * dt + Math.sin(obs.waveOffset) * 0.8;
        } else if (obs.def.id === 'kite') {
          obs.waveOffset += dt * 2.2;
          obs.y += Math.sin(obs.waveOffset) * 0.6;
        }
      }

      // Normal (jumpable) obstacle handling
      if (obs.isNormalObstacle) {
        // Mark as passed when cleared to the left
        if (!obs.passed && !obs.hit && obs.x + obs.width < this.player.x) {
          obs.passed = true;
          obs.encounterHandled = true;
          obs.cleared = true;
          this.normalObstaclesCleared += 1;
          this.stats.obstaclesCleared += 1;
          this.stats.score += 2; // small bonus for dodging
          this.notify();
        }

        // Physical collision only (no question)
        if (
          !obs.cleared &&
          !obs.hit &&
          !obs.encounterHandled &&
          this.player.invulnerableTime <= 0 &&
          this.checkCollision(playerHitbox, this.getObstacleHitbox(obs))
        ) {
          this.onCollision(obs);
        }

        // Track if any normal obstacle is still active (not passed/hit)
        if (!obs.passed && !obs.hit) {
          allNormalCleared = false;
        }
      }

      if (obs.x + obs.width < -120) {
        this.obstacles.splice(i, 1);
      }
    }

    // 5. Check if sequence is done → trigger question
    if (
      this.sequencePhase === 'normal' &&
      this.normalObstaclesRemaining === 0 &&
      this.state === 'RUNNING'
    ) {
      // All obstacles in this sequence have been spawned; wait until they all pass
      const activeNormal = this.obstacles.filter(
        (o) => o.isNormalObstacle && !o.passed && !o.hit
      );
      if (activeNormal.length === 0) {
        // All cleared/passed — trigger a question round
        this.triggerSequenceQuestion();
        return;
      }
    }

    // Suppress unused variable warning
    void allNormalCleared;
  }

  // ── Hitbox helpers ────────────────────────────────────────────────────────

  private getPlayerHitbox(): Hitbox {
    const padX = this.player.width * 0.22;
    const padTop = this.player.height * 0.18;
    const padBottom = this.player.height * 0.12;

    return {
      x: this.player.x + padX,
      y: this.player.y + padTop + this.player.bobOffset,
      width: this.player.width - padX * 2,
      height: this.player.height - padTop - padBottom,
    };
  }

  private getObstacleHitbox(obs: ObstacleInstance): Hitbox {
    const padXRatio = obs.def.hitboxPadding?.x ?? 0.18;
    const padYRatio = obs.def.hitboxPadding?.y ?? 0.18;
    const padX = obs.width * padXRatio;
    const padY = obs.height * padYRatio;

    return {
      x: obs.x + padX,
      y: obs.y + padY,
      width: Math.max(10, obs.width - padX * 2),
      height: Math.max(10, obs.height - padY * 2),
    };
  }

  private checkCollision(a: Hitbox, b: Hitbox): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // ── Destroy ───────────────────────────────────────────────────────────────

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.noticeTimeoutId !== null) {
      window.clearTimeout(this.noticeTimeoutId);
      this.noticeTimeoutId = null;
    }
    if (this.transitionTimeoutId !== null) {
      window.clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }
    this.listeners.clear();
  }
}
