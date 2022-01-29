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
    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.viewWidth = width;
        this.viewHeight = height;

        this.game.world.setBounds(-width, -height, width * 9, height * 9);
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
        this.phase0 = 'Phase 0 : Get to 10 points together';
        this.phaseText = this.game.add.text(220, 10, this.phase0, { font: '45px Arial', fill: '#a0a' });
        this.phaseText.fixedToCamera = true;

        //add food randomly
        for (var i = 0; i < 100; i++) {
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
        this.game.camera.follow(this.snakeP1.head);

        let cursors2 = this.game.input.keyboard.createCursorKeys();
        this.snakeP2 = new PlayerSnake(this.game, 'circle', cursors2, 100, 0, 0x00ff00, this.scoreP2Text);
        //this.game.camera.follow(this.snakeP1.head);


        //create bots
        new BotSnake(this.game, 'circle2', -200, 0);
        new BotSnake(this.game, 'circle2', 200, 0);

        new BotSnake(this.game, 'circle2', -300, 0);
        new BotSnake(this.game, 'circle2', 300, 0);

        new BotSnake(this.game, 'circle2', -400, 0);
        new BotSnake(this.game, 'circle2', 400, 0);

        new BotSnake(this.game, 'circle2', -500, 0);
        new BotSnake(this.game, 'circle2', 500, 0);

        new BotSnake(this.game, 'circle2', -600, 0);
        new BotSnake(this.game, 'circle2', 600, 0);

        new BotSnake(this.game, 'circle2', -220, 500);
        new BotSnake(this.game, 'circle2', 220, 500);

        new BotSnake(this.game, 'circle2', -180, -500);
        new BotSnake(this.game, 'circle2', 180, -500);

        new BotSnake(this.game, 'circle2', -180, -600);
        new BotSnake(this.game, 'circle2', 180, -600);

        new BotSnake(this.game, 'circle2', -180, -700);
        new BotSnake(this.game, 'circle2', 180, -700);


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
        //this.game.time.events.add(Phaser.Timer.SECOND * 2, this.showlogo(), this);
    },
    showlogo: function() {
        this.logo = this.game.add.sprite(0, 0, 'logo');
        this.logo.fixedToCamera = true;
        this.game.input.onDown.add(this.removeLogo, this);
        //this.game.time.events.add(Phaser.Timer.SECOND * 0.5, this.pause, this);

    },
    removeLogo: function() {
        this.game.time.events.remove(this.pause, this);
        //this.game.input.onDown.remove(this.removeLogo, this);
        this.logo.kill();
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
        this.game.debug.text("Snake1 score : " + this.snakeP1.score, 32, 32);
        this.game.debug.text("Snake2 score : " + this.snakeP2.score, 32, 64);

        if (this.snakeP1.score + this.snakeP2.score === 10) {
            console.log("more than 10 !");
            this.phaseText.text = 'Phase complete - last worm standing wins!';
            this.snakeP1.score++;
            this.snakeP2.score++;
            //TODO move this to somewhere with less damage.... laso this needs to happen only once!
        }

        this.zoomIn();

    },
    zoomIn: function() {
        this.game.camera.scale.x *= 0.9999;
        this.game.camera.scale.y *= 0.9999;
        //TODO fix this zoom

        // this.game.camera.bounds.x = this.viewWidth * this.game.camera.scale.x;
        // this.game.camera.bounds.y = this.viewHeight * this.game.camera.scale.y;
        // this.game.camera.bounds.width = this.viewWidth * this.game.camera.scale.x;
        // this.game.camera.bounds.height = this.viewHeight * this.game.camera.scale.y;
        // this.game.camera.follow(this.snakeP1.head);
    }
};