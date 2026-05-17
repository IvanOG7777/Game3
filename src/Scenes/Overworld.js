import {
    moveRandom,
    enemyMovement,
    moveProjectile,
    hitEnemy,
    seperateEnemies,
    specificSpawnEnemies
} from "./GameFunctions.js";

class Overworld extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.my = {sprite: {}, vfx:{}};
        this.SCALE = 1.75;

        this.playerHealth = 100;
        this.playerHitDamage = 5;
        this.currentWeapon;
        this.nextPlayerHitTime = 0;
        this.playerHitSpeed = 1000;


        this.evilWizardHealth = 100;
        this.evilWizardDamage = 10;
        this.evilWizardMeleeDistance = 30; // if player is 10 pixels away melee the player
        this.evilWizardFollowDistance = 275; // if player is within 200 pixels follow
        this.evilWizardShootDistance = 300; // if player is within 250 pixels shoot at them
        this.evilWizardShootDelay = 2000;
        this.evilWizardPotionArray = [];

        this.orcHealth = 50
        this.orcMeleeDamage = 15;
        this.orcFollowDistance = 300;
        this.orcMeleeDelay = 1500
        this.evilWizardShootDelay

        this.enemyWanderTime = 1000;

        this.dagerDamage = 10;
        this.dagerSpeed = 500; // 1.5 second hit speed

        this.swordDamage = 20;
        this.swordSpeed = 1300; // 2.5 second hit speed

        this.axeDamage = 30;
        this.axeSpeed = 2000; // 4 second hit speed

        this.evilWizardArray = [];
        this.spiderArray = [];
        this.orcArray = [];

        this.keysCollected = 0;
        this.coinsCollected = 0;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.PARTICLE_VELOCITY = 50;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.

        let my = this.my;

        my.sounds = {};
        my.sounds.footSteps = this.sound.add("footSteps", {loop: true});
        my.sounds.potionThrow = this.sound.add("potionThrow");
        my.sounds.potionImpact = this.sound.add("potionImpact")
        my.sounds.jump = this.sound.add("jumpSound");
        my.sounds.coinCollect = this.sound.add("coinCollect");
        my.sounds.hurtSound = this.sound.add("hurtSound");
        my.sounds.deathSound = this.sound.add("deathSound");
        my.sounds.keyCollect = this.sound.add("keyCollect");
        my.sounds.axeSound = this.sound.add("axeSound");
        my.sounds.swordSound = this.sound.add("swordSound");
        my.sounds.daggerSound = this.sound.add("daggerSound");
        my.sounds.chestDeath = this.sound.add("chestDeath");
        my.sounds.enemyDeath = this.sound.add("enemyDeath");

        this.hitKey = this.input.keyboard.addKey('space');
        this.equipKey = this.input.keyboard.addKey('E');
        this.openKey = this.input.keyboard.addKey('F');

        this.map = this.add.tilemap("platformer-level-1");

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("kenny_tilemap_background", "tilemap_background");
        this.foreGroundTileset = this.map.addTilesetImage("kenny_tilemap_farm", "tilemap_farm");

        // Create a layer
        this.backGround = this.map.createLayer("Background",
            [this.backgroundTileset, this.tileset, this.foreGroundTileset],
            0, 0);
        
        this.groundLayer = this.map.createLayer(
            "Ground-n-Platforms",
            [this.tileset, this.foreGroundTileset], 0, 0
        )
        
        this.foreGround = this.map.createLayer(
            "Foreground",
            [this.tileset, this.foreGroundTileset], 0, 0
        )

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

        // animation for coins
        this.anims.create({
            key: 'coinSpin',
            frames: [
                { key: 'tilemap_sheet', frame: 151 },
                { key: 'tilemap_sheet', frame: 152 }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'chestAttack',
            frames: [
                {key: 'tilemap_dungeonSheet', frame: 89},
                {key: 'tilemap_dungeonSheet', frame: 90},
                {key: 'tilemap_dungeonSheet', frame: 91},
                {key: 'tilemap_dungeonSheet', frame: 92},
            ],
            frameRate: 8,
            repeat: -1
        })

        // get coins from object layer
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        
        this.keys = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });

        this.enemyChests = this.map.createFromObjects("Objects", {
            name: "enemyChest",
            key: "tilemap_dungeonSheet",
            frame: 89
        });

        this.dagger = this.map.createFromObjects("Objects", {
            name: "dagger",
            key: "tilemap_dungeonSheet",
            frame: 103
        });

        this.sword = this.map.createFromObjects("Objects", {
            name: "sword",
            key: "tilemap_dungeonSheet",
            frame: 104
        });

        this.axe = this.map.createFromObjects("Objects", {
            name: "axe",
            key: "tilemap_dungeonSheet",
            frame: 118
        });

        // setting coin scale 
        for (let coin of this.coins) {
            coin.setScale(2.0);
            coin.x *= 2.0;
            coin.y *= 2.0;
        }

        for (let key of this.keys) {
            key.setScale(2.0);
            key.x *= 2.0;
            key.y *= 2.0;
        }

        //set scale
        for (let enemyChest of this.enemyChests) {
            enemyChest.setScale(2.0);
            enemyChest.x *= 2.0;
            enemyChest.y *= 2.0;
            enemyChest.opened = false;

            enemyChest.health = 50;
            enemyChest.isDead = false;
            enemyChest.chomp = this.sound.add("chompSound", {loop: true});
            enemyChest.nextChompTime = 0;
        }

        for (let dagger of this.dagger) {
            dagger.setScale(2.0);
            dagger.x *= 2.0;
            dagger.y *= 2.0;
        }
        
        for (let sword of this.sword) {
            sword.setScale(2.0);
            sword.x *= 2.0;
            sword.y *= 2.0;
        }

        for (let axe of this.axe) {
            axe.setScale(2.0);
            axe.x *= 2.0;
            axe.y *= 2.0;
        }

        for (let coin of this.coins) {
            coin.anims.play('coinSpin');
        }


        // flaten and copy arrays into big weapons array
        //CHAT
        this.weapons = [
            ...this.dagger,
            ...this.sword,
            ...this.axe
        ];
        //END OF CHAT

        this.physics.world.enable(this.weapons, Phaser.Physics.Arcade.STATIC_BODY);
        this.nearWeapon = null;
        this.heldWeapon = null;

        // turn into arcade physics
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.game.config.width/4, this.game.config.height/2, "vikingPlayer").setScale(2.25)
        // my.sprite.player = this.physics.add.sprite(3700, 500, "platformer_characters", "tile_0000.png").setScale(this.SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        // add collision handler
        this.physics.add.overlap(my.sprite.player, this.coins, (player, coin) => {
            my.sounds.coinCollect.play();
            this.coinsCollected++;

            this.coinsCollectedText.setText("Coins collected: " + this.coinsCollected);
            coin.destroy();
        });

        this.physics.add.overlap(my.sprite.player, this.keys, (player, key) => {
            this.keysCollected++;
            my.sounds.keyCollect.play();

            this.keysCollectedText.setText("Keys collected: " + this.keysCollected);
            key.destroy();
        });

        // Get the worlds width and height
        const worldWidth = this.map.widthInPixels * 2.0;
        const worldHeight = this.map.heightInPixels * 2.0;

        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.startFollow(my.sprite.player, true, 0.5, 0.5); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        // this.cameras.main.setZoom(2);
        
        // create map bounds
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        let greenSpawns = [
            { x1: 3840, y1: 51, x2: 4200, y2: 51 }, // top of green tree
            { x1: 3200, y1: 411, x2: 3500, y2: 411 }, // little tree and rope
            { x1: 3940, y1: 519, x2: 3940, y2: 519 },
            { x1: 3903, y1: 735, x2: 3903, y2: 735 }
        ];

        let desertSpawns = [
            { x1: 2470, y1: 663, x2: 2470, y2: 663 },
            { x1: 2207, y1: 555, x2: 2207, y2: 555 },
            { x1: 2100, y1: 231, x2: 2100, y2: 231 }
        ];
        
        let snowSpawns = [
            { x1: 597, y1: 735, x2: 597, y2: 735 }
        ];
        
        //chat
        this.evilWizardArray.push(
            ...specificSpawnEnemies(this, "evilWizard", greenSpawns, 1),
            ...specificSpawnEnemies(this, "evilWizard", desertSpawns, 1),
            ...specificSpawnEnemies(this, "evilWizard", snowSpawns, 1),
        );
        //end of chat

        for (let i = 0; i < 15; i++) {
            let randX = Phaser.Math.Between(0, worldWidth);
            let randY = Phaser.Math.Between(820, worldHeight);

            let orc = this.physics.add.sprite(randX, randY, "orc");

            orc.setScale(2.25);
            orc.setCollideWorldBounds(true);
            
            orc.health = this.orcHealth;
            orc.isDead = false;
            orc.wander = false;
            orc.chase = false;
            orc.shoot = false;

            orc.stopDistance = 30;
            orc.wanderTimer = this.enemyWanderTime;
            orc.nextWanderChange = 0;
            orc.nextShootTime = 0;
            orc.meleeDelay = this.orcMeleeDelay
            
            orc.speed = 150
            orc.meleeDistance = 40;
            orc.followDistance = this.orcFollowDistance;
            orc.nextMeleeTime = 0;

            this.physics.add.collider(orc, this.groundLayer);

            this.orcArray.push(orc);
        }

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
         this.cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        this.health = this.add.text(100, 50, "Health: " + this.playerHealth,
            {
                fontSize: "30px",
                fill: "#fd0000"
            }).setOrigin(0.5).setScrollFactor(0);

        this.keysCollectedText = this.add.text(155, 100, "Keys collected: " + this.keysCollected,
            {
                fontSize: "30px",
                fill: "#25a70b"
            }).setOrigin(0.5).setScrollFactor(0);
            
        this.coinsCollectedText = this.add.text(162, 150, "Coins collected: " + this.coinsCollected,
            {
                fontSize: "30px",
                fill: "#1e06f8"
            }).setOrigin(0.5).setScrollFactor(0);
    }

    update(time, deltaTime) {

        console.log(`${this.my.sprite.player.x}, ${this.my.sprite.player.y}`)

        let cursors = this.cursors;
        let my = this.my;

        let grounded = my.sprite.player.body.blocked.down;

        this.nearWeapon = null;
        // loop through weapons
        for (let weapon of this.weapons) {
            // continue if we are already holding weapon
            if (weapon === this.heldWeapon) continue;
            if (!weapon.body.enable) continue;

            // get distance between weapon and player
            let dist = Phaser.Math.Distance.Between(my.sprite.player.x, my.sprite.player.y,weapon.x, weapon.y);
            
            // if dis is less than 40 we can equipd it
            if (dist < 40) {
                this.nearWeapon = weapon;
                break;
            }
        }

        if(cursors.left.isDown) {
            my.sprite.player.body.setVelocityX(-this.ACCELERATION);
            
            my.sprite.player.setFlip(true, false);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (grounded) {
                my.vfx.walking.start();
                if (!my.sounds.footSteps.isPlaying) {
                    my.sounds.footSteps.play();
                }
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.body.setVelocityX(this.ACCELERATION);

            my.sprite.player.resetFlip();

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (grounded) {
                my.vfx.walking.start();
                if (!my.sounds.footSteps.isPlaying) {
                    my.sounds.footSteps.play();
                }
            }

        } else {
            my.sprite.player.body.setVelocityX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.vfx.walking.stop();
            my.sounds.footSteps.stop();
        }

        if (!grounded) {
            my.sounds.footSteps.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.sounds.jump.play();
        }

        if (Phaser.Input.Keyboard.JustDown(this.equipKey) && this.nearWeapon) {

            let newWeapon = this.nearWeapon;
            
            if (this.heldWeapon) {
                this.heldWeapon.body.enable = true;
                this.heldWeapon.body.reset(this.heldWeapon.x, this.heldWeapon.y);
            }
            
            this.heldWeapon = newWeapon;
            this.heldWeapon.body.enable = false;

            this.nearWeapon = null;

            this.currentWeapon = this.heldWeapon.name;

            // damage values
            if (this.currentWeapon == "dagger") {
                this.playerHitDamage = this.dagerDamage;
                this.playerHitSpeed = this.dagerSpeed;
                this.hitSound = my.sounds.daggerSound;
            }

            if (this.currentWeapon == "sword") {
                this.playerHitDamage = this.swordDamage;
                this.playerHitSpeed = this.swordSpeed;
                this.hitSound = my.sounds.swordSound;
            }

            if (this.currentWeapon == "axe") {
                this.playerHitDamage = this.axeDamage;
                this.playerHitSpeed = this.axeSpeed;
                this.hitSound = my.sounds.axeSound;
            }
        }
        
        if (this.heldWeapon) {
            
            // if facing right
            if (my.sprite.player.flipX == true) {
                // facing left
                this.heldWeapon.x = my.sprite.player.x - 25;
                this.heldWeapon.y = my.sprite.player.y + 5;
            } else {
                this.heldWeapon.x = my.sprite.player.x + 25;
                this.heldWeapon.y = my.sprite.player.y + 5;
            }
        }

        this.enemies = [
            ...this.evilWizardArray,
            ...this.enemyChests,
            ...this.orcArray
        ];
        
        if (Phaser.Input.Keyboard.JustDown(this.hitKey) && this.heldWeapon && time >= this.nextPlayerHitTime) {

            // calculate next time
            this.nextPlayerHitTime = time + this.playerHitSpeed;

            // play sound
            if (this.hitSound) {
                this.hitSound.play();
            }
            
            for (let enemy of this.enemies) {
                let distance = Phaser.Math.Distance.Between( my.sprite.player.x, my.sprite.player.y, enemy.x, enemy.y);
                
                if (distance < 100) {
                    enemy.health -= this.playerHitDamage;


                    
                    if (enemy.health <= 0) {
                        if (enemy.chomp) {
                            my.sounds.chestDeath.play();
                            enemy.chomp.stop();
                            enemy.chomp.destroy();
                        } else {
                            my.sounds.enemyDeath.play();
                        }

                        enemy.isDead = true;
                        enemy.destroy();
                    }
                }
            }
        }
        
        // filter out the dead enemies
        this.evilWizardArray = this.evilWizardArray.filter(enemy => !enemy.isDead);
        this.enemyChests = this.enemyChests.filter(chest => !chest.isDead);
        this.orcArray = this.orcArray.filter(orc => !orc.isDead);


        // this.evilWizardArray = hitEnemy(this, this.evilWizardArray);

        enemyMovement(this, this.evilWizardArray);
        enemyMovement(this, this.orcArray);
        // seperateEnemies(this.evilWizardArray);
        moveProjectile(this, deltaTime);

        // loop through each chest
        for (let chest of this.enemyChests) {

            if (chest.isDead == true) continue;

            // get disntace from player to chest
            let distanceFromChest = Phaser.Math.Distance.Between (my.sprite.player.x, my.sprite.player.y, chest.x, chest.y);

            if (distanceFromChest < 800 && !chest.opened) {
                chest.opened = true;
                chest.chomp.play();
                chest.anims.play("chestAttack");
            }

            if (chest.opened && distanceFromChest < 50 && time >= chest.nextChompTime) {
                this.playerHealth -= 0.5;
                this.health.setText("Health: " + Math.ceil(this.playerHealth));
                chest.nextChompTime = time + 1000;
                this.my.sounds.hurtSound.play()
            }

            if (distanceFromChest > 50 && chest.opened) {
                chest.opened = false;
                chest.chomp.stop();
                chest.anims.stop();
                chest.setFrame(89);
            }

        }
    }
}

export default Overworld;