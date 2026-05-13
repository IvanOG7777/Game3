// function used to move enemy when player is father than follow distance
function moveRandom(enemy, direction) {

    let randomX = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
    
    enemy.x += randomX * direction;
    direction *= -1;
}


export {
    moveRandom,
};