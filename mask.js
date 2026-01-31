function Round(last)
{
    if(last){
        this.n = last.n + 1;
        this.m_dSlowSpeed = last.m_dSlowSpeed + 3/1000;
        var limRad = 20;
        this.m_dRadFast = limRad + ((last.m_dRadFast - limRad) * 0.80);
    }
    else
    {
        this.n = 1;
        this.m_dSlowSpeed = 35/1000; // in pixels/millisecond
        this.m_dRadFast = 100; // in pixels. If dog is nearer, go fast.
    }
    this.won = undefined;
    document.getElementById("round").innerHTML = this.n;
}

function randomDir()
{
    var dir = Math.random() * 2 * Math.PI;
    dx = Math.cos(dir);
    dy = Math.sin(dir);
    return new Array(dx,dy);
}

function Character(x, y, div) {
    this.sick = false;
    this.masked = false;
    this.m_Dir = randomDir();
    this.last_x = x;
    this.last_y = y;
    this.m_x = x;
    this.m_y = y;
    let speed = g_speed_min + Math.random() * (g_speed_max - g_speed_min);
    this.speed_x = this.m_Dir[0] * speed;
    this.speed_y = this.m_Dir[1] * speed;
    this.m_div = div;
    this.draw();
}
Character.m_side = 1; // display square edge
Character.m_side_2 = Character.m_side / 2;

Character.prototype.move = function(elapsedTime) {
    this.m_x += this.speed_x * elapsedTime;
    this.m_y += this.speed_y * elapsedTime;
};

Character.prototype.draw = function()
{
    this.m_div.style.left = Math.round(this.m_x - Character.m_side_2) + 'px';;
    this.m_div.style.top = Math.round(this.m_y - Character.m_side_2) + 'px';
};

g_nWidthDiv = 0;
g_nHeightDiv = 0;
g_nLeftDiv = 0;
g_nTopDiv = 0;

Character.prototype.isOut = function() {
    var out =  (this.m_x < g_nLeftDiv || this.m_x > g_nLeftDiv + g_nWidthDiv ||
            this.m_y < g_nTopDiv || this.m_y > g_nTopDiv + g_nHeightDiv);
    return out;
};

Character.prototype.setSick = function(sick) {
    if (this.sick && !sick) {
        g_sickCount--;
        g_divSickCount.innerHTML = g_sickCount;
    } else if (!this.sick && sick) {
        g_sickCount++;
        g_divSickCount.innerHTML = g_sickCount;
    }
    this.sick = sick;
    if (!this.masked) {
        let background;
        if (sick) {
            background = g_colorSick;
        } else {
            background = g_colorSane;
        }
        this.m_div.style.background = background;
    }
};

Character.prototype.setMasked = function() {
    this.masked = true;
    this.m_div.style.background = g_colorMasked;
};

Character.prototype.isNear = function(other) {
    return this.isNearPosition(other.m_x, other.m_y, g_max_distance_contamination);
};

Character.prototype.isNearPosition = function(x, y, distance) {
    return Math.abs(this.m_x - x) < distance && Math.abs(this.m_y - y) < distance;
};

Character.prototype.reenter = function() {
    let dir;
    let r = Math.random() * g_perimeterLength;
    if (r < g_nHeightDiv) {
        this.m_x = 1;
        this.m_y = r;
        dir = 0;
    } else if (r < 2 * g_nHeightDiv) {
        this.m_x = g_nWidthDiv - 1;
        this.m_y = r - g_nHeightDiv;
        dir = Math.PI;
    } else if (r < 2 * g_nHeightDiv + g_nWidthDiv) {
        this.m_x = r - 2 * g_nHeightDiv;
        this.m_y = 1;
        dir = Math.PI / 2;
    } else {
        this.m_x = r - (2 * g_nHeightDiv + g_nWidthDiv);
        this.m_y = g_nHeightDiv - 1;
        dir = -Math.PI / 2;
    }
    let angle = dir + Math.random() * Math.PI;
    this.m_Dir = new Array(Math.cos(angle), Math.sin(angle));
    let speed = g_speed_min + Math.random() * (g_speed_max - g_speed_min);
    this.speed_x = this.m_Dir[0] * speed;
    this.speed_y = this.m_Dir[1] * speed;
    this.setSick(false);
}

