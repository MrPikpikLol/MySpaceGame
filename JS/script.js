var screen, input, frames, spFrame, lvFrame;
var alSprite, taSprite, ciSprite;
var aliens, dir, tank, bullets, cities;





function main() {
  screen = new Screen(504, 600);
  input = new InputHandeler();

  var img = new Image();
  img.addEventListener("load", function() {
    alSprite = [
      [new Sprite(this, 0, 0, 22, 16), new Sprite(this, 0, 16, 22, 16)],
      [new Sprite(this, 22, 0, 16, 16), new Sprite(this, 22, 16, 16, 16)],
      [new Sprite(this, 38, 0, 24, 16), new Sprite(this, 38, 16, 24, 16)]
    ];
    taSprite = new Sprite(this, 62, 0, 22, 16);
    ciSprite = new Sprite(this, 84, 8, 36, 24);
    init();
    run();
  });
  img.src = "res/invaders.png";
};

function init() {
  frames = 0;
  spFrame = 0;
  lvFrame = 60;
  dir = 1;

  tank = {
    sprite: taSprite,
    x: (screen.width - taSprite.w) /2,
    y: screen.height - (30 + taSprite.h)
  };

  bullets = [];

  aliens = [];
  var rows = [1, 0, 0, 2, 2];
    for (var i = 0, len = rows.length; i < len; i++){
      for (var j = 0; j < 10; j++){
        var a = rows[i];
        aliens.push({
          sprite: alSprite[a],
          x: 30 + j*30 + [0, 4, 0][a],
          y: 30 + i*30,
          w: alSprite[a][0].w,
          h: alSprite[a][0].h
        });
      }
    }
};
function run() {
  var loop = function() {
    update();
    render();
    window.requestAnimationFrame(loop, screen.canvas);
  };
    window.requestAnimationFrame(loop, screen.canvas);
};

function update() {
  frames++;

  if (input.left || input.isDown(37)) {
    tank.x -= 4;
  }
  if (input.right || input.isDown(39)) {
    tank.x += 4;
  }

  tank.x = Math.max(Math.min(tank.x, screen.width - (30 + taSprite.w)), 30);

  if (input.fire || input.isPressed(32)) {
    bullets.push(new Bullet(tank.x + 10, tank.y, -8, 2, 6, "#fff"));
  }



  for (var i = 0, len = bullets.length; i < len; i++ ) {
    var b = bullets[i];
    b.update();
      if (b.y + b.height < 0 || b.y > screen.height) {
        bullets.splice(i, 1);
        i--;
        len--;
        continue;
      }
      for (var j = 0, len2 = aliens.length; j < len2; j++) {
        var a = aliens[j];
        if (AABBIntersect(b.x, b.y, b.width, b.height, a.x, a.y, a.w, a.h)) {
          aliens.splice(j, 1);
          j--;
          len2--;
          bullets.splice(i, 1);
          i--;
          len--;

          switch (len2) {
            case 30 : {
              this.lvFrame = 40;
              break;
            };
            case 15 : {
              this.lvFrame = 20;
              break;
            };
            case 5 : {
              this.lvFrame = 15;
              break;
            };
            case 1 : {
              this.lvFrame = 6;
              break
            };
            case 0 : {
              return alert("BIEN JOUÉ");
            };
          }
        }
      }

  }

  if (Math.random() < 0.03 && aliens.length > 0) {
    var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
    for (var i = 0, len = aliens.length; i < len; i++) {
      var b = aliens[i];
        if (AABBIntersect(a.x, a.y, a.w, 100, b.x, b.y, b.w, b.h)) {
          a = b;
        }
    }
    bullets.push(new Bullet(a.x + a.w*0.5, a.y + a.h, 4, 2, 4, "#fff"));
  }

  if (frames % lvFrame === 0) {
    spFrame = (spFrame + 1) % 2;
    var _max = 0, _min = screen.width;
    for (var i = 0, len = aliens.length; i < len; i++) {
      var a = aliens[i];
      a.x += 30 * dir;

      _max = Math.max(_max, a.x + a.w);
      _min = Math.min(_min, a.x);
  }
  if (_max > screen.width -30 || _min < 30) {
    dir *= -1;
    for (var i = 0, len = aliens.length; i < len; i++) {
      aliens[i].x += 30 * dir;
      aliens[i].y += 30;
    }
  }
 }
};

function render() {
  screen.clear();
  for (var i = 0, len = aliens.length; i < len; i++) {
    var a = aliens[i];
    screen.drawSprite(a.sprite[spFrame], a.x, a.y);
  }
    screen.ctx.save();
    for (var i = 0, len = bullets.length; i < len; i++) {
      screen.drawBullet(bullets[i]);
    }
    screen.ctx.restore();

    screen.drawSprite(tank.sprite, tank.x, tank.y);
};
// GamePad
var hasGP = false;
var repGP;
function canGame() {
    return "getGamepads" in navigator;
}
$(document).ready(function() {

$(window).keydown(function(e) {
           switch (e.keyCode) {
                case 37: input.left = true; break;
                case 39: input.right = true; break;
                //case 32: input.fire = true; break;
           }
      });

      $(window).keyup(function(e) {
           switch (e.keyCode) {
                case 37: input.left = false; break;
                case 39: input.right = false; break;
                //case 32: input.fire = false; break;
           }
      });
      if(canGame()) {

        var prompt = "Branche ton gamePad et appuie sur n'importe qu'elle touche";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function() {
          hasGP = true;
          $("#gamepadPrompt").html("Gamepad connected!");
          repGP = window.setInterval(checkGamepad,100);
        });

        $(window).on("gamepaddisconnected", function() {
          $("#gamepadPrompt").text(prompt);
          window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function() {
          if(navigator.getGamepads()[0]) {
            if(!hasGP) $(window).trigger("gamepadconnected");
            window.clearInterval(checkGP);
          }
        }, 500);

        function checkGamepad() {
          var gp = navigator.getGamepads()[0];
          var axeLF = gp.axes[0];
          if(axeLF < -0.5) {
            input.left = true;
            input.right = false;
          } else if(axeLF > 0.5) {
            input.left = false;
            input.right = true;
          } else {
            input.left = false;
            input.right = false;
          }
          var gpbtnA = gp.buttons[0];
          if(gpbtnA.pressed > 0.1) {
            input.fire = true;
          } else if (gpbtnA.pressed == 1) {
            input.fire = false;
          } else {
            input.fire = false;
          }

        }
      }
    });
//End GamePad
main()
