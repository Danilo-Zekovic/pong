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
	+ '<p>Welcome to Pong Game2</p>'
    },
    stateMap = { $container : null },
    jqueryMap = {},
    // constants for the canvas size
    WIDTH = 700, HEIGHT = 600,

    pi = Math.PI,

    UpArrow = 38, DownArrow = 40,
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
    speed: 12,
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
        // calculate smash value and update velocity
        var smash = Math.abs(phi) > 0.2*pi ? 1.5 : 1;
        this.vel.x = smash*(pdle===player ? 1 : -1)*this.speed*Math.cos(phi);
        this.vel.y = smash*this.speed*Math.sin(phi);
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
  //------------------END UTILITY METHODS-----------------

  //------------------BEGIN DOM METHODS-------------------

  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container     : $container 
    }
  };  // end setJqueryMap

  //------------------END DOM METHODS---------------------
  
  //------------------BEGIN EVENT HANDLERS----------------
  //------------------END EVENT HANDLERS------------------
  
  //------------------BEGIN PUBLIC METHODS----------------
  
  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();
  };
  

  return { initModule : initModule };
  //------------------END PUBLIC METHODS------------------

}());
