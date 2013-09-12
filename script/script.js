/**
 * @author Shohel Shamim
 */
// In this game 4 class used for different purpose
// Class: PageAttributes -> It store all elements of the page; used to chache elements
// Class: GameSettings -> Keep all settings of the gmae, ex: game mode
// Class: ColourMemory -> Keep dynamically generated cards information, colors, points
// Class: GameLoad -> Load required color information using Ajax
$(document).ready(function() {
    //Game mode to select games difficulty level
    var GameMode = {
        EASY : "EASY", //contains 12 cards
        NORMAL : "NORMAL", //contains 16 cards; actual requirment
        HARD : "HARD" //contains 20 cards
    }

    domInit();

    //Initialize DOM
    function domInit() {
        try {
            //Keep all DOM elements
            var pageAttributes = new PageAttributes();
            var gameSettings = new GameSettings();
            pageAttributes.container = $("#container");
            pageAttributes.contentHolder = $("#holder").addClass("gamebackground");
            pageAttributes.gameLoader = $(document.createElement('div')).addClass('gameLoader');
            pageAttributes.menuTitle = $(document.createElement('div')).addClass('mainMenuLogo');
            pageAttributes.menuFooter = $(document.createElement('div')).addClass('mainmenunav');
            pageAttributes.newgamebutton = $(document.createElement('a')).addClass('gamebutton').text("New Game");
            pageAttributes.gameLoader.appendTo(pageAttributes.container);
            pageAttributes.menuTitle.appendTo(pageAttributes.contentHolder);
            pageAttributes.menuFooter.appendTo(pageAttributes.contentHolder);
            //-----------------Game mode selector-----------------
            pageAttributes.gameModeSelector = $('<select />').attr('id', 'gameModeSelector');
            for (var val in GameMode) {
                $('<option />', {
                    value : val,
                    text : GameMode[val]
                }).appendTo(pageAttributes.gameModeSelector);
            }
            //---------------------------------------------------
            var selectorDiv = $(document.createElement('div'));
            pageAttributes.gameModeSelector.appendTo(selectorDiv);
            selectorDiv.appendTo(pageAttributes.menuFooter);            pageAttributes.newgamebutton.appendTo(pageAttributes.menuFooter);
            pageAttributes.contentHolder.hide();
            //Load data from web and show contentHolder
            new GameLoad(pageAttributes, gameSettings).getData();
            //New game click event
            pageAttributes.newgamebutton.click(function() {
                pageAttributes.newgamebutton.unbind('click');
                if (!gameSettings.ajaxError) {
                    gameSettings.colors = getColorsCode(gameSettings.configData);
                    //Set game mode
                    gameSettings.setGameMode(pageAttributes.gameModeSelector.val());
                    pageAttributes.menuTitle.fadeOut(500, function() {
                        pageAttributes.menuTitle.remove()
                    });
                    pageAttributes.menuFooter.fadeOut(500, function() {
                        pageAttributes.menuFooter.remove()
                    });
                    //Keyboard controller (UP,DOWN,LEFT,RIGHT,ENTER)
                    controller(pageAttributes, gameSettings);
                    setTimeout(function() {
                        //Generate New DOM
                        newGameDOM(pageAttributes, gameSettings);
                    }, 500);
                }
            });
        } catch(e) {
            console.error("Error in domInit(): " + (e && e.message) || e.toString());
        }
    }

    //New Game DOM; creates div's for new game
    function newGameDOM(pageAttributes, gameSettings) {
        try {
            pageAttributes.contentHolder.css('cursor', 'none');
            pageAttributes.cardHolder = $(document.createElement('div')).addClass('cardHolder').addClass('shadow');
            pageAttributes.logoType = $(document.createElement('div')).addClass('logoType').addClass('shadow');
            pageAttributes.scoreboard = $(document.createElement('div')).addClass('scoreboard').addClass('shadow');
            pageAttributes.scoreboardTitle = $(document.createElement('div')).addClass('title').addClass('shadow');
            pageAttributes.scoreboardRounds = $(document.createElement('div')).addClass('rounds').addClass('shadow');
            pageAttributes.scoreboardScore = $(document.createElement('div')).addClass('score').addClass('shadow').text("0");
            pageAttributes.scoreboardRemains = $(document.createElement('div')).addClass('remains').addClass('shadow').text("Card Left: " + gameSettings.getTotalCard());
            pageAttributes.scoreboardMessage = $(document.createElement('div')).addClass('message').addClass('shadow').hide();
            pageAttributes.restartButton = $(document.createElement('div')).addClass('restartButton').addClass('shadow').text("Restart");
            pageAttributes.cardHolder.appendTo(pageAttributes.contentHolder);
            pageAttributes.logoType.appendTo(pageAttributes.contentHolder);
            pageAttributes.scoreboard.appendTo(pageAttributes.contentHolder);
            pageAttributes.scoreboardTitle.appendTo(pageAttributes.scoreboard);
            pageAttributes.scoreboardRounds.appendTo(pageAttributes.scoreboard);
            pageAttributes.scoreboardScore.appendTo(pageAttributes.scoreboard);
            pageAttributes.scoreboardRemains.appendTo(pageAttributes.scoreboard);
            pageAttributes.scoreboardMessage.appendTo(pageAttributes.scoreboard);
            pageAttributes.restartButton.appendTo(pageAttributes.contentHolder);
            pageAttributes.scoreboardTitle.text(gameSettings.getGameMode());
            //New Game Settings
            startNewGame(pageAttributes, gameSettings);
        } catch(e) {
            console.error("Error in newGameDOM(): " + (e && e.message) || e.toString());
        }
    }

    //New Game settings
    function startNewGame(pageAttributes, gameSettings) {
        try {
            //Create cards and keep them into ColourMemory class
            var colourMemory = new ColourMemory(gameSettings);
            //Get  random colors depending amout of cards, colors and selection
            colourMemory.setRandomCard();
            //-----------------Generate cards-----------------
            for (var i = 0; i < gameSettings.getTotalCard(); i++) {
                colourMemory.cards[i] = $(document.createElement('div')).css(gameSettings.getCardSize()).addClass("card").addClass("cardImg shadow").attr('id', "card_" + i).appendTo(pageAttributes.cardHolder);
            }
            //------------------------------------------------
            //Set random color to cards
            var timeout = 1000;
            setTimeout(function() {
                for (var i = 0; i < gameSettings.getTotalCard(); i++) {
                    colourMemory.cards[i].removeClass("cardImg shadow");
                    colourMemory.cards[i].css('background', colourMemory.getRandomColors(i));
                    colourMemory.cards[i].addClass("shadow");
                }
            }, timeout);
            pageAttributes.scoreboardRounds.text("Round: " + colourMemory.currentRound++);
            pageAttributes.restartButton.removeClass('restartButton');
            pageAttributes.restartButton.addClass('restartButtonDisable');
            //show cards with colours for few seconds then highlight the first card
            setTimeout(function() {
                for (var i = 0; i < gameSettings.getTotalCard(); i++) {
                    colourMemory.cards[i].css('background', '');
                    colourMemory.cards[i].addClass("cardImg");
                }
                pageAttributes.colourMemory = colourMemory;
                colourMemory.cards[0].removeClass("shadow").addClass("cardSelected");
                //if card is not ready then control will not work
                pageAttributes.cardsReady = true;
                pageAttributes.scoreboardMessage.text("-Select Card-").fadeIn("slow");
            }, gameSettings.getCardVisibleTime() + timeout);
        } catch(e) {
            console.error("Error in startNewGame(): " + (e && e.message) || e.toString());
        }
    }

    //Game Restart for new round
    function restartGame(pageAttributes, gameSettings) {
        try {
            pageAttributes.cardsReady = false;
            pageAttributes.colourMemory = null;
            pageAttributes.cardHolder.remove();
            pageAttributes.logoType.remove();
            pageAttributes.scoreboard.remove();
            pageAttributes.scoreboardTitle.remove();
            pageAttributes.scoreboardRounds.remove();
            pageAttributes.scoreboardScore.remove();
            pageAttributes.scoreboardRemains.remove();
            pageAttributes.scoreboardMessage.remove();
            pageAttributes.restartButton.remove();
            newGameDOM(pageAttributes, gameSettings);
        } catch(e) {
            console.error("Error in restartGame(): " + (e && e.message) || e.toString());
        }
    }

    //Keyboard Controller, only work if card is in ready mode; UP, DOWN, LEFT, RIGHT, ENTER
    //Control to each card Up to Down or Left to Right works like a wave length
    function controller(pageAttributes, gameSettings) {
        var selected = 0;
        var selectedPositions = [];
        var prevPos = 0;
        var curPos = 0;
        var range = gameSettings.getTotalCard() - 1;
        var column = gameSettings.getColumnSize();
        var flipedCards = 0;
        var verifing = false;
        try {
            $(document).keydown(function(e) {
                //If conditon not works for FireFox 4.0, but in updated browser works fine :(
                //if (flipedCards != 16 && !verifing) {}
                switch (e.keyCode) {
                    //Enter
                    case 13:
                        if (pageAttributes.cardsReady) {
                            if (pageAttributes.confirmBoxGameOver != "") {
                                pageAttributes.confirmBoxGameOver.fadeOut(1000);
                                pageAttributes.contentHolder.removeClass('disableContainer');
                                if ($('#yesButton').hasClass('confbuttonSelected')) {
                                    pageAttributes.confirmBoxGameOver.remove();
                                    pageAttributes.confirmBoxGameOver = "";
                                    restartGameControl();
                                } else {
                                    pageAttributes.confirmBoxGameOver.remove();
                                    pageAttributes.confirmBoxGameOver = "";
                                    pageAttributes.restartButton.removeClass('restartButtonDisable');
                                    pageAttributes.restartButton.addClass('restartButton');
                                }
                            } else if (pageAttributes.restartButton.hasClass('restartButton')) {
                                restartGameControl();
                            } else if (!pageAttributes.colourMemory.cards[curPos].hasClass('cardSelectedForPoint') && !pageAttributes.colourMemory.cards[curPos].hasClass('cardMatched')) {
                                pageAttributes.colourMemory.cards[curPos].removeClass("cardSelected").addClass("cardSelectedForPoint");
                                pageAttributes.colourMemory.cards[curPos].css('background', pageAttributes.colourMemory.getRandomColors(curPos));
                                selected++;
                                selected = (selected > gameSettings.getAmountOfCardsMustSelect()) ? 1 : selected;
                                selectedPositions[selected - 1] = curPos;
                                flipedCards++;
                                verification();
                            }
                        }
                        break;
                    //Left
                    case 37:
                        if (pageAttributes.cardsReady) {
                            if (flipedCards != gameSettings.getTotalCard() && !verifing) {
                                getPositions(37);
                                findNextCard(37);
                            } else {
                                swapConfirmButton();
                            }
                        }
                        break;
                    //Up
                    case 38:
                        if (pageAttributes.cardsReady) {
                            if (flipedCards != gameSettings.getTotalCard() && !verifing) {
                                getPositions(38);
                                findNextCard(38);
                            }
                        }
                        break;

                    //Right
                    case 39:
                        if (pageAttributes.cardsReady) {
                            if (flipedCards != gameSettings.getTotalCard() && !verifing) {
                                getPositions(39);
                                findNextCard(39);
                            } else {
                                swapConfirmButton();

                            }
                        }
                        break;
                    //Down
                    case 40:
                        if (pageAttributes.cardsReady) {
                            if (flipedCards != gameSettings.getTotalCard() && !verifing) {
                                getPositions(40);
                                findNextCard(40);
                            }
                        }
                        break;
                    default:
                        break;
                }
                //Swap confirmation buttons selection
                function swapConfirmButton() {
                    try {
                        if (pageAttributes.confirmBoxGameOver != "") {
                            if ($('#yesButton').hasClass('confbuttonSelected')) {
                                $('#yesButton').removeClass('confbuttonSelected');
                                $('#noButton').addClass('confbuttonSelected')
                            } else {
                                $('#noButton').removeClass('confbuttonSelected');
                                $('#yesButton').addClass('confbuttonSelected');
                            }
                        }
                    } catch(e) {
                        console.error("Error in controller(): swapConfirmButton(): " + (e && e.message) || e.toString());
                    }
                }

                //Return next cards position, always provide position right to left and up to down
                function getPositions(keyNum) {
                    try {
                        if (keyNum == 37) {
                            curPos--;
                            curPos = (curPos < 0) ? range : curPos;
                        } else if (keyNum == 38) {
                            curPos -= column;
                            if (curPos == (-column)) {
                                curPos = range;
                            } else {
                                curPos = (curPos < 0) ? (range + curPos) : curPos;
                            }
                        } else if (keyNum == 39) {
                            curPos++;
                            curPos = (curPos > range) ? 0 : curPos;
                        } else if (keyNum == 40) {
                            curPos += column;
                            if ((curPos - range) == column) {
                                curPos = 0;
                            } else {
                                curPos = (curPos > range) ? (curPos - range) : curPos;
                            }
                        }
                    } catch(e) {
                        console.error("Error in controller(): getPositions(): " + (e && e.message) || e.toString());
                    }
                }

                //find next card from right to left, if a card removed select next card of from right side
                function findNextCard(keyNum) {
                    var counter = 0;
                    try {
                        while ((pageAttributes.colourMemory.cards[curPos].hasClass('cardSelectedForPoint') || pageAttributes.colourMemory.cards[curPos].hasClass('cardMatched')) && counter != gameSettings.getTotalCard()) {
                            getPositions(keyNum);
                            counter++;
                        }
                    } catch(e) {
                        console.error("Error in controller(): findNextCard(): " + (e && e.message) || e.toString());
                    }
                    highlightNextCard(prevPos, curPos, counter);
                }

                //highlight next suitable position, always provide position right to left
                function highlightNextCard(pre, cur, count) {
                    try {
                        if (count != gameSettings.getTotalCard()) {
                            if (!pageAttributes.colourMemory.cards[curPos].hasClass('cardSelectedForPoint') || !pageAttributes.colourMemory.cards[curPos].hasClass('cardMatched')) {
                                pageAttributes.colourMemory.cards[pre].addClass("shadow").removeClass("cardSelected");
                            }
                            pageAttributes.colourMemory.cards[cur].removeClass("shadow").addClass("cardSelected");
                            prevPos = cur;
                        }
                    } catch(e) {
                        console.error("Error in controller(): highlightNextCard(): " + (e && e.message) || e.toString());
                    }
                }

                //Restart game and initialize settings
                function restartGameControl() {
                    try {
                        restartGame(pageAttributes, gameSettings);
                        selected = 0;
                        selectedPositions = [];
                        prevPos = 0;
                        curPos = 0;
                        range = gameSettings.getTotalCard() - 1;
                        column = gameSettings.getColumnSize();
                        flipedCards = 0;
                        verifing = false;
                    } catch(e) {
                        console.error("Error in controller(): restartGameControl(): " + (e && e.message) || e.toString());
                    }
                }

                //Verify cards for points
                function verification() {
                    pageAttributes.scoreboardMessage.fadeOut("slow");
                    //Wait for verification, default 2sec
                    if (selected == gameSettings.getAmountOfCardsMustSelect()) {
                        verifing = true;
                        setTimeout(function() {
                            if ((gameSettings.getTotalCard() - flipedCards) != 0) {
                                pageAttributes.scoreboardRounds.text("Round: " + pageAttributes.colourMemory.currentRound++);
                            }
                            //could use .each funtion in .cardSelectedForPoint (div);
                            //however, chached data can run faster that tested by own benchmark
                            //$(".cardSelectedForPoint").each(function() {});
                            var cardMatched = false;
                            var firstCardColor = pageAttributes.colourMemory.getRandomColors(selectedPositions[0]);
                            for (var i = 0; i < selected; i++) {
                                if (firstCardColor == pageAttributes.colourMemory.getRandomColors(selectedPositions[i])) {
                                    cardMatched = true;
                                } else {
                                    cardMatched = false;
                                    break;
                                }
                            }
                            pageAttributes.colourMemory.tried++;
                            if (cardMatched) {
                                pageAttributes.scoreboardMessage.text(performance(pageAttributes.colourMemory.tried));
                                pageAttributes.scoreboardMessage.fadeIn("slow");
                                pageAttributes.colourMemory.tried = 0;
                                for (var i = 0; i < selected; i++) {
                                    var card = pageAttributes.colourMemory.cards[selectedPositions[i]];
                                    card.css('background', '');
                                    card.removeClass("cardImg");
                                    card.removeClass("cardSelectedForPoint");
                                    card.addClass("cardMatched");
                                }

                                //add score for success
                                pageAttributes.colourMemory.setScore(pageAttributes.scoreboardScore, true);

                                if (flipedCards != gameSettings.getTotalCard()) {
                                    findNextCard(39);
                                } else {
                                    pageAttributes.colourMemory.cards[prevPos].addClass("shadow");
                                    pageAttributes.scoreboardMessage.text("Game Over").fadeIn("slow");
                                    setTimeout(function() {
                                        var title = "Game Over";
                                        var messageOne = "Your Score: " + pageAttributes.colourMemory.getScore();
                                        var messageTwo = "Status: " + pageAttributes.colourMemory.getPerformanceByTotal();
                                        var messageThree = "Do you want to play again?";
                                        confirmBox(pageAttributes, title, messageOne, messageTwo, messageThree);
                                    }, 250);
                                }
                            } else {
                                for (var i = 0; i < selected; i++) {
                                    var card = pageAttributes.colourMemory.cards[selectedPositions[i]];
                                    card.css('background', '');
                                    card.addClass("shadow");
                                    card.removeClass("cardSelectedForPoint");
                                    highlightNextCard(prevPos, curPos, 0);
                                }
                                //reduce point for fail
                                pageAttributes.colourMemory.setScore(pageAttributes.scoreboardScore, false);
                                flipedCards -= gameSettings.getAmountOfCardsMustSelect();
                            }
                            verifing = false;
                            pageAttributes.scoreboardRemains.text("Card Left: " + (gameSettings.getTotalCard() - flipedCards));
                            selectedPositions = [];
                        }, gameSettings.getWaitingTimeToMatchCard());
                    }
                }

            });
        } catch(e) {
            console.error("Error in controller(): " + (e && e.message) || e.toString());
        }
    }

    //Get colour code from conf. file
    function getColorsCode(data) {
        try {
            var colors = new Array();
            var tempData = "";
            data = data.split('\n');
            var k = 0;
            for (var i = 0; i < data.length; i++) {
                tempData = data[i].split(' ');
                for (var j = 0; j < tempData.length; j++) {
                    tempData = $.trim(tempData[j]);
                    //only accept hex color length of 4 and 7 including '#' sign
                    if (tempData.charAt(0) == "#" && (tempData.length == 4 || tempData.length == 7)) {
                        colors[k++] = tempData;
                    }
                }
            }

            //If data has no color code, colors will take from fixed colors list as default
            if (colors.length == 0) {
                console.log("Default colors loaded");
                var codes = new Array();
                codes = function() {
                    var fixedColors = new Array();
                    fixedColors[0] = "#00848b";
                    fixedColors[1] = "#8b003f";
                    fixedColors[2] = "#008b06";
                    fixedColors[3] = "#4c008b";
                    fixedColors[4] = "#858b00";
                    fixedColors[5] = "#00408b";
                    fixedColors[6] = "#8b4b00";
                    fixedColors[7] = "#ffc177";
                    return fixedColors;
                }
                colors = codes();
            }
        } catch(e) {
            console.error("Error in generateReadableData(): " + (e && e.message) || e.toString());
        } finally {
            return colors;
        }
    }

    //Confiramation Box: taking decision whether user wants to play game again or not
    function confirmBox(pageAttributes, title, messageOne, messageTwo, messageThree) {
        try {
            pageAttributes.contentHolder.addClass('disableContainer');
            pageAttributes.confirmBoxGameOver = $(document.createElement('div')).addClass('confirmBox');
            pageAttributes.confirmBoxGameOver.css('cursor', 'none');
            pageAttributes.confirmBoxGameOver.appendTo(pageAttributes.container);
            var confTitleHolder = $(document.createElement('div')).attr('id', 'confTitleHolder');
            confTitleHolder.appendTo(pageAttributes.confirmBoxGameOver);
            var confTitle = $(document.createElement('span')).text(title);
            confTitle.appendTo(confTitleHolder);
            var confMessageHolder = $(document.createElement('div')).attr('id', 'confMessageHolder');
            confMessageHolder.appendTo(pageAttributes.confirmBoxGameOver);
            var score = $(document.createElement('p')).text(messageOne);
            var performance = $(document.createElement('p')).text(messageTwo);
            var message = $(document.createElement('p')).text(messageThree);
            score.appendTo(confMessageHolder);
            performance.appendTo(confMessageHolder);
            message.appendTo(confMessageHolder);
            var confButtonHolder = $(document.createElement('div')).attr('id', 'confButtonHolder');
            confButtonHolder.appendTo(pageAttributes.confirmBoxGameOver);
            var yesButton = $(document.createElement('a')).attr('id', 'yesButton').addClass('confbutton').text("Yes");
            var noButton = $(document.createElement('a')).attr('id', 'noButton').addClass('confbutton').text("No");
            yesButton.addClass('confbuttonSelected').appendTo(confButtonHolder);
            noButton.appendTo(confButtonHolder);
        } catch(e) {
            console.error("Error in confirmBox(): " + (e && e.message) || e.toString());
        }
    }

    //return performance description
    function performance(num) {
        try {
            switch (num) {
                case 1:
                    return "Outstanding";
                    break;
                case 2:
                    return "Brilliant";
                    break;
                case 3:
                    return "Excellent";
                    break;
                case 4:
                    return "Good";
                    break;
                case 5:
                    return "Average";
                    break;
                case 6:
                    return "Poor";
                    break;
                default:
                    return "Very Poor";
                    break;
            }
        } catch(e) {
            console.error("Error in confirmBox(): " + (e && e.message) || e.toString());
        }
    }

    //******************************Classes**********************************************
    //Load configuration
    function GameLoad(pageAttributes, gameSettings) {
        this.getData = function() {
            try {
                $.ajax({
                    async : true,
                    timeout : 5000,
                    cache : false,
                    type : 'GET',
                    url : "color.php",
                    dataType : 'text',
                    beforeSend : function() {
                        pageAttributes.gameLoader.css('background-image', 'url(images/ajax-loader.gif)');
                    },
                    error : function(jqXHR, exception) {
                        if (jqXHR.status === 0) {
                            alert('Not connect.\n Verify Network.');
                        } else if (jqXHR.status == 404) {
                            alert('Requested page not found.');
                        } else if (jqXHR.status == 500) {
                            alert('Internal Server Error.');
                        } else if (exception === 'timeout') {
                            alert('Time out error.');
                        } else if (exception === 'abort') {
                            alert('Ajax request aborted.');
                        } else {
                            alert('Uncaught Error.\n' + jqXHR.responseText);
                        }
                        gameSettings.ajaxError = true;
                    },
                    success : function(data) {
                        gameSettings.configData = data;
                    },
                    complete : function() {
                        setInterval(function() {
                            pageAttributes.gameLoader.remove();
                            pageAttributes.contentHolder.fadeIn(500);
                        }, 250);
                    }
                });
            } catch(e) {
                console.error("Error in dataLoad(): " + (e && e.message) || e.toString());
            }
        }
    }

    //Colour Memory Class, games functionalities works from here
    function ColourMemory(settings) {
        try {
            var gameSettings = settings;
            var randomColors = new Array();
            var successScore = 1;
            var failScore = 1;
            var totalScore = 0;
            this.cards = new Array();
            this.currentRound = 1;
            this.tried = 0;
            //return random colors
            this.getRandomColors = function(index) {
                return randomColors[index];
            }
            //Return performance description
            this.getPerformanceByTotal = function() {
                var result = this.currentRound - (gameSettings.getTotalCard() / gameSettings.getAmountOfCardsMustSelect());
                return performance(result);
            }
            //Set score to scoreboard div, if true = success else fail
            this.setScore = function(scoreboardScoreAttribute, scored) {
                totalScore = (scored) ? totalScore += successScore : totalScore -= successScore;
                var color = "";
                if (totalScore < 0) {
                    color = "#FF0000";
                } else if (totalScore > 0) {
                    color = "#008000";
                } else {
                    color = "#FFFFFF";
                }
                scoreboardScoreAttribute.css('color', color).text(totalScore);
            }
            //return total score
            this.getScore = function() {
                return totalScore;
            }
            //set cards color randomly
            this.setRandomCard = function() {
                var colorLength = gameSettings.colors.length;

                //If cards amount increase or decrease, or colors amount changed
                //below loop will detect and solve them
                var cardSelect = gameSettings.getAmountOfCardsMustSelect();
                var totalCard = gameSettings.getTotalCard();
                var i = 0;
                var k = 0;

                //Colors destribution
                while (i < colorLength) {
                    for (var j = 0; j < cardSelect; j++) {
                        randomColors[k] = gameSettings.colors[i];
                        k++;
                        if (k == totalCard) {
                            i = colorLength;
                            break;
                        }
                    }
                    if (k < totalCard && (i + 1) == colorLength) {
                        i = 0;
                    } else {
                        i++;
                    }
                }

                //Shuffle colors
                var len = randomColors.length;
                var i = len;
                while (i--) {
                    var pos = parseInt(Math.floor(Math.random() * len));
                    var temp = randomColors[i];
                    randomColors[i] = randomColors[pos];
                    randomColors[pos] = temp;
                }
            }
        } catch(e) {
            console.error("Error in ColourMemory: " + (e && e.message) || e.toString());
        }
    }

    //Save game setting
    function GameSettings() {
        try {
            var totalCard = 16;
            var columnSize = 4;
            var cardVisibleTime = 2000;
            var waitingTimeToMatchCard = 2000;
            var amountOfCardsMustSelect = 2;
            var cardSize;
            var gameMode;
            this.colors = new Array();
            this.configData = "";
            this.ajaxError = false;

            //save game mode
            this.setGameMode = function(mode) {
                gameMode = mode;
                switch(gameMode) {
                    case GameMode.EASY:
                        totalCard = 12;
                        //12
                        columnSize = 4;
                        cardVisibleTime = 4000;
                        //4000;
                        cardSize = {
                            width : "80px",
                            height : "100px",
                            margin : "40px 16px"
                        };
                        break;
                    case GameMode.NORMAL:
                        totalCard = 16;
                        columnSize = 4;
                        cardVisibleTime = 2000;
                        cardSize = {
                            width : "80px",
                            height : "100px",
                            margin : "17px 16px"
                        };
                        break;
                    case GameMode.HARD:
                        totalCard = 20;
                        columnSize = 4;
                        cardVisibleTime = 2000;
                        cardSize = {
                            width : "80px",
                            height : "90px",
                            margin : "8px 16px"
                        };
                        break;
                }

            }

            this.getTotalCard = function() {
                return totalCard;
            }

            this.getColumnSize = function() {
                return columnSize;
            }

            this.getCardVisibleTime = function() {
                return cardVisibleTime;
            }

            this.getWaitingTimeToMatchCard = function() {
                return waitingTimeToMatchCard;
            }

            this.getAmountOfCardsMustSelect = function() {
                return amountOfCardsMustSelect;
            }

            this.getCardSize = function() {
                return cardSize;
            }

            this.getGameMode = function() {
                return gameMode;
            }
        } catch(e) {
            console.error("Error in GameSettings: " + (e && e.message) || e.toString());
        }
    }

    //Keep page elements
    function PageAttributes() {
        try {
            this.container = "";
            this.contentHolder = "";
            this.newgamebutton = "";
            this.gameModeSelector = "";
            this.gameLoader = "";
            this.menuTitle = "";
            this.menuFooter = "";
            this.cardHolder = "";
            this.logoType = "";
            this.scoreboard = "";
            this.scoreboardTitle = "";
            this.scoreboardRounds = "";
            this.scoreboardScore = "";
            this.scoreboardRemains = "";
            this.scoreboardMessage = "";
            this.restartButton = "";
            this.confirmBoxGameOver = "";
            this.colourMemory = "";
            this.cardsReady = false;
        } catch(e) {
            console.error("Error in PageAttributes: " + (e && e.message) || e.toString());
        }
    }

});
