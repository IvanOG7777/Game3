class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.image("tilemap_background", "tilemap-backgrounds_packed.png");
        this.load.image("tilemap_farm", "tilemap_packed-farm.png");

        // load in sheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.spritesheet("tilemap_dungeonSheet", "tilemap_packed-dungeon.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image("knight", "knight.png");
        this.load.image("evilWizard", "evilWizard.png");
        this.load.image("orc", "orc.png");
        this.load.image("vikingPlayer", "vikingPlayer.png");
        this.load.image("heart", "heart.png");
        
        // In game items
        this.load.image("redPotion", "wizardPotion.png");


        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Loading audios
        this.load.audio("footSteps", "walking-fast-on-gravel.mp3");
        this.load.audio("potionThrow", "impactPlate_light_000.ogg");
        this.load.audio("coinCollect", "freesound_community-coin_c_02-102844.mp3");
        this.load.audio("jumpSound", "freesound_community-jump_c_02-102843.mp3");
        this.load.audio("potionImpact", "universfield-glass-bottle-breaking-351297.mp3");
        this.load.audio("hurtSound", "freesound_community-young-man-being-hurt-95628.mp3");
        this.load.audio("deathSound", "u_r7cny11q7r-man-death-scream-186763.mp3");
        this.load.audio("keyCollect", "driken5482-retro-coin-1-236677.mp3");
        this.load.audio("axeSound", "yodguard-giant-axe-impact-striking-into-dirt-2-450260.mp3");
        this.load.audio("swordSound", "dragon-studio-armor-impact-from-sword-393843.mp3");
        this.load.audio("daggerSound", "floraphonic-metal-blade-slice-53-200598.mp3");
        this.load.audio("chompSound", "freesound_community-carrotnom-92106.mp3");
        this.load.audio("chestDeath", "universfield-horror-bone-crack-352450.mp3");
        this.load.audio("enemyDeath", "freesound_crunchpixstudio-female-character-death-vocal-10-408415.mp3");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("initScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}

export default Load;