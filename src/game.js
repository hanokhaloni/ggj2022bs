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
    },
    create: function() {
        var width = this.game.width;
        var height = this.game.height;

        this.game.world.setBounds(-width, -height, width * 2, height * 2);
        this.game.stage.backgroundColor = '#444';

        //add tilesprite background
        var background = this.game.add.tileSprite(-width, -height,
            this.game.world.width, this.game.world.height, 'background');

        //initialize physics and groups
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.foodGroup = this.game.add.group();
        this.snakeHeadCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.foodCollisionGroup = this.game.physics.p2.createCollisionGroup();

        //add food randomly
        for (var i = 0; i < 100; i++) {
            this.initFood(Util.randomInt(-width, width), Util.randomInt(-height, height));
        }

        //show logo splash
        this.showlogo();
        this.game.input.onDown.add(this.removeLogo, this);

        this.game.snakes = [];

        //create player
        let cursors = this.game.input.keyboard.createCursorKeys();

        var snake = new PlayerSnake(this.game, 'circle', cursors, 0, 0, 0xff0000);
        this.game.camera.follow(snake.head);

        let cursors2 = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D });

        var snake2 = new PlayerSnake(this.game, 'circle', cursors2, 100, 0, 0x00ff00);
        this.game.camera.follow(snake.head);


        //create bots
        new BotSnake(this.game, 'circle2', -200, 0);
        new BotSnake(this.game, 'circle2', 200, 0);

        new BotSnake(this.game, 'circle2', -220, 500);
        new BotSnake(this.game, 'circle2', 220, 500);

        new BotSnake(this.game, 'circle2', -180, -500);
        new BotSnake(this.game, 'circle2', 180, -500);


        //initialize snake groups and collision
        for (var i = 0; i < this.game.snakes.length; i++) {
            var snake = this.game.snakes[i];
            snake.head.body.setCollisionGroup(this.snakeHeadCollisionGroup);
            snake.head.body.collides([this.foodCollisionGroup]);
            //callback for when a snake is destroyed
            snake.addDestroyedCallback(this.snakeDestroyed, this);
        }
    },
    showlogo: function() {
        this.logo = this.game.add.sprite(0, 0, 'logo');
        this.logo.fixedToCamera = true;
    },

    removeLogo: function() {

        this.game.input.onDown.remove(this.removeLogo, this);
        this.logo.kill();

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
        this.game.world.bringToTop(this.logo);
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
    }
};