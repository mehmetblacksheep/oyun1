const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/cengaverYigit/Idle.png',
  framesMax: 10,
  scale: 2.5,
  offset: {
    x: 130,
    y: 67
  },
  sprites: {
    idle: {
      imageSrc: './img/cengaverYigit/Idle.png',
      framesMax: 10
    },
    run: {
      imageSrc: './img/cengaverYigit/Run.png',
      framesMax: 6
    },
    jump: {
      imageSrc: './img/cengaverYigit/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/cengaverYigit/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/cengaverYigit/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/cengaverYigit/Take Hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/cengaverYigit/Death.png',
      framesMax: 9
    }
  },
  attackBox: {
    offset: {
      x: -10,
      y: 5
    },
    width: 140,
    height: 70
  }
})

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/asker/Idle.png',
  framesMax: 11,
  scale: 2.5,
  offset: {
    x: 130,
    y: 57
  },
  sprites: {
    idle: {
      imageSrc: './img/asker/Idle.png',
      framesMax: 11
    },
    run: {
      imageSrc: './img/asker/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/asker/Jump.png',
      framesMax: 4
    },
    fall: {
      imageSrc: './img/asker/Fall.png',
      framesMax: 4
    },
    attack1: {
      imageSrc: './img/asker/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/asker/Take hit.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/asker/Death.png',
      framesMax: 9
    }
  },
  attackBox: {
    offset: {
      x: -10,
      y: 5
    },
    width: 140,
    height: 70
  }
})

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // oyuncu hareketleri

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // zıplama
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // düşman hareketi
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // zıplama
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // düşman saldırı tespit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // oyuncu kaçırırsa
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // oyuncu hasar alır
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // oyuncu kaçırırsa
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // cana göre oyunu bitirme
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // düşman tuşları
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})