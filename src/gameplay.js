var AMOUNT_DIAMONDS = 40;
var AMOUNT_BOOBLES = AMOUNT_DIAMONDS;
var puntaje = [],
    id_diamante = [];

GamePlayManager = {
    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;
        this.countSmile = -1;
    },

    preload: function () {
        game.load.image('background', 'assets/img/background.png');
        game.load.spritesheet('horse', 'assets/img/horse.png', 84, 156, 2);
        game.load.spritesheet('diamonds', 'assets/img/diamonds.png', 81, 84, 4);
        game.load.image('explosion', 'assets/img/explosion.png');
        game.load.image('shark', 'assets/img/shark.png');
        game.load.image('fishes', 'assets/img/fishes.png');
        game.load.image('mollusk', 'assets/img/mollusk.png');
        game.load.image('booble1', 'assets/img/booble1.png');
        game.load.image('booble2', 'assets/img/booble2.png');
    },
    create: function () {
        /**imagen de fondo**/
        game.add.sprite(0, 0, 'background');


        /**imagenes burbujas**/
        this.boobleArray = [];
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            var xBooble = game.rnd.integerInRange(1, 1140);
            var yBooble = game.rnd.integerInRange(600, 950);
            var booble = game.add.sprite(xBooble, yBooble, 'booble' + game.rnd.integerInRange(1, 2));
            booble.vel = 0.2 + game.rnd.frac() * 2;
            booble.alpha = 0.9;
            booble.scale.setTo(0.2 + game.rnd.frac());
            this.boobleArray[i] = booble;
        }

        /**imagenes peces**/
        this.mollusk = game.add.sprite(500, 150, 'mollusk');
        this.shark = game.add.sprite(500, 20, 'shark');
        this.fishes = game.add.sprite(100, 550, 'fishes');
        /**caballo de mar**/
        this.horse = game.add.sprite(0, 0, 'horse');
        this.horse.frame = 0;
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;
        this.horse.anchor.setTo(0.5);

        game.input.onDown.add(this.onTap, this);

        /**diamantes**/
        this.diamonds = [];
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            var diamond = game.add.sprite(100, 100, 'diamonds');
            diamond.frame = game.rnd.integerInRange(0, 3);
            diamond.scale.setTo(0.30 + game.rnd.frac());
            diamond.anchor.setTo(0.55);
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);
            diamond.id = i;
            id_diamante.push(diamond.id);

            if (diamond.frame == 0) {
                puntaje.push(0);
            } else if (diamond.frame == 1) {
                puntaje.push(1);
            } else if (diamond.frame == 2) {
                puntaje.push(2);
            } else if (diamond.frame == 3) {
                puntaje.push(3);
            }

            this.diamonds[i] = diamond;
            var rectCurrentDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse);

            while (this.isOverlappingOtherDiamond(i, rectCurrentDiamond) || this.isRectanglesOverlapping(rectHorse, rectCurrentDiamond)) {
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrentDiamond = this.getBoundsDiamond(diamond);
            }
        }

        /**explosion**/

        this.explosionGroup = game.add.group();
        for (var i = 0; i < 10; i++) {

            this.explosion = this.explosionGroup.create(100, 100, 'explosion');
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]

            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }

        /**puntaje**/
        this.currentScore = 0;
        var style = {
            font: 'bold 30pt Arial',
            fill: '#fff',
            aling: 'center',
            index: 2
        }
        this.scoreText = game.add.text(game.width / 2, 40, '0'+' points', style);
        this.scoreText.anchor.setTo(0.5);

        this.totalTime = 20;
        this.timerText = game.add.text(1000, 40, this.totalTime + ''+' seconds', style);
        this.timerText.anchor.setTo(0.5);

        this.DiamondsLeft = AMOUNT_DIAMONDS;
        this.DiamondsLeftText = game.add.text(30, 15,'Diamonds ' + this.DiamondsLeft + '', style);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function () {
            if (this.flagFirstMouseDown) {
                this.totalTime--;
                this.timerText.text = this.totalTime + '' + ' seconds';
                if (this.totalTime <= 0) {
                    game.time.events.remove(this.timweGameOver);
                    this.endGame = true;
                    this.showFinalMessage('You Lose');
                }
            }
        }, this);
    },

    increaseScore: function () {
        this.countSmile = 0;
        this.horse.frame = 1;
        this.DiamondsLeft--;
        this.DiamondsLeftText.text = 'Diamonds ' + this.DiamondsLeft + '';

        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {

            if (puntaje[i] == 0) {
                this.currentScore += 2;

            } else if (puntaje[i] == 1) {
                this.currentScore += 4;

            } else if (puntaje[i] == 2) {
                this.currentScore += 8;

            } else if (puntaje[i] == 3) {
                this.currentScore += 10;

            }
            this.scoreText.text = this.currentScore+' points';
        }

        this.amountDiamondsCaught += 1;
        if (this.amountDiamondsCaught >= AMOUNT_DIAMONDS) {
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('You Won!');
        }
    },
    showFinalMessage: function (msg) {
        this.tweenMollusk.stop();
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000';
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height);

        var bg = game.add.sprite(0, 0, bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 60pt Arial',
            fill: '#fff',
            aling: 'center',
            index: 2
        }
        this.textFieldFinalMsg = game.add.text(game.width / 2, game.height / 2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },

    /**iniciar juego**/
    onTap: function () {
        if (!this.flagFirstMouseDown) {
            this.tweenMollusk = game.add.tween(this.mollusk.position).to({
                y: -0.001
            }, 5800, Phaser.Easing.Cubic.InOut, true, 0, 100, true).loop(true);

            for (var i; i < AMOUNT_DIAMONDS; i++) {
                this.tweenDiamantes = game.add.tween(this.diamonds[i].position).to({
                    y: -0.001
                }, 5800, Phaser.Easing.Cubic.InOut, true, 0, 100, true).loop(true);
            }
        }
        this.flagFirstMouseDown = true;
    },

    getBoundsDiamond: function (currentDiamond) {
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function (rect1, rect2) {
        if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
            return false;
        }
        if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
            return false;
        }
        return true;
    },
    isOverlappingOtherDiamond: function (index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if (this.isRectanglesOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false;
    },
    getBoundsHorse: function () {
        var x0 = this.horse.x - Math.abs(this.horse.width) / 4;
        var width = Math.abs(this.horse.width) / 2;
        var y0 = this.horse.y - this.horse.height / 2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },
    render: function () {
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) { }
    },
    update: function () {

        for (var j = 0; j < AMOUNT_DIAMONDS; j++) {

            this.diamonds[j].angle += 0.4;
        }

        if (this.flagFirstMouseDown && !this.endGame) {
            for (var i = 0; i < AMOUNT_BOOBLES; i++) {
                var booble = this.boobleArray[i];
                booble.y -= booble.vel;
                if (booble.y < -50) {
                    booble.y = 700;
                    booble.x = game.rnd.integerInRange(1, 1140);
                }
            }

            if (this.countSmile >= 0) {
                this.countSmile++;
                if (this.countSmile > 50) {
                    this.countSmile = -1;
                    this.horse.frame = 0;
                }
            }

            this.shark.x--;
            if (this.shark.x < -300) {
                this.shark.x = 1300;
            }

            this.fishes.x += 0.3;
            if (this.fishes.x > 1300) {
                this.fishes.x = -300;
            }
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.horse.x;
            var distY = pointerY - this.horse.y;

            if (distX > 0) {
                this.horse.scale.setTo(1, 1);
            } else {
                this.horse.scale.setTo(-1, 1);
            }
            this.horse.x += distX * 0.02;
            this.horse.y += distY * 0.02;

            for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
                var rectHorse = this.getBoundsHorse();
                var reacDiamond = this.getBoundsDiamond(this.diamonds[i]);
                if (this.diamonds[i].visible && this.isRectanglesOverlapping(rectHorse, reacDiamond)) {
                    this.increaseScore(); /*incrementa el piuntaje*/
                    this.diamonds[i].visible = false;



                    var explosion = this.explosionGroup.getFirstDead();
                    if (explosion != null) {
                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        explosion.tweenAlpha.onComplete.add(
                            function (currentTarget, cunrrentTween) {
                                currentTarget.kill();
                            }, this);
                    }
                }
            }
        }
    } /* update*/
} /*GamePlayManager*/

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);

game.state.start("gameplay");
