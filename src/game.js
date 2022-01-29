Game = function(game) {}

Game.prototype = {
    preload: function() {

        //load assets
        this.game.load.image('circle', 'asset/circle.png');
        this.game.load.image('circle2', 'asset/circle2.png');
        this.game.load.image('shadow', 'asset/white-shadow.png');
        this.game.load.image('background', 'asset/tile.png');

        this.game.load.image('eye-white', 'asset/eye-white.png');
        this.game.load.image('eye-black', 'asset/eye-black.png');

        this.game.load.image('food', 'asset/hex.png');

        this.game.load.image('logo', 'asset/logo.png');

        this.game.load.audio('background-music', 'asset/Paul Whiteman - Parade of the wooden soldiers.mp3');
        this.game.load.audio('tada', 'asset/ta-da-organ-sound-effect-4122925.mp3');
        this.game.load.audio('alert', 'asset/tng_red_alert2.mp3');
        this.game.load.audio('gameover', 'asset/thats-it-man-game-over-man!-game-over!.mp3');


    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.phaseFoodCount = 100;
        this.currentPhase = 1;

        this.viewWidth = width;
        this.viewHeight = height;

        this.game.world.setBounds(-width, -height, width * 3, height * 3);
        this.game.stage.backgroundColor = '#444';

        //add tilesprite background
        var background = this.game.add.tileSprite(-width, -height,
            this.game.world.width, this.game.world.height, 'background');

        //initialize physics and groups
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.foodGroup = this.game.add.group();
        this.snakeHeadCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.foodCollisionGroup = this.game.physics.p2.createCollisionGroup();

        //  The score
        this.scoreP1String = 'Score P1 : ';
        this.scoreP1Text = this.game.add.text(10, 10, this.scoreP1String, { font: '34px Arial', fill: '#f00' });
        this.scoreP1Text.fixedToCamera = true;
        this.scoreP2String = 'Score P2 : ';
        this.scoreP2Text = this.game.add.text(10, 50, this.scoreP2String, { font: '34px Arial', fill: '#0f0' });
        this.scoreP2Text.fixedToCamera = true;

        // the phase
        this.phase0 = 'Phase 0 : Get to ' + this.phaseFoodCount + ' points together';
        this.phaseText = this.game.add.text(220, 10, this.phase0, { font: '45px Arial', fill: '#a0a' });
        this.phaseText.fixedToCamera = true;

        //add food randomly
        for (var i = 0; i < 500; i++) {
            this.initFood(Util.randomInt(-width, width), Util.randomInt(-height, height));
        }

        //add music
        this.music = this.game.add.audio('background-music');
        this.music.play();
        this.music.volume = 1.0;

        this.game.snakes = [];

        //create player
        let cursors1 = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D });
        this.snakeP1 = new PlayerSnake(this.game, 'circle', cursors1, 0, 0, 0xff0000, this.scoreP1Text);
        //this.game.camera.focusOnXY(300, 3000);
        this.game.camera.follow(this.snakeP1.head);
        this.snakeP1.addDestroyedCallback(this.gameover, this)

        let cursors2 = this.game.input.keyboard.createCursorKeys();
        this.snakeP2 = new PlayerSnake(this.game, 'circle', cursors2, 100, 0, 0x00ff00, this.scoreP2Text);
        //this.game.camera.follow(this.snakeP1.head);
        this.snakeP2.addDestroyedCallback(this.gameover, this)


        //create bots
        new BotSnake(this.game, 'circle2', -200, 0);
        new BotSnake(this.game, 'circle2', 200, 0);

        for (var i = 0; i < 12; i++) {
            //-width, , width * 3, -height,height * 3
            new BotSnake(this.game,
                'circle2',
                this.game.rnd.integerInRange(-width, width * 3),
                this.game.rnd.integerInRange(-height, height * 3));
        }


        //initialize snake groups and collision
        for (var i = 0; i < this.game.snakes.length; i++) {
            var snakeP1 = this.game.snakes[i];
            snakeP1.head.body.setCollisionGroup(this.snakeHeadCollisionGroup);
            snakeP1.head.body.collides([this.foodCollisionGroup]);
            //callback for when a snake is destroyed
            snakeP1.addDestroyedCallback(this.snakeDestroyed, this);
        }

        //show logo splash
        this.showlogo();
        //this.game.time.events.add(Phaser.Timer.SECOND * 10, this.hideLogo(), this);
    },
    showlogo: function() {
        this.game.time.slowMotion = 3;
        this.logo = this.game.add.sprite(0, 0, 'logo');
        this.logo.fixedToCamera = true;
        //this.game.input.onDown.add(this.hideLogo, this);
        this.game.time.events.add(Phaser.Timer.SECOND * 5, this.hideLogo, this);
        var alertSound = this.game.add.audio('alert');
        alertSound.play();

    },
    hideLogo: function() {
        this.game.time.events.remove(this.hideaaaaaaaaadadLogo, this);
        //this.game.input.onDown.remove(this.removeLogo, this);
        this.logo.kill();
        this.game.time.slowMotion = 1;
        //this.game.paused = false;

    },
    pause: function() {
        //this.game.paused = true;
    },
    /**
     * Main update loop
     */
    update: function() {
        //update game components
        for (var i = this.game.snakes.length - 1; i >= 0; i--) {
            this.game.snakes[i].update();
        }
        for (var i = this.foodGroup.children.length - 1; i >= 0; i--) {
            var f = this.foodGroup.children[i];
            f.food.update();
        }
        if (this.logo) {
            this.game.world.bringToTop(this.logo);
        }
    },
    /**
     * Create a piece of food at a point
     * @param  {number} x x-coordinate
     * @param  {number} y y-coordinate
     * @return {Food}   food object created
     */
    initFood: function(x, y) {
        var f = new Food(this.game, x, y);
        f.sprite.body.setCollisionGroup(this.foodCollisionGroup);
        this.foodGroup.add(f.sprite);
        f.sprite.body.collides([this.snakeHeadCollisionGroup]);
        return f;
    },
    snakeDestroyed: function(snake) {
        //place food where snake was destroyed
        for (var i = 0; i < snake.headPath.length; i += Math.round(snake.headPath.length / snake.snakeLength) * 2) {
            this.initFood(
                snake.headPath[i].x + Util.randomInt(-10, 10),
                snake.headPath[i].y + Util.randomInt(-10, 10)
            );
        }
    },
    render: function() {
        if (this.snakeP1.score + this.snakeP2.score === this.phaseFoodCount) {
            this.startPhase2();
            //TODO move this to somewhere with less damage.... laso this needs to happen only once!
        }

        this.zoomIn();

    },
    zoomIn: function() {
        //console.log("ZOOM" + this.game.camera.scale.x);
        if (this.game.camera.scale.x > 0.5) {
            this.game.camera.scale.x *= 0.9999;
            this.game.camera.scale.y *= 0.9999;
        }
        //TODO fix this zoom

        // this.game.camera.bounds.x = this.viewWidth * this.game.camera.scale.x;
        // this.game.camera.bounds.y = this.viewHeight * this.game.camera.scale.y;
        // this.game.camera.bounds.width = this.viewWidth * this.game.camera.scale.x;
        // this.game.camera.bounds.height = this.viewHeight * this.game.camera.scale.y;
        // this.game.camera.follow(this.snakeP1.head);
    },
    startPhase1: function() {

    },
    startPhase2: function() {
        console.log("more than " + this.phaseFoodCount);
        this.phaseText.text = 'Phase complete - last worm standing wins!';
        this.snakeP1.score++;
        this.snakeP2.score++;
        this.currentPhase = 2;

        this.phase2text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "- Duality! -\nLast worm standing\nWINS!");
        this.phase2text.anchor.setTo(0.5);
        this.phase2text.fixedToCamera = true;

        this.phase2text.font = 'Fontdiner Swanky';
        this.phase2text.fontSize = 60;

        var grd = this.phase2text.context.createLinearGradient(0, 0, 0, this.phase2text.canvas.height);
        grd.addColorStop(0, '#8ED6FF');
        grd.addColorStop(1, '#004CB3');
        this.phase2text.fill = grd;

        this.phase2text.align = 'center';
        this.phase2text.stroke = '#000000';
        this.phase2text.strokeThickness = 2;
        this.phase2text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        this.game.time.events.add(Phaser.Timer.SECOND * 5, this.hidePhase2Text, this);

        var tada = this.game.add.audio('tada');
        tada.play();
        this.game.camera.shake(0.10, 200);
    },
    hidePhase2Text: function() {
        this.phase2text.kill();
    },
    gameover: function() {
        this.game.camera.flash(0xff0000, 500);
        this.music.stop();
        var gameoversound = this.game.add.audio('gameover');
        gameoversound.play();
        //this.game.paused = true;
        if (this.currentPhase === 1) {
            console.log("You all lost!");
            var gameoverText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Game over!-\n You need to work together\nYou can do this!!");
            gameoverText.anchor.setTo(0.5);
            gameoverText.fixedToCamera = true;

            gameoverText.font = 'Fontdiner Swanky';
            gameoverText.fontSize = 80;

            var grd = gameoverText.context.createLinearGradient(0, 0, 0, gameoverText.canvas.height);
            grd.addColorStop(0, '#FF0000');
            grd.addColorStop(1, '#FFF000');
            gameoverText.fill = grd;

            gameoverText.align = 'center';
            gameoverText.stroke = '#000000';
            gameoverText.strokeThickness = 2;
            gameoverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        } else {
            console.log("someone won");
            var gameoverText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Game over!-\n Someone won\nI was too lazy to implement\nwho the winner is!!\nCongrats the winner!");
            gameoverText.anchor.setTo(0.5);
            gameoverText.fixedToCamera = true;

            gameoverText.font = 'Fontdiner Swanky';
            gameoverText.fontSize = 120;


            gameoverText.fill = '#ff00ff';;

            gameoverText.align = 'center';
            gameoverText.stroke = '#000000';
            gameoverText.strokeThickness = 2;
            gameoverText.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        }
    }
};