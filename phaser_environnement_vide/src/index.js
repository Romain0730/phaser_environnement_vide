/***********************************************************************/
/** CONFIGURATION ET LANCEMENT DU JEU
/***********************************************************************/
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

/***********************************************************************/
/** VARIABLES GLOBALES
/***********************************************************************/
var player;
var groupe_plateformes;
var groupe_etoiles;
var groupe_bombes;
var clavier;

var score = 0;
var zone_texte_score;
var gameOver = false;

/***********************************************************************/
/** PRELOAD
/***********************************************************************/
function preload() {
    this.load.image('img_ciel', 'src/assets/sky.png');
    this.load.image('img_plateforme', 'src/assets/platform.png');
    this.load.image('img_etoile', 'src/assets/star.png');
    this.load.image('img_bombe', 'src/assets/bomb.png');

    this.load.spritesheet('img_perso', 'src/assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
}

/***********************************************************************/
/** CREATE
/***********************************************************************/
function create() {

    // décor
    this.add.image(400, 300, 'img_ciel');

    // plateformes
    groupe_plateformes = this.physics.add.staticGroup();
    groupe_plateformes.create(400, 584, 'img_plateforme').setScale(2).refreshBody();
    groupe_plateformes.create(600, 450, 'img_plateforme');
    groupe_plateformes.create(50, 300, 'img_plateforme');
    groupe_plateformes.create(750, 220, 'img_plateforme');

    // joueur
    player = this.physics.add.sprite(100, 450, 'img_perso');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, groupe_plateformes);

    // clavier
    clavier = this.input.keyboard.createCursorKeys();

    // animations
    this.anims.create({
        key: 'anim_gauche',
        frames: this.anims.generateFrameNumbers('img_perso', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'anim_face',
        frames: [{ key: 'img_perso', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'anim_droite',
        frames: this.anims.generateFrameNumbers('img_perso', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // étoiles
    groupe_etoiles = this.physics.add.group();

    for (var i = 0; i < 10; i++) {
        var coordX = 70 + 70 * i;
        groupe_etoiles.create(coordX, 10, 'img_etoile');
    }

    this.physics.add.collider(groupe_etoiles, groupe_plateformes);

    groupe_etoiles.children.iterate(function (etoile) {
        etoile.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.overlap(player, groupe_etoiles, ramasserEtoile, null, this);

    // bombes
    groupe_bombes = this.physics.add.group();
    this.physics.add.collider(groupe_bombes, groupe_plateformes);
    this.physics.add.collider(player, groupe_bombes, chocAvecBombe, null, this);

    // score
    zone_texte_score = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#000'
    });
}

/***********************************************************************/
/** UPDATE
/***********************************************************************/
function update() {

    if (gameOver) {
        return;
    }

    if (clavier.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('anim_gauche', true);
    }
    else if (clavier.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('anim_droite', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('anim_face');
    }

    if (clavier.space.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

/***********************************************************************/
/** CRÉATION D'UNE BOMBE
/***********************************************************************/
function creerBombe(player) {

    var x;

    if (player.x < 400) {
        x = Phaser.Math.Between(400, 800);
    } else {
        x = Phaser.Math.Between(0, 400);
    }

    var bombe = groupe_bombes.create(x, 16, 'img_bombe');
    bombe.setBounce(1);
    bombe.setCollideWorldBounds(true);
    bombe.setVelocity(
        Phaser.Math.Between(-200, 200),
        20
    );
    bombe.allowGravity = false;
}

/***********************************************************************/
/** RAMASSER UNE ÉTOILE
/***********************************************************************/
function ramasserEtoile(player, etoile) {

    etoile.disableBody(true, true);

    score += 10;
    zone_texte_score.setText('Score: ' + score);

    // 💣 2 bombes par étoile
    creerBombe(player);
    creerBombe(player);

    // régénération des étoiles
    if (groupe_etoiles.countActive(true) === 0) {
        groupe_etoiles.children.iterate(function (etoile) {
            etoile.enableBody(true, etoile.x, 0, true, true);
        });
    }
}

/***********************************************************************/
/** COLLISION AVEC UNE BOMBE = GAME OVER
/***********************************************************************/
function chocAvecBombe(player, bombe) {

    this.physics.pause();

    player.setTint(0xff0000);
    player.anims.play('anim_face');

    gameOver = true;
}
