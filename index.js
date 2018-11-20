// Making Pong because its a friday night and I'm the coolest.

/*
- Rules - 
Yes it does! (Games go up to 9)

- Controls -
A and D control the left paddle
Left and Right (D-pad) control the right paddle
Press R to reset the game
Press Space to start a new game
Press P to pause and unpause the game
Settings are in the Settings Tray thingy
*/

/* 
--- TO DO ---
- Make the Settings Tray look better
- Write AI for single player
*/

// Key functions to track user input
document.addEventListener('keydown', function(e){
    // e.preventDefault();
    var key = e.keyCode;
    switch(key) {
        case 65: app.input.A_KEY = true; break; // A
        case 68: app.input.D_KEY = true; break; // D
        case 37: app.input.LEFT = true; break;  // Left
        case 39: app.input.RIGHT = true; break; // Right
        case 32: app.input.SPACE = true; break; // Space
        case 80: app.input.P_KEY = true; break; // P
        case 82: app.input.R_KEY = true; break; // R
        default: return false;
    };
});
document.addEventListener('keyup', function(e){
    var key = e.keyCode;
    switch(key) {
        case 65: app.input.A_KEY = false; break; // A
        case 68: app.input.D_KEY = false; break; // D
        case 37: app.input.LEFT = false; break;  // Left
        case 39: app.input.RIGHT = false; break; // Right
        case 32: app.input.SPACE = false; break; // Space
        case 80: app.input.P_KEY = false; app.input.P_OFF = true; break; // P
        case 82: app.input.R_KEY = false; break; // R
        default: return false;
    };
});

