$(document).ready(function()
{
   var numElements = 30;
   var canvas = $("#canvas");
   var canvasWidth;
   var elementWidth;
   var listToSort;
   var paused = true;
   var theInterval;
   var stepToDrawAt;
   var timePerFrame = 10;
   var algToUse;
   var algComparisonStep;
   var algSwapStep;
   var currentStep;
   
   
   var comparison = function(index1, index2, color)
   {
        drawElementAt(index1,listToSort[index1],color);
        drawElementAt(index2,listToSort[index2],color);
        return (listToSort[index1] > listToSort[index2]);
   }
   
   var BubbleSwap = function(index1, index2, color)
   {
        var temp;
        drawElementAt(index1,listToSort[index1],color);
        drawElementAt(index2,listToSort[index2],color);
        temp = listToSort[index2];
        listToSort[index2] = listToSort[index1];
        listToSort[index1] = temp;
   }
   
   var BubbleNext = function(index1, index2, color)
   {
        drawSquareAt(0,0,canvas.parent().width(),"white");
        window.requestAnimationFrame(draw);
   }

   
    //Click Handler for the Play / Pause button. Starts a 100 ms interval for
    // drawing the grid and evolving it
    $("#playPause").click(function()
    {
        if(paused)
        {
            console.log("Unpausing");
            paused = false;
            BubbleSort();
        }
    });

   
   function BubbleSort()
   {
       var currentI, currentJ, currentSwap, iterationSwap, currentStep, refreshTime, compareTime
       currentI = 0;
       currentJ = 0;
       iterationSwap = false;
       currentStep = 0;
       
       theInterval = window.setInterval(function()
        {   
            // console.log("Drawing a frame, " + currentStep);
            // console.log("currentI is " + currentI);
            // console.log("currentJ is " + currentJ);
            // console.log("currentStep is " + currentStep);
            if(currentI >= listToSort.length)
            {
                console.log("Sorted!");
                window.clearInterval(theInterval);
                return;   
            }
            if(currentJ < listToSort.length)
            {
                if(currentStep == 0)
                {
                    currentSwap = comparison(currentJ, currentJ+1, "green");
                    // console.log("Swap was needed: "+currentSwap);
                    if(currentSwap)
                    {
                        BubbleSwap(currentJ, currentJ+1, "red");
                        iterationSwap = true;
                    }
                    currentStep = 1;
                }
                else if(currentStep == 1)
                {
                    BubbleNext(currentJ, currentJ+1, "black");
                    currentStep = 0;             
                    currentJ++;
                }
            }
            else
            {
                if(iterationSwap == false)
                {
                    console.log("Sorted!");
                    window.clearInterval(theInterval);
                    return;
                }
                // console.log("reached the end of the list?");
                currentJ = 0;
                iterationSwap = false;
                currentI++;
                currentStep = 0;
            }
        },timePerFrame);
       
   }   
   
    function createSortedList(size)
    {
        var i, list;
        list = [];
        for(i = 1; i <= size; i++)
        {
            list.push(i);
        }
        return list;
    }
    
    function shuffle(listToShuffle)
    {
        var toReturn, toTake;
        toReturn = [];
        while(listToShuffle.length > 0)
        {
            toTake = Math.floor(Math.random() * listToShuffle.length);
            toReturn.push(listToShuffle[toTake]);
            listToShuffle.splice(toTake, 1);
        }
        return toReturn;
    }
    
    //Uses the HTML5 Canvas functions to draw a line from the beginning point to the
    //given endpoint. Line will have the default width
    //Parameters: begin and end - arrays of the format [x,y], where the elements are
    // the cartesian coordinates of the start and end pixel
    function drawLineFromTo(begin,end) 
    {
        var context = document.getElementById('canvas').getContext('2d');
        context.beginPath();
        context.moveTo(begin[0],begin[1]);
        context.lineTo(end[0],end[1]);
        context.stroke();
    }


    //Draws a square with side length "width" with its top left corner at (x,y).
    //Colorstring specifies the fill color, which should be a CSS color string
    function drawSquareAt(x,y,width,colorString)
    {
        var context = document.getElementById('canvas').getContext('2d');
        context.beginPath();
        context.rect(x,y,width,width);
        context.fillStyle = colorString;
        context.fill();
    }

    //Draws a rectangle with side length "width" and height "height" with its bottom left corner at x.
    //Colorstring specifies the fill color, which should be a CSS color string
    function drawElementAt(x,value,colorString)
    {
        //console.log("drawing a " + colorString + " " + value + " at " + x);
        var context = document.getElementById('canvas').getContext('2d');
        context.beginPath();
        if(elementWidth > 10)
        {
            context.rect(x * elementWidth ,canvasWidth - value*elementWidth,elementWidth-1,value*elementWidth);    
        }
        else
        {
            context.rect(x * elementWidth ,canvasWidth - value*elementWidth,elementWidth,value*elementWidth);    
        }
        
        context.fillStyle = colorString;
        context.fill();
    }
    
    
    //Initializes the grid to its initial configuration, and pauses the game
    function init() 
    {
        var i,j;
        numElements = Math.floor(numElements);
        paused = true;
        resizeCanvas();
        listToSort = shuffle( createSortedList(numElements) );
        drawSquareAt(0,0,canvas.parent().width(),"white");
        window.requestAnimationFrame(draw);
    }
    
    function resizeCanvas()
    {
        var context = document.getElementById('canvas').getContext('2d');
        if(canvas.parent().width() > 600)
        {
            canvas.width(canvas.parent().width() * .5);
            context.canvas.width = canvas.width();    
            canvas.height(canvas.width());
            context.canvas.height = canvas.height();
            canvasWidth = canvas.width();
            elementWidth =  canvasWidth / numElements;
        }
        else
        {
            canvas.width(300);
            context.canvas.width = 300;    
            canvas.height(300);
            context.canvas.height = 300;
            canvasWidth = 300;
            elementWidth = canvasWidth / numElements;
        }
    }

    function drawCell(grid,x,y,elementWidth,colorsArray)
    {
        drawSquareAt(x*elementWidth,y*elementWidth,elementWidth,colorsArray[grid[x][y]]);
    }

    //Renders the currently-stored grid
    function draw() {
        var list = listToSort;
        var x,y;
        //draw the filled in elements
        for(x = 0; x < list.length; x++)
        {
            drawElementAt(x, list[x], "black");
        }
        // //Draw gridlines if they'd be visible
        // if(elementWidth > 3.5)
        // {
        //     for(x = 0; x <= numElements * elementWidth; x += elementWidth)
        //     {
        //         drawLineFromTo([x,0],[x,numElements * elementWidth]);
        //     }
        //     for(y = 0; y <= numElements * elementWidth; y += elementWidth)
        //     {
        //         drawLineFromTo([0,y],[numElements * elementWidth,y]);
        //     }
        // }
    }

    function determineAlg()
    {
    var allRules = document.getElementsByName("alg");
    var i;
    var selected;
    for(i = 0; i < allRules.length; i++)
    {
        if(allRules[i].checked)
        {
        selected = allRules[i].value;
        break;
        }
    }
    console.log(selected + " was selected");
    switch(selected)
    {
        case "0":
        {
            algToUse = BubbleSort;
            currentStep = comparison;
            break;
        }
        default:
        {
            algToUse = BubbleSort;
            break;
        }
    }
    }

    function getNumElements()
    {
        var userValue = document.getElementById("numElements").value;
        console.log(userValue);
        if( userValue != "")
        {
            if(userValue < 3)
            {
            alert("3 is the minimum");
            numElements = 3;
            }
            else if (userValue > 200) {
            alert("200 is the maximum");
            numElements = 200;
            }
            else {
            numElements = userValue;
            }
        }
    }

    function getTimeBetween()
    {
        var userValue = document.getElementById("msPerFrame").value;
        //console.log(userValue);
        if( userValue != "")
        {
            if(userValue < 5)
            {
            alert("5 is the minimum ms per frame");
            timePerFrame = 5;
            }
            else {
            timePerFrame = userValue;
            }
        }
    }

    //Reinitializes the grid to its original state and redraws
    $("#newSort").click(function()
    {
        window.clearInterval(theInterval);
        getNumElements();
        getTimeBetween();
        determineAlg();
        init();
        window.requestAnimationFrame(draw);
    });
    
    $(window).resize(function()
    {
       resizeCanvas(); 
        window.requestAnimationFrame(draw);
    });

    init();
});