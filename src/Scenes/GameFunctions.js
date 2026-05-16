// function used to move enemy when player is father than follow distance
function moveRandom(scene, enemy) {
    let currentTime = scene.time.now; // get current this time

    if (currentTime > enemy.nextWanderChange) {
        let direction = Phaser.Math.Between(0,1); // pick direction
        if (direction == 0) { // if 0 
            enemy.wanderDirection = -1; // make left dirrection
        } else {
            enemy.wanderDirection = 1; // else make right
        }

        enemy.nextWanderChange = currentTime + scene.enemyWanderTime; // continouly add to the next wander change time.
    }


    // else
    enemy.setVelocityX(enemy.speed * enemy.wanderDirection * 0.5); // move enemy with current speed and direction 
    enemy.setFlipX(enemy.wanderDirection < 0); // if (-1) flip left else flip back to right (1)
}

function enemyMovement(scene, enemyArray) {
    for (let enemy of enemyArray) {
        let distanceX = scene.my.sprite.player.x - enemy.x;
        let distanceY = scene.my.sprite.player.y - enemy.y;
        let playerX = scene.my.sprite.player.x
        let direction = 1;

        let absDistanceX = Math.abs(distanceX);

        if (absDistanceX <= scene.evilWizardMeleeDistance) {
            enemy.attack = true;
        } else if (absDistanceX <= scene.evilWizardFollowDistance) {
            enemy.chase = true;
        } else if (absDistanceX <= enemy.shootDistance) {
            enemy.shoot = true;
        } else {
            enemy.wander = true;
        }

        if (enemy.attack == true) {
            console.log("wizard is meleeing");
            enemy.setVelocityX(0);
            direction *= -1;
        }

        if (enemy.chase == true) {
            if (absDistanceX > enemy.stopDistance) {
                if (distanceX > 0) {
                    enemy.setVelocityX(enemy.speed);
                    enemy.setFlipX(false);
                } else {
                    enemy.setVelocityX(-enemy.speed);
                    enemy.setFlipX(true);
                }
            } else {
                enemy.setVelocityX(0);
            }
        }

         if (enemy.shoot == true) {
            enemy.setVelocityX(0);
            if (distanceX > 0) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
            enemyShoot(scene, enemy);
        }

        if (enemy.wander == true) {
            moveRandom (scene, enemy);
        }

        enemy.wander = false;
        enemy.chase = false;
        enemy.attack = false;
        enemy.shoot = false;
    }
}

function enemyShoot(scene, enemy) {
    let currentTime = scene.time.now; // get current this time

    if (currentTime < enemy.nextShootTime) {
        return;
    }

    let playerX = scene.my.sprite.player.x
    let playerY = scene.my.sprite.player.y;

    let distanceY = playerY - enemy.y;

    let potion = scene.physics.add.sprite(enemy.x, enemy.y, "redPotion");
    potion.setScale(2);
    potion.body.allowGravity = false;
    potion.isDead = false;

    if (playerX > enemy.x) {
        potion.direction = 1;
    } else {
        potion.direction = -1;
    }

    // TODO, fix not throwing propely
    if (distanceY < 0) {
        potion.velY = -300;
    } else {
        potion.velY = -100;
    }

    potion.velX = 350;

    scene.evilWizardPotionArray.push(potion);
    enemy.nextShootTime = currentTime + enemy.shootDelay;
}

function moveProjectile(scene, deltaTime) {
    for (let projectile of scene.evilWizardPotionArray) {

        if(collides (scene.my.sprite.player, projectile) == true) {
            console.log("Player got hit with projectile");
            scene.playerHealth -= 10;
            scene.health.setText("Health: " + scene.playerHealth);
            projectile.isDead = true;
            projectile.destroy();
            continue;
        }

        projectile.x += projectile.direction * projectile.velX * (deltaTime / 1000);
        projectile.y += projectile.velY * (deltaTime / 1000);

        projectile.velY += 700 * (deltaTime / 1000);
    }

    scene.evilWizardPotionArray = scene.evilWizardPotionArray.filter(projectile => !projectile.isDead);
}

function hitEnemy(scene, enemyArray) {
    if (Phaser.Input.Keyboard.JustDown(scene.hitKey)) {
        for (let enemy of enemyArray) {
            if (collides(scene.my.sprite.player, enemy) == true) {
                console.log("Meleeing enemy");
                enemy.health -= scene.playerHitDamage;

                if (enemy.health <= 0) {
                    console.log("enemy is dead");
                    enemy.isDead = true;
                    enemy.destroy();
                }
            }
        }

        enemyArray = enemyArray.filter(enemy => !enemy.isDead); // filter out dead enemies

        // resetting the stop distances
        let i = 0;
        for (let enemy of enemyArray) {
            enemy.stopDistance = 30 + (i * 50);
            enemy.shootDistance = scene.evilWizardShootDistance + (i * 20);
            enemy.shootDelay = scene.evilWizardShootDelay + (i * 200);
            i++
        }
    }

    return enemyArray;
}

function seperateEnemies(enemyArray) {
    let pushAmount = 0.5
    for (let enemyA of enemyArray) {
        for (let enemyB of enemyArray) {
            if (enemyA != enemyB) {
                let distanceX = Math.abs(enemyA.x - enemyB.x);
                
                if (distanceX <= 50) {
                    if (enemyA.x < enemyB.x) {
                        enemyA.x -= pushAmount
                        enemyB.x += pushAmount
                    } else {
                        enemyA.x += pushAmount;
                        enemyB.x -= pushAmount
                    }
                }
            }
        }
    }
}

// genertic spawner for wizzard for now
function specificSpawnEnemies(scene, mobType, sections, amount) {
    let enemies = []
    for (let section of sections) {
        for (let i = 0; i < amount; i++) {
            let x = Phaser.Math.Between(section.x1, section.x2);
            let y = Phaser.Math.Between(section.y1, section.y2);

            let enemy = scene.physics.add.sprite(x, y, mobType);

            enemy = scene.physics.add.sprite(x,y, mobType);

            enemy.setScale(2.25);
            enemy.setCollideWorldBounds(true);

            enemy.health = 100;
            enemy.isDead = false;
            enemy.wander = false;
            enemy.chase = false;
            enemy.shoot = false;

            enemy.stopDistance = 30;
            enemy.shootDistance = scene.evilWizardShootDistance;
            enemy.shootDelay = scene.evilWizardShootDelay;
            enemy.wanderTimer = scene.enemyWanderTime;
            enemy.nextWanderChange = 0;
            enemy.nextShootTime = 0;
            enemy.speed = 80;

            scene.physics.add.collider(enemy, scene.groundLayer);

            enemies.push(enemy);
        }
    }

    return enemies;
}

function collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }


export {
    moveRandom,
    enemyMovement,
    enemyShoot,
    moveProjectile,
    hitEnemy,
    seperateEnemies,
    specificSpawnEnemies
};