// Vue stuff
var app = new Vue({
    el: '#app',
    data: {
        // 50 FPS (60 FPS time has random jumping to it, probably because of the decimal)
        frame: setInterval(function(){ app.frame_func(); }, 20),
        input: {
            // P1 Keys
            A_KEY: false,
            D_KEY: false,
            // P2 keys
            LEFT: false,
            RIGHT: false,
            // Extras
            SPACE: false,
            R_KEY: false,
            P_KEY: false,
            P_OFF: true
        },
        map: {
            height: 600,
            width: 1000,
            color: '#444',
            text_color: '#CCC'
        },
        p1: {
            // Properties
            height: 100,
            width: 20,
            pos: { x: 100, y: 100 },
            // Movement Stuff
            vy: 0,
            vy_max: 15,
            vy_acc: 0.7,
            // Game Stuff
            name: 'Player 1',
            color: '#F54',
            score: 0,
            bounce: false
        },
        p2: {
            // Properties
            height: 100,
            width: 20,
            pos: { x: 880, y: 100 }, // p2.x is map.width - p2.width - 100
            // Movement Stuff
            vy: 0,
            vy_max: 15,
            vy_acc: 0.7,
            // Game Stuff
            name: 'Player 2',
            color: '#45F',
            score: 0,
            bounce: false
        },
        ball: {
            // Size and Position
            size: 12,
            pos: { x: 494, y: 70 },
            // Movement Stuff
            vx: 0,
            vy: 0,
            vx_max: 12,
            vy_max: 10,
            // Game Stuff
            color: '#DDD'
        },
        start_timer: '',
        tray_open: false,
        game_paused: false,
        game_over: true,
        winner: ''
    }, 
    methods: {
        update_pos: function() {
            // --- Player 1 ---
            this.p1.pos.y += this.p1.vy;
            // Setting Boundaries
            if(this.p1.pos.y < 0) {
                this.p1.pos.y = 0;
                if(this.p1.bounce){ this.p1.vy = -(this.p1.vy)/1.25; } else { this.p1.vy = 0; };
            };
            if(this.p1.pos.y > (this.map.height - this.p1.height)) {
                this.p1.pos.y = (this.map.height - this.p1.height);
                if(this.p1.bounce){ this.p1.vy = -(this.p1.vy)/1.25; } else { this.p1.vy = 0; };
            };
            
            // --- Player 2 ---
            this.p2.pos.y += this.p2.vy;
            // Setting Boundaries
            if(this.p2.pos.y < 0) {
                this.p2.pos.y = 0;
                if(this.p2.bounce){ this.p2.vy = -(this.p2.vy)/1.25; } else { this.p2.vy = 0; };
            };
            if(this.p2.pos.y > (this.map.height - this.p2.height)) {
                this.p2.pos.y = (this.map.height - this.p2.height);
                if(this.p2.bounce){ this.p2.vy = -(this.p2.vy)/1.25; } else { this.p2.vy = 0; };
            };
            
            // --- Ball ---
            this.ball.pos.x += this.ball.vx;
            this.ball.pos.y += this.ball.vy;
            
            // Setting Outer Boundaries
            // X
            if(this.ball.pos.x < 0) {
                // Player 2 scored
                this.ball.pos.x = 0;
                this.ball.vx = -(this.ball.vx);
                this.point_scored(app.p2);
            };
            if(this.ball.pos.x > (this.map.width - this.ball.size)) {
                // Player 1 scored
                this.ball.pos.x = (this.map.width - this.ball.size);
                this.ball.vx = -(this.ball.vx);
                this.point_scored(app.p1);
            };
            // Y
            if(this.ball.pos.y < 0) {
                this.ball.pos.y = 0;
                this.ball.vy = -(this.ball.vy);
            };
            if(this.ball.pos.y > (this.map.height - this.ball.size)) {
                this.ball.pos.y = (this.map.height - this.ball.size);
                this.ball.vy = -(this.ball.vy);
            };
        },
        update_movement: function() {
            // --- Player 1 ---
            this.p1.vy += (this.input.D_KEY?this.p1.vy_acc:-(this.p1.vy_acc)) + (this.input.A_KEY?(-(this.p1.vy_acc)):this.p1.vy_acc);
            // If no input or cancelled out input
            if((!this.input.D_KEY && !this.input.A_KEY) || (this.input.D_KEY && this.input.A_KEY)) {
                // Returning to resting
                if(this.p1.vy < this.p1.vy_acc && this.p1.vy > -(this.p1.vy_acc)) {this.p1.vy = 0};
                if(this.p1.vy < 0) {this.p1.vy += this.p1.vy_acc/1.6};
                if(this.p1.vy > 0) {this.p1.vy -= this.p1.vy_acc/1.6};
            };
            // Setting maxes
            if(this.p1.vy > this.p1.vy_max) {this.p1.vy = this.p1.vy_max};
            if(this.p1.vy < -(this.p1.vy_max)) {this.p1.vy = -(this.p1.vy_max)};
            
            // --- Player 2 ---
            this.p2.vy += (this.input.LEFT?this.p2.vy_acc:-(this.p2.vy_acc)) + (this.input.RIGHT?(-(this.p2.vy_acc)):this.p2.vy_acc);
            // If no input or cancelled out input
            if((!this.input.LEFT && !this.input.RIGHT) || (this.input.LEFT && this.input.RIGHT)) {
                // Returning to resting
                if(this.p2.vy < this.p2.vy_acc && this.p2.vy > -(this.p2.vy_acc)) {this.p2.vy = 0};
                if(this.p2.vy < 0) {this.p2.vy += this.p2.vy_acc/1.6};
                if(this.p2.vy > 0) {this.p2.vy -= this.p2.vy_acc/1.6};
            };
            // Setting maxes
            if(this.p2.vy > this.p2.vy_max) {this.p2.vy = this.p2.vy_max;};
            if(this.p2.vy < -(this.p2.vy_max)) {this.p2.vy = -(this.p2.vy_max);};
            
            // --- Ball ---
            if(this.ball.vy > this.ball.vy_max) {this.ball.vy = this.ball.vy_max;};
            if(this.ball.vy < -(this.ball.vy_max)) {this.ball.vy = -(this.ball.vy_max);};
            if(this.ball.vx > this.ball.vx_max) {this.ball.vx = this.ball.vx_max;};
            if(this.ball.vx < -(this.ball.vx_max)) {this.ball.vx = -(this.ball.vx_max);};
        },
        collision_check: function(obj) {
            if ( !( ((this.ball.pos.y + this.ball.size) < (obj.pos.y)) || (this.ball.pos.y > (obj.pos.y + obj.height)) ||
                    ((this.ball.pos.x + this.ball.size) < obj.pos.x) || (this.ball.pos.x > (obj.pos.x + obj.width)) )
               ){   
                    // Collision
                    this.collision_handler(obj);
                } else { /* No collision */ };
        },
        collision_handler: function(obj) {
            // Top and Bottom Edge Check
            if( ((this.ball.pos.y < (obj.pos.y + obj.height)) && (this.ball.pos.y > obj.pos.y) ) || 
                (((this.ball.pos.y + this.ball.size) > obj.pos.y) && (this.ball.pos.y < (obj.pos.y + obj.height))) ) {
                // Left Collision
                if( (this.ball.pos.x > (obj.pos.x + (obj.width - this.ball.vx_max))) && this.ball.vx <= 0) {
                    this.ball.pos.x = obj.pos.x + obj.width;
                };
                // Right Collision
                if( (this.ball.pos.x + this.ball.size < (obj.pos.x + this.ball.vx_max)) && this.ball.vx >= 0) {
                    this.ball.pos.x = obj.pos.x - this.ball.size;
                };
                this.angle_function(obj);
                this.ball.vx = -(this.ball.vx);
                this.ball.vx *= 1.1;
            };
            
            // Left and Right Edge Check
            if( ((this.ball.pos.x < (obj.pos.x + obj.width)) && (this.ball.pos.x > obj.pos.x) ) || 
                (((this.ball.pos.x + this.ball.size) > obj.pos.x) && (this.ball.pos.x < (obj.pos.x + obj.width))) ) {
                // Top Collision
                if( (this.ball.pos.y > (obj.pos.y + (obj.height - this.ball.vy_max))) && this.ball.vy < 0) {
                    this.ball.pos.y = obj.pos.y + obj.height;
                };
                // Bottom Collision
                if( (this.ball.pos.y + this.ball.size < (obj.pos.y + this.ball.vy_max)) && this.ball.vy > 0) {
                    this.ball.pos.y = obj.pos.y - this.ball.size;
                };
                // this.ball.vy = -(this.ball.vy);
            };
        },
        angle_function: function(obj){
            var bc = this.ball.pos.y + (this.ball.size/2);            
            var ama = (bc - (obj.pos.y + (obj.height/2)))/(obj.height);
            this.ball.vy += this.ball.vy_max * 2.1 * ama;
        },
        frame_func: function() {
            if(!this.tray_open){
                if(!this.game_paused) {
                    this.update_movement();
                    this.update_pos();

                    // Collision Stuff
                    this.collision_check(app.p1);
                    this.collision_check(app.p2);

                    if(this.input.R_KEY){this.reset()};
                    if(this.input.SPACE){this.game_start()};
                };

                if(this.input.P_KEY && this.input.P_OFF){
                    this.input.P_KEY = false;
                    this.input.P_OFF = false;
                    this.game_paused = !this.game_paused;
                };
            };
        },
        point_scored: function(p) {
            p.score++;
            app.ball.pos.x = 494;
            app.ball.pos.y = 70;
            app.ball.vx = 0;
            app.ball.vy = 0;
            if(p.score < 9) {
                if(p.pos.x <= 100) {
                    this.start_timer = setTimeout(function(){ app.ball.vx = -5; app.ball.vy = 3; }, 3000);
                } else {
                    this.start_timer = setTimeout(function(){ app.ball.vx = 5; app.ball.vy = 3; }, 3000);
                };
            } else {
                this.game_over = true;
                this.winner = p;
            };
        },
        reset: function() {
            // Reset player positions, ball position, score, etc. 
            this.p1.pos.y = 100;
            this.p2.pos.y = 100;
            this.p1.vx = 0;
            this.p1.vy = 0;
            this.p2.vx = 0;
            this.p2.vy = 0;
            this.ball.pos.x = 494;
            this.ball.pos.y = 70;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.p1.score = 0;
            this.p2.score = 0;
            clearTimeout(this.start_timer);
            this.game_over = true;
            this.winner = '';
        },
        game_start: function() {
            this.reset();
            this.game_over = false;
            this.ball.vx = 5;
            this.ball.vy = 3;
        }
    }
});