let g_characters = new Array();
let g_handlerTimeout = 0;
let g_timeLastMove = 0;
const g_delay = 40;
let dart;
const g_speed_min = 20/1000;
const g_speed_max = 2 * g_speed_min;
const g_max_distance_contamination = 15;
const g_distance_mask = 30;
const g_colorSane = 'gray';
const g_colorSick = 'yellow';
const g_colorMasked = 'red';

function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

function mask(event) {
    for (character of g_characters) {
        if (character.isNearPosition(event.clientX, event.clientY, g_distance_mask)) {
            character.setMasked();
        }
    }
}

function start()
{
    g_audioTheme1 = document.getElementById("audio_theme1");
    g_audioTheme1.play();
    g_Div = document.getElementById("bigdiv");
    g_divSickCount = document.getElementById("sickCount");
    g_sickCount = 1;
    g_nHeightDiv = g_Div.clientHeight;
    g_nWidthDiv = g_Div.clientWidth;
    g_perimeterLength = 2 * g_nHeightDiv + 2 * g_nWidthDiv;
    g_posDiv = findPos(g_Div);
    g_nLeftDiv = g_posDiv[0];
    g_nTopDiv = g_posDiv[1];
    
    restart();
    
    g_handlerTimeout = setTimeout("update();", g_delay);
    g_timeLastMove = (new Date()).getTime();

    g_Div.addEventListener('click', mask);
}

function removeAll(cell) {
    if ( cell.hasChildNodes() )
    {
        while ( cell.childNodes.length >= 1 )
        {
            cell.removeChild( cell.firstChild );       
        } 
    }
}

function createRandomCharacter() {
    let x = g_nLeftDiv + g_nWidthDiv * Math.random();
    let y = g_nTopDiv + g_nHeightDiv * Math.random();
    return createCharacter(x, y);
}

function restart() {
    removeAll(g_Div);
    let patient0 = createRandomCharacter();
    patient0.setSick(true);
    for (let iCharacter = 0; iCharacter < 911; iCharacter++) {
        createRandomCharacter();
    }
}

function createCharacter(x, y) {
    const div = createLittleDiv(x, y);
    let character = new Character(x, y, div);
    g_characters.push(character);
    g_Div.appendChild(div);
    return character;
}

function createLittleDiv(x, y) {
    var littleDiv = document.createElement('div');
    littleDiv.style.background = g_colorSane;
    littleDiv.style.width = '1px';
    littleDiv.style.height = '1px';
    littleDiv.style.left = x - .5 + 'px';;
    littleDiv.style.top = y - .5 + 'px';
    littleDiv.style.position = 'absolute';
    return littleDiv;
}

function update()
{
  clearTimeout(g_handlerTimeout);
  g_handlerTimeout = setTimeout("update();", g_delay);
  var time = (new Date()).getTime();
  var elapsedTime = time - g_timeLastMove;
  g_timeLastMove = time;
  for(iCharacter = 0; iCharacter < g_characters.length; iCharacter++) {
    g_characters[iCharacter].move(elapsedTime);
    if (g_characters[iCharacter].isOut()) {
        g_characters[iCharacter].reenter();
    }
  }
  for(iCharacter = 0; iCharacter < g_characters.length; iCharacter++) {
    g_characters[iCharacter].draw();
  }
  for (character of g_characters) {
    if (character.sick && !character.masked) {
        for (otherCharacter of g_characters) {
            if (character != otherCharacter && !otherCharacter.sick && 
                    character.isNear(otherCharacter) && !character.masked) {
                otherCharacter.setSick(true);
            }
        }
    }
  }
}


function addDart(evt) {
    g_characters.push(dart);
    document.removeEventListener('keypress', addDart);
}

document.addEventListener('keypress', addDart);

