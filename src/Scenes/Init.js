class Init extends Phaser.Scene {
    constructor() {
        super("initScene");

        this.my = {text: {}}
    }

    create() {
        this.my.text.title = this.add.bitmapText(this.game.config.width / 2, 120, "rocketSquare", "VIKING VALHALLA", 48).setOrigin(0.5);

        this.add.text( this.game.config.width / 2, 330, "Press SPACE to Start",
            {
                fontSize: "28px",
                fill: "#00fd22"
            }
        ).setOrigin(0.5);

        this.add.text( this.game.config.width / 2, 390, "Collect coins, find keys, and defeat enemies",
            {
                fontSize: "22px",
                fill: "#ffffff"
            }
        ).setOrigin(0.5);

        this.add.text( this.game.config.width / 2, 450, "Controls: arrow keys(move), e(equip), spacebar(attack)",
            {
                fontSize: "22px",
                fill: "#ffffff"
            }
        ).setOrigin(0.5);

         this.my.text.createdBy = this.add.bitmapText( this.game.config.width / 2, 600, "rocketSquare", "Created By: Ivan Argueta", 28).setOrigin(0.5);

         this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }


    update() {
        
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("platformerScene");
        }
    }
}

export default Init;