import {
    moveRandom,
    enemyMovement,
    moveProjectile,
    hitEnemy,
    seperateEnemies
} from "./GameFunctions.js";

class Overworld extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.my = {sprite: {}};
        this.SCALE = 1.75;

        this.playerHealth = 100;
        this.playerHitDamage = 5;


        this.evilWizardHealth = 100;
        this.evilWizardDamage = 10;
        this.evilWizardMeleeDistance = 30; // if player is 10 pixels away melee the player
        this.evilWizardFollowDistance = 275; // if player is within 200 pixels follow
        this.evilWizardShootDistance = 300; // if player is within 250 pixels shoot at them
        this.evilWizardShootDelay = 3000;
        this.evilWizardPotionArray = [];

        this.enemyWanderTime = 1000;

        this.dagerDamage = 10;
        this.dagerSpeed = 1000; // 1 second hit speed

        this.swordDamage = 20;
        this.swordSpeed = 2500; // 2.5 second hit speed

        this.axeDamage = 30;
        this.axeSpeed = 4000; // 4 second hit speed

        this.evilWizardArray = [];
        this.spiderArray = [];
        this.orcArray = [];
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.

        let my = this.my;

        this.hitKey = this.input.keyboard.addKey('space');

        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("kenny_tilemap_background", "tilemap_background");
        this.foreGroundTileset = this.map.addTilesetImage("kenny_tilemap_farm", "tilemap_farm");

        // Create a layer
        this.backGround = this.map.createLayer("Background", this.backgroundTileset, 0, 0);
        this.groundLayer = this.map.createLayer(
            "Ground-n-Platforms",
            [this.tileset, this.foreGroundTileset], 0, 0
        )
        this.foreGround = this.map.createLayer("Foreground", this.foreGroundTileset, 0, 0);

        this.backGround.setScale(2.0);
        this.groundLayer.setScale(2.0);
        this.foreGround.setScale(2.0);

        
        this.foreGround.setDepth(1);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.foreGround.setCollisionByProperty({
            collides: true
        })

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.game.config.width/4, this.game.config.height/2, "platformer_characters", "tile_0000.png").setScale(this.SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        this.knight = this.physics.add.sprite(200, 200, "knight");
        this.evilWizard = this.physics.add.sprite(250, 250, "evilWizard");
        this.orc = this.physics.add.sprite(300, 300, "orc");

        for (let i = 0; i < 5; i++) {
            let distanceDiffernece = 20;
            let wizard = this.physics.add.sprite(700 + distanceDiffernece * i, 900 + distanceDiffernece * i, "evilWizard");
            
            wizard.stopDistance = 30 + (i * 50);
            wizard.shootDistance = this.evilWizardShootDistance + (i * 20);
            wizard.shootDelay = this.evilWizardShootDelay + (i * 500);
            wizard.wanderTimer = this.enemyWanderTime;
            wizard.health = this.evilWizardHealth;
            wizard.isDead = false;
            wizard.wander = false;
            wizard.chase = false;
            wizard.shoot = false;

            wizard.setScale(2.55);
            wizard.setCollideWorldBounds(true);
            wizard.speed = 80 + distanceDiffernece * i;
            let direction = Phaser.Math.Between(0,1);
            if (direction == 0) {
                wizard.wanderDirection = -1;
            } else {
                wizard.wanderDirection = 1;
            }

            wizard.nextWanderChange = 0;
            wizard.nextShootTime = 0;

            this.physics.add.collider(wizard, this.groundLayer);

            this.evilWizardArray.push(wizard);

        }
        this.knight.setScale(2.55);
        this.evilWizard.setScale(2.55);
        this.orc.setScale(2.55);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(this.knight, this.groundLayer);
        this.physics.add.collider(this.evilWizard, this.groundLayer);
        this.physics.add.collider(this.orc, this.groundLayer);

        // set up Phaser-provided cursor key input
         this.cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.health = this.add.text(100, 50, "Health: " + this.playerHealth,
            {
                fontSize: "30px",
                fill: "#fd0000"
            }).setOrigin(0.5);

    }

    update(time, deltaTime) {

        let cursors = this.cursors;
        let my = this.my;

        if(cursors.left.isDown) {
            my.sprite.player.body.setVelocityX(-this.ACCELERATION);
            
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setVelocityX(this.ACCELERATION);

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.body.setDragX(this.DRAG);

            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        this.evilWizardArray = hitEnemy(this, this.evilWizardArray);

        enemyMovement(this, this.evilWizardArray);
        // seperateEnemies(this.evilWizardArray);
        moveProjectile(this, deltaTime);
        
    }
}

export default Overworld;