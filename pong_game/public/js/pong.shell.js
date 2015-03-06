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
      keystate;

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
    }

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
