class Overworld extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.playerHealth = 100;
        this.playerHitDamage = 5;

        this.evilWizardDamage = 10;
        this.evilWizardMeleeDistance = 5;
        this.evilWizardShootDistance = 15;
        this.evilWizardShootDelay = 3000;
        this.evilWizardFireballArray = [];


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
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.backgroundTileset = this.map.addTilesetImage("kenny_tilemap_background", "tilemap_background");
        this.foreGroundTileset = this.map.addTilesetImage("kenny_tilemap_farm", "tilemap_farm");

        // Create a layer
        this.backGround = this.map.createLayer("Background", this.backgroundTileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.foreGround = this.map.createLayer("Foreground", this.foreGroundTileset, 0, 0);

        this.backGround.setScale(2.0);
        this.groundLayer.setScale(2.0);
        this.foreGround.setScale(2.0);

        
        this.foreGround.setDepth(1);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        this.knight = this.physics.add.sprite(200, 200, "knight");
        this.evilWizard = this.physics.add.sprite(250, 250, "evilWizard");
        this.orc = this.physics.add.sprite(300, 300, "orc");

        for (let i = 0; i < 5; i++) {
            let distanceDiffernece = 20;
            let wizard = this.physics.add.sprite(600 + distanceDiffernece * i, 600 + distanceDiffernece * i, "evilWizard");

            wizard.setScale(2.55);
            wizard.setCollideWorldBounds(true);
            wizard.speed = 80 + distanceDiffernece * i;

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
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

    }

    update() {
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

        for (let wizard of this.evilWizardArray) {
            let distanceX = my.sprite.player.x - wizard.x;

        if (Math.abs(distanceX) > 20) {
            if (distanceX > 0) {
                wizard.setVelocityX(wizard.speed);
                wizard.setFlipX(false);
            } else {
                wizard.setVelocityX(-wizard.speed);
                wizard.setFlipX(true);
            }
        } else {
            wizard.setVelocityX(0);
        } 
    }
    }
}