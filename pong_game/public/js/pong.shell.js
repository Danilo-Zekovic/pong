/* 
 * pong.shell.js
 */

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

  pong.shell = (function () {
  //------------------BEGIN MODULE SCOPE VAR--------------
  
  var
    configMap = {
      main_html : String()
	+ '<h1>Welcome to SJC Pong Game</h1>'
	+ '<div class="data">'
	  + '<div class="data-atributes">'
	    + '<div class="value-attr">'
	      + 'Velocity'
	    + '</div>'
	    + '<div class="angle-attr">'
	      + 'Angle'
	    + '</div>'
	  + '</div>'
	  + '<div class="data-values">'
	    + '<div class="velocity">'
	    + '</div>'
	    + '<div class="angle">'
	    + '</div>'
	    + '</div>'
	+ '</div>'
	+ '<div class="change-speed">'
	  + '<button class="change-speed-btn">Change</button>'
	  + '  Ball Speed: <input type="number" class="change-speed-tbox" value=4 min="1" />'
	+ '</div>'
    },
    stateMap = { $container : null },
    jqueryMap = {},
    // constants for the canvas size
    WIDTH = 700, HEIGHT = 400,

    pi = Math.PI, 

    UpArrow = 38, DownArrow = 40,
    initObjects, draw, update, startGame, displayVel, displayAng, setSpeed,
    setJqueryMap, initModule;

    // Game elements
  var
    canvas,
    ctx,
    keystate,

  // The player paddle
  // type Object
  player = {
    x: null,
    y: null,

    width:  20,
    height: 100,
    // Update the position depending on pressed keys
    update: function() {
      if (keystate[UpArrow]) this.y -= 7;
        if (keystate[DownArrow]) this.y += 7;
	// keep the paddle inside of the canvas
	this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
    },
    // Draw the player paddle to the canvas
    draw: function() {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  },

  ai = {
    x: null,
    y: null,
    width:  20,
    height: 100,
    // Update the position depending on the ball position
    update: function() {
      // calculate ideal position
      var desty = ball.y - (this.height - ball.side)*0.5;
      // ease the movement towards the ideal position
      this.y += (desty - this.y) * 0.1;
      // keep the paddle inside of the canvas
      this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
    },
    // Draw the ai paddle to the canvas
    draw: function() {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  },


  ball = {
    x:   null,
    y:   null,
    vel: null,
    side:  20,
    speed: 4,
    // Serves the ball towards the specified side
    // @param  {number} side 1 right
    //                      -1 left
    serve: function(side) {
      // set the x and y position
      var r = Math.random();
      this.x = side===1 ? player.x+player.width : ai.x - this.side;
      this.y = (HEIGHT - this.side)*r;
      // calculate out-angle, higher/lower on the y-axis =>
      // steeper angle
      var phi = 0.1*pi*(1 - 2*r);
      //jqueryMap.$ang.append( phi + "<br>"); // inital angle
      // set velocity direction and magnitude
      this.vel = {
	x: side*this.speed*Math.cos(phi),
	y: this.speed*Math.sin(phi)
      }
    },
    

    update: function() {
      // update position with current velocity
      this.x += this.vel.x;
      this.y += this.vel.y;
      // check if out of the canvas in the y direction
      if (0 > this.y || this.y+this.side > HEIGHT) {
	// calculate and add the right offset, i.e. how far
	// inside of the canvas the ball is
	var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
	this.y += 2*offset;
        // mirror the y velocity
	this.vel.y *= -1;
      }
      // helper function to check intesectiont between two
      // axis aligned bounding boxex (AABB)
      var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh){
        return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
      };
      // check againts target paddle to check collision in x
      // direction
      var pdle = this.vel.x < 0 ? player : ai;
      if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
        this.x, this.y, this.side, this.side)
      ) {	
        // set the x position and calculate reflection angle
        this.x = pdle===player ? player.x+player.width : ai.x - this.side;
        var n = (this.y+this.side - pdle.y)/(pdle.height+this.side);
        var phi = 0.25*pi*(2*n - 1); // pi/4 = 45
	jqueryMap.$ang.append( (phi*180/pi) + "<br>");
        // calculate smash value and update velocity
        var smash = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
        this.vel.x = smash*(pdle===player ? 1 : -1)*this.speed*Math.cos(phi);
        this.vel.y = smash*this.speed*Math.sin(phi);

	// append velocity to data vel box
	displayVel(this.vel.x, this.vel.y);
      }
      // reset the ball when ball outside of the canvas in the
      // x direction
      if (0 > this.x+this.side || this.x > WIDTH) {
        this.serve(pdle===player ? 1 : -1);
      }
    },
    // Draw the ball to the canvas
    draw: function() {
      ctx.fillRect(this.x, this.y, this.side, this.side);
    }
  };


  //------------------END MODULE SCOPE VAR----------------

  //------------------BEGIN UTILITY METHODS---------------
  
  // Update all game objects
  function update() {
    ball.update();
    player.update();
    ai.update();
  }

  // Clear canvas and draw all game objects and net
  function draw() {
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.fillStyle = "#fff";
    ball.draw();
    player.draw();
    ai.draw();
    // draw the net
    var w = 4;
    var x = (WIDTH - w)*0.5;
    var y = 0;
    var step = HEIGHT/20; // how many net segments
    while (y < HEIGHT) {
      ctx.fillRect(x, y+step*0.25, w, step*0.5);
      y += step;
    }
    ctx.restore();
  }

  //------------------END UTILITY METHODS-----------------

  //------------------BEGIN DOM METHODS-------------------

  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container     : $container,
      $vel           : $container.find(".velocity"),
      $ang           : $container.find(".angle"),
      $change_bt     : $container.find(".change-speed-btn"),
      $change_tb     : $container.find(".change-speed-tbox") 
    }
  };  // end setJqueryMap

  
  // Initatite game objects and set start positions
  function initObjects() {
    player.x = player.width;
    player.y = (HEIGHT - player.height)/2;
    ai.x = WIDTH - (player.width + ai.width);
    ai.y = (HEIGHT - ai.height)/2;
    ball.serve(1);
  }

  //------------------END DOM METHODS---------------------
  
  //------------------BEGIN EVENT HANDLERS----------------

  // Starts the game
  function startGame() {
    // create, initiate and append game canvas
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
    keystate = {};
    // keep track of keyboard presses
    document.addEventListener("keydown", function(evt) {
      keystate[evt.keyCode] = true;
    });
    document.addEventListener("keyup", function(evt) {
      delete keystate[evt.keyCode];
    });
    initObjects(); // initiate game objects
    // game loop function
    var loop = function() {
      update();
      draw();
      window.requestAnimationFrame(loop, canvas);
    };
    window.requestAnimationFrame(loop, canvas);
  }

  // display velocity
  function displayVel(x, y) {
    var vel = Math.sqrt(x*x+y*y);
    //console.log("x: " + x + "  y: " + y);
    jqueryMap.$vel.append( vel + "<br>");
  }
  
  // set the speed of the ball after click
  setSpeed = function (event) {
    console.log( "Change has been clicked" ); 
    console.log("ball speed: " + ball.speed);
    console.log("Input value: " + jqueryMap.$change_tb.val());
    ball.speed = jqueryMap.$change_tb.val(); 
  }

  //------------------END EVENT HANDLERS------------------
  
  //------------------BEGIN PUBLIC METHODS----------------
  
  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();
    startGame();

    // button
    // event
    jqueryMap.$change_bt
      .click( setSpeed );
  };
  

  return { initModule : initModule };
  //------------------END PUBLIC METHODS------------------

}());
