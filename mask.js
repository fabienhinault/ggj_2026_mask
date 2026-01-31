function Round(last) {
    if (last) {
        this.n = last.n + 1;
        this.max_distance_contamination = last.max_distance_contamination * 1.1;
    }
    else
    {
        this.n = 1;
        this.max_distance_contamination = 5;
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
    let speed = g_speed_min + Math.random() * (g_speed_max - g_speed_min); // 0; // 
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

Character.prototype.updateColor = function() {
    let background;
    if (!this.masked) {
        if (this.sick) {
            background = g_colorSick;
        } else {
            background = g_colorSane;
        }
    } else {
        if (this.sick) {
            background = g_colorSickMasked;
        } else {
            background = g_colorSaneMasked;
        }
    }
    this.m_div.style.background = background;
};

Character.prototype.setSick = function(sick) {
    if (!this.masked) {
        if (this.sick && !sick) {
            g_sickCount--;
            g_saneCount++;
            g_divSickCount.innerHTML = g_sickCount;
            g_divSaneCount.innerHTML = g_saneCount;
        } else if (!this.sick && sick) {
            g_sickCount++;
            g_saneCount--;
            g_divSickCount.innerHTML = g_sickCount;
            g_divSaneCount.innerHTML = g_saneCount;
        }
    } else {
        if (this.sick && !sick) {
            g_sickMaskedCount--;
            g_saneMaskedCount++;
            g_divSickMaskedCount.innerHTML = g_sickMaskedCount;
            g_divSaneMaskedCount.innerHTML = g_saneMaskedCount;
        } else if (!this.sick && sick) {
            g_sickMaskedCount++;
            g_saneMaskedCount--;
            g_divSickMaskedCount.innerHTML = g_sickMaskedCount;
            g_divSaneMaskedCount.innerHTML = g_saneMaskedCount;
        }
    }
    this.sick = sick;
    this.updateColor();
};

Character.prototype.setMasked = function(masked) {
    if (!this.sick) {
        if (this.masked && !masked) {
            g_saneMaskedCount--;
            g_saneCount++;
            g_divSaneMaskedCount.innerHTML = g_saneMaskedCount;
            g_divSaneCount.innerHTML = g_saneCount;
        } else if (!this.masked && masked) {
            g_saneMaskedCount++;
            g_saneCount--;
            g_divSaneMaskedCount.innerHTML = g_saneMaskedCount;
            g_divSaneCount.innerHTML = g_saneCount;
        }
    } else {
        if (this.masked && !masked) {
            g_sickMaskedCount--;
            g_sickCount++;
            g_divSickMaskedCount.innerHTML = g_sickMaskedCount;
            g_divSickCount.innerHTML = g_sickCount;
        } else if (!this.masked && masked) {
            g_sickMaskedCount++;
            g_sickCount--;
            g_divSickMaskedCount.innerHTML = g_sickMaskedCount;
            g_divSickCount.innerHTML = g_sickCount;
        }

    }
    this.masked = masked;
    this.updateColor();
};

Character.prototype.isNear = function(other) {
    return this.isNearPosition(other.m_x, other.m_y, g_round.max_distance_contamination);
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
    this.setMasked(false);
}

let g_characters = new Array();
let g_handlerTimeout = 0;
let g_timeLastMove = 0;
const g_delay = 40;
let dart;
const g_speed_min = 20/1000;
const g_speed_max = 2 * g_speed_min;
const g_distance_mask = 30;
const g_colorSane = 'gray';
const g_colorSick = 'yellow';
const g_colorSaneMasked = 'red';
const g_colorSickMasked = 'orange';

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
            character.setMasked(true);
        }
    }
}

function start()
{
    g_audioTheme1 = document.getElementById("audio_theme1");
    g_audioTheme1.play();
    g_Div = document.getElementById("bigdiv");
    g_divSickCount = document.getElementById("sickCount");
    g_divSickMaskedCount = document.getElementById("sickMaskedCount");
    g_divSaneMaskedCount = document.getElementById("saneMaskedCount");
    g_divSaneCount = document.getElementById("saneCount");
    g_imgVirusWon = document.getElementById("virusWon");
    g_nHeightDiv = g_Div.clientHeight;
    g_nWidthDiv = g_Div.clientWidth;
    g_perimeterLength = 2 * g_nHeightDiv + 2 * g_nWidthDiv;
    g_posDiv = findPos(g_Div);
    g_nLeftDiv = g_posDiv[0];
    g_nTopDiv = g_posDiv[1];

    g_round = new Round();

    restart();

    g_Div.addEventListener('click', mask);
}

function removeAll(cell) {
    if (cell.hasChildNodes()) {
        while ( cell.childNodes.length >= 1 ) {
            cell.removeChild(cell.firstChild);
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
    g_saneCount = 912;
    g_sickCount = 0;
    g_saneMaskedCount = 0;
    g_sickMaskedCount = 0;
    let patient0 = createRandomCharacter();
    for (let iCharacter = 0; iCharacter < g_saneCount - 1; iCharacter++) {
        createRandomCharacter();
    }
    patient0.setSick(true);
    g_imgVirusWon.setAttribute('class', 'playing');
    g_timeLastMove = (new Date()).getTime();
    g_handlerTimeout = setTimeout("update();", g_delay);
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
    littleDiv.style.width = '3px';
    littleDiv.style.height = '3px';
    littleDiv.style.left = x - 1.5 + 'px';;
    littleDiv.style.top = y - 1.5 + 'px';
    littleDiv.style.position = 'absolute';
    return littleDiv;
}

function update()
{
  //clearTimeout(g_handlerTimeout);
  if (g_sickCount > 200) {
    g_divSickCount.innerHTML = g_sickCount;
    g_imgVirusWon.setAttribute('class', 'virusWon');
    g_Div.removeEventListener('click', mask);
    return;
  }
  if (g_sickCount == 0) {
    g_round = new Round(g_round);
    restart();
    return;
  }
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

