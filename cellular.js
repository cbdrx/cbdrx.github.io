$(document).ready(function() {
  var cellWidth;
  var numCells = 50;
  var paused = true;
  var canvas = $('#canvas');
  var elementWidth = canvas.width();
  var theGrid;
  var theInterval;
  var GOLColors = ['white', 'blue'];
  var ForestFireColors = ['#006600', '#441100', '#00CC00', '#FF9900'];
  var WorldGenColors =
      ['#C9C165', '#0000FF', '#00CC00', '#FF9900', '#00FFFF', '#D2E0DE'];
  var currentRule = mapGenRule;
  var currentRuleColors = WorldGenColors;
  var currentGenerator = MapGenGridGenerator;
  var stepToDrawAt = 1;
  var timePerFrame = 100;
  var generationsElapsed = 0;

  // Function iterates through the passed 2D Array and outputs the contents of
  // each cell in the grid, line by line
  function consoleDebugGrid(grid) {
    var x, y, toPrint, maxPrint;
    maxPrint = '';
    for (x = 0; x < grid.length; x++) {
      toPrint = '';
      for (y = 0; y < grid[0].length; y++) {
        toPrint = toPrint + grid[x][y] + ' ';
      }
      maxPrint = maxPrint + toPrint + '\n';
    }
    console.log('debugged Grid: \n' + maxPrint);
  }

  // Uses the HTML5 Canvas functions to draw a line from the beginning point to
  // the given endpoint. Line will have the default width Parameters: begin and
  // end - arrays of the format [x,y], where the elements are
  // the cartesian coordinates of the start and end pixel
  function drawLineFromTo(begin, end) {
    var context = document.getElementById('canvas').getContext('2d');
    context.beginPath();
    context.moveTo(begin[0], begin[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  // Draws a square with side length "width" with its top left corner at (x,y).
  // Colorstring specifies the fill color, which should be a CSS color string
  function drawSquareAt(x, y, width, colorString) {
    var context = document.getElementById('canvas').getContext('2d');
    context.beginPath();
    context.rect(x, y, width, width);
    context.fillStyle = colorString;
    context.fill();
  }

  // Returns true if a cell's value is 0
  function cellNotEmpty(grid, x, y) {
    return (grid[x][y] != 0);
  }

  // Gets the number of non-empty neighbors a cell has without grid wrapping:
  // ie,
  // cell (0,0) has only neighbors (0,1),(1,0), and (1,1)
  // Returns: the integer number of neighbors the cell has
  function getNumberOfNeighborsNoWrap(grid, x, y, countIfFunction) {
    var xCursor, yCursor, count;
    count = 0;
    for (xCursor = Math.max(x - 1, 0);
         xCursor <= x + 1 && xCursor < grid.length; xCursor += 1) {
      for (yCursor = Math.max(y - 1, 0);
           yCursor <= y + 1 && yCursor < grid[0].length; yCursor += 1) {
        if (xCursor == x && yCursor == y) {
          continue;
        }
        if (countIfFunction(grid, xCursor, yCursor)) {
          count++;
        }
      }
    }
    return count;
  }

  // Ensures the placement of an index within a range, as if the array
  // were circular.
  function getWrapIndex(index, maxIndex) {
    if (index < 0) {
      return maxIndex;
    }
    if (index > maxIndex) {
      return 0;
    }
    return index;
  }

  // Gets the number of non-empty neighbors a cell has with grid wrapping: ie,
  // cell (0,0) has its top-left neighbor in the bottom-right of the grid
  // Returns: the integer number of neighbors the cell has
  function getNumberOfNeighborsWithWrap(grid, x, y, countIfFunction) {
    var xCursor, yCursor, usedX, usedY, count, xLastIndex, yLastIndex;
    count = 0;
    xLastIndex = grid.length - 1;
    yLastIndex = grid[0].length - 1;

    for (xCursor = x - 1; xCursor <= x + 1; xCursor += 1) {
      for (yCursor = y - 1; yCursor <= y + 1; yCursor += 1) {
        if (xCursor == x && yCursor == y) {
          continue;
        }
        if (countIfFunction(
                grid,
                getWrapIndex(xCursor, xLastIndex),
                getWrapIndex(yCursor, yLastIndex),
                )) {
          count++;
        }
      }
    }
    return count;
  }

  // Returns 0 if a cell should die, or 1 if a cell should live or come to life
  // in accordance with the rules of Conway's Game of life: For more reading -
  // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
  function GOLWithWrapRule(grid, x, y) {
    var neighbors = getNumberOfNeighborsWithWrap(grid, x, y, cellNotEmpty);
    switch (neighbors) {
      case 0:
      case 1:
        return 0;
        break;
      case 2:
        if (!cellNotEmpty(grid, x, y)) return 0;
      case 3:
        return 1;
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return 0;
        break;
      default:
        break;
    }
    throw 'GOL RULE FAILED';
  }

  function GOLNoWrapRule(grid, x, y) {
    var neighbors = getNumberOfNeighborsNoWrap(grid, x, y, cellNotEmpty);
    switch (neighbors) {
      case 0:
      case 1:
        return 0;
        break;
      case 2:
        if (!cellNotEmpty(grid, x, y)) return 0;
      case 3:
        return 1;
        break;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return 0;
        break;
      default:
        break;
    }
    throw 'GOL RULE FAILED';
  }

  function cellIsBurning(grid, x, y) {
    return (grid[x][y] == 3);
  }

  function checkForType(type) {
    return function(grid, x, y) {
      return (grid[x][y] == type);
    };
  }

  // Empty Cells will be 0, Burnt is 1 Trees will be 2, Burning is 3
  function ForestFireRule(grid, x, y) {
    if (grid[x][y] == 3)  // if it's burning, it'll burn out
    {
      return 1;
    } else if (grid[x][y] == 2) {
      // if it's a tree and a neighbor is burning, burn
      if (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(3)) > 0) {
        return 3;
      }
      // a tree may randomly catch fire
      else if (Math.random() > 0.9999) {
        return 3;
      } else {
        return 2;
      }
    }
    // A tree may sprout in a grassy tile
    else if (grid[x][y] == 0 && Math.random() > 0.99) {
      return 2;
    }
    // let grass regrow after some time
    else if (grid[x][y] == 1 && Math.floor(Math.random() * 100) == 0) {
      return 0;
    } else {
      return grid[x][y];
    }
  }

  function mapGenRule(grid, x, y) {
    if (grid[x][y] == 3)  // if it's being dug, it'll be reduced to a mid-level
    {
      return 0;
    } else if (grid[x][y] == 2) {
      // if it's a hilltop and a neighbor is being dug out, dig at a chance
      if (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(3)) > 0 &&
          Math.random() > 0.8) {
        return 3;
      }
      // A coastal tile may erode
      else if (
          getNumberOfNeighborsNoWrap(grid, x, y, checkForType(1)) > 4 &&
          Math.random() > 0.9) {
        return 0;
      }
      // A hilltop may be arndomly selected for digging
      else if (Math.random() > 0.9999) {
        return 3;
      }
      // a hilltop may be randomly selected for flooding
      else if (Math.random() > 0.9999) {
        return 4;
      } else if (
          getNumberOfNeighborsNoWrap(grid, x, y, checkForType(0)) == 0 &&
          getNumberOfNeighborsNoWrap(grid, x, y, checkForType(1)) == 0) {
        // if a hilltop is near a mountain, it may become a mountain
        if (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(5)) > 0 &&
            Math.random() > 0.999) {
          return 5;
        }
        // if a hilltop is totally surrounded by hills, a mountain may form
        else if (
            getNumberOfNeighborsNoWrap(grid, x, y, checkForType(2)) == 8 &&
            Math.random() > 0.99999) {
          return 5;
        } else {
          return 2;
        }
      } else {
        return 2;
      }
    }
    // a hillside may become a eroded if a neighbor is eroded, or will become a
    // flood tile if it a neighbor is flooded and surrounded by hill tiles
    else if (grid[x][y] == 0) {
      if (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(4)) > 0 &&
          Math.random() > 0.7) {
        return 4;
      } else if (
          getNumberOfNeighborsNoWrap(grid, x, y, checkForType(1)) > 0 &&
          Math.random() > 0.9) {
        return 1;
      } else {
        return 0;
      }
    } else if (grid[x][y] == 4) {
      if (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(2)) > 5) {
        return 2;
      } else {
        return 1;
      }
    } else if (grid[x][y] == 1) {
      return 1;
    } else if (
        grid[x][y] == 5 &&
        (getNumberOfNeighborsNoWrap(grid, x, y, checkForType(1)) >
         getNumberOfNeighborsNoWrap(grid, x, y, checkForType(5)))) {
      return 2;
    } else {
      return grid[x][y];
    }
  }

  // Applies the given rule to each cell of the grid and returns the next
  // iteration of the grid. Parameters: grid- a rectangular 2D array
  //            rule - a function of 3 parameters, a grid, and x and y
  //            (integers)
  function evolve(grid, rule) {
    var i, x, y, tempGrid;

    // We need to make tempGrid a 2D array the same dimensions as grid
    tempGrid = new Array(grid.length);
    for (x = 0; x < grid.length; x++) {
      tempGrid[x] = new Array(grid[0].length);
      for (y = 0; y < grid[0].length; y++) {
        tempGrid[x][y] = 0;
      }
    }

    // apply the rule to each item of the cells in the grid
    for (x = 0; x < grid.length; x++) {
      for (y = 0; y < grid[0].length; y++) {
        tempGrid[x][y] = rule(grid, x, y);
      }
    }

    return tempGrid;
  }

  function basicGridInitializer(numCellsWide) {
    var grid = new Array(numCells);
    for (i = 0; i < numCells; i++) {
      grid[i] = new Array(numCells);
    }
    return grid;
  }

  function GOLGridGenerator(numCellsWide) {
    var x, y, grid;
    grid = basicGridInitializer(numCellsWide);
    for (x = 0; x < numCellsWide; x++) {
      for (y = 0; y < numCellsWide; y++) {
        grid[x][y] = Math.floor(Math.random() * 2);
      }
    }
    return grid;
  }

  function ForestFireGridGenerator(numCellsWide) {
    var x, y, grid;
    grid = basicGridInitializer(numCellsWide);
    for (x = 0; x < numCellsWide; x++) {
      for (y = 0; y < numCellsWide; y++) {
        grid[x][y] = Math.floor(Math.random() * 3);
        if (Math.random() < 0.005) {
          grid[x][y] = 3;
        }
      }
    }
    return grid;
  }

  function MapGenGridGenerator(numCellsWide) {
    var x, y, grid;
    grid = basicGridInitializer(numCellsWide);
    for (x = 0; x < numCellsWide; x++) {
      for (y = 0; y < numCellsWide; y++) {
        grid[x][y] = 2
        if (Math.random() < 0.001) {
          grid[x][y] = 3;
        }
      }
    }
    return grid;
  }

  // Initializes the grid to its initial configuration, and pauses the game
  function init() {
    var i, j;
    numCells = Math.floor(numCells);
    paused = true;
    resizeCanvas();
    theGrid = currentGenerator(numCells);
    drawSquareAt(0, 0, canvas.parent().width(), 'white');
    window.requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    var context = document.getElementById('canvas').getContext('2d');
    if (canvas.parent().width() > 600) {
      canvas.width(canvas.parent().width() * .5);
      context.canvas.width = canvas.width();
      canvas.height(canvas.width());
      context.canvas.height = canvas.height();
      elementWidth = canvas.width();
      cellWidth = elementWidth / numCells;
    } else {
      canvas.width(300);
      context.canvas.width = 300;
      canvas.height(300);
      context.canvas.height = 300;
      elementWidth = 300;
      cellWidth = elementWidth / numCells;
    }
  }

  function drawCell(grid, x, y, cellWidth, colorsArray) {
    drawSquareAt(
        x * cellWidth, y * cellWidth, cellWidth, colorsArray[grid[x][y]]);
  }

  // Renders the currently-stored grid
  function draw() {
    var grid = theGrid;
    var x, y;
    // draw the filled in cells
    for (x = 0; x < numCells; x++) {
      for (y = 0; y < numCells; y++) {
        drawCell(grid, x, y, cellWidth, currentRuleColors);
      }
    }
    // Draw gridlines if they'd be visible
    if (cellWidth > 3.5) {
      for (x = 0; x <= numCells * cellWidth; x += cellWidth) {
        drawLineFromTo([x, 0], [x, numCells * cellWidth]);
      }
      for (y = 0; y <= numCells * cellWidth; y += cellWidth) {
        drawLineFromTo([0, y], [numCells * cellWidth, y]);
      }
    }
  }

  function determineRuleAndColors() {
    var allRules = document.getElementsByName('rule');
    var i;
    var selected;
    for (i = 0; i < allRules.length; i++) {
      if (allRules[i].checked) {
        selected = allRules[i].value;
        break;
      }
    }
    switch (selected) {
      case '0': {
        currentRule = GOLNoWrapRule;
        currentRuleColors = GOLColors;
        currentGenerator = GOLGridGenerator;
        break;
      }
      case '1': {
        currentRule = GOLWithWrapRule;
        currentRuleColors = GOLColors;
        currentGenerator = GOLGridGenerator;
        break;
      }
      case '2': {
        currentRule = ForestFireRule;
        currentRuleColors = ForestFireColors;
        currentGenerator = ForestFireGridGenerator;
        break;
      }
      case '3': {
        currentRule = mapGenRule;
        currentRuleColors = WorldGenColors;
        currentGenerator = MapGenGridGenerator;
        break;
      }
      default: {
        currentRule = GOLWithWrapRule;
        currentRuleColors = GOLColors;
        currentGenerator = GOLGridGenerator;
        break;
      }
    }
  }

  // Click Handler for the Play / Pause button. Starts a 100 ms interval for
  // drawing the grid and evolving it
  $('#playPause').click(function() {
    if (paused) {
      paused = false;
      theInterval = window.setInterval(function() {
        var i = 0;
        while (i < stepToDrawAt) {
          theGrid = evolve(theGrid, currentRule);
          i++
        }
        i = 0;
        window.requestAnimationFrame(draw);
      }, timePerFrame);
    } else {
      window.clearInterval(theInterval);
      paused = true;
      window.clearInterval(theInterval);
    }
  });

  function getNumberOfCellsWide() {
    var userValue = document.getElementById('numCells').value;
    if (userValue != '') {
      if (userValue < 10) {
        alert('10 is the minimum');
        numCells = 10;
      } else if (userValue > 200) {
        alert('200 is the maximum');
        numCells = 200;
      } else {
        numCells = userValue;
      }
    }
  }

  function getTimeStep() {
    var userValue = document.getElementById('stepToDrawAt').value;
    if (userValue != '') {
      if (userValue < 1) {
        alert('1 is the minimum generations per frame');
        stepToDrawAt = 1;
      } else {
        stepToDrawAt = userValue;
      }
    }
  }

  function getTimeBetween() {
    var userValue = document.getElementById('msPerFrame').value;
    if (userValue != '') {
      if (userValue < 50) {
        alert('50 is the minimum ms per frame');
        timePerFrame = 50;
      } else {
        timePerFrame = userValue;
      }
    }
  }

  // Reinitializes the grid to its original state and redraws
  $('#newGrid').click(function() {
    window.clearInterval(theInterval);
    getNumberOfCellsWide();
    getTimeStep();
    getTimeBetween();
    determineRuleAndColors();
    init();
    window.requestAnimationFrame(draw);
  });

  $(window).resize(function() {
    resizeCanvas();
    window.requestAnimationFrame(draw);
  });

  init();
});
