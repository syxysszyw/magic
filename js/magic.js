/* global $, alert */
'use strict';

$(function() {

    var $gameContainer = $("#game-container");
    var $file = $("#file");
    var $prop = $('.prop');
    var $btn = $('.weui_uploader_input_wrp');

    /* 摇一摇 */
    var last_update = 0;
    var current_x = 0,
        current_y = 0,
        current_z = 0,
        last_x = 0,
        last_y = 0,
        last_z = 0;

    /* prop相关 */
    var propW, propH;
    var propPath = './prop.png';

    /* 三击 */
    var clickCount = 0,
        clickTimer;

    /* 拖动 */
    var propLeft = parseInt($prop.css('left')),
        propTop = parseInt($prop.css('top'));

    // window
    var windowW = $(window).width(),
        windowH = $(window).height(),
        windowWidthHeightRatio = windowW / windowH;

    var scrollWidth = document.body.scrollWidth;     // 375
    var scrollHeight = document.body.scrollHeight;   // 559

    // alert(scrollWidth)
    // alert(scrollHeight)

    // gameContainer
    var gameContainerWidthHeightRatio;

    var strechDirection;

    var maxOffsetL, maxOffsetT;

    var propOffsetL, propOffsetT;

    var lastBeta = 0,
        currentBeta = 0,
        lastGamma = 0,
        currentGamma = 0;

    var propVx = 0,
        propVy = 0;

    window.requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    var useImgAsBackground = true;

    function setGameContainerBackground(container, result, useImg) {
        if(useImg) {
            /* 用img */
            $gameContainer.html('<img src="' + result + '" alt="" />');
            if(localStorage.getItem('strechDirection')) {
                $gameContainer.find('img').css({
                    'height': 'auto',
                    'width': '100%'
                });
            }
        }
        

        /* 用background-image */
        // container.css({
        //     'background-image': 'url(' + result + ')'
        // })
    }

    // function setBackgroundToFullScreen(windowRatio, backgroundRatio) {
    //     if(windowRatio < backgroundRatio) {

    //     }
    // }

    function readAsDataURL() {
        //检验是否为图像文件  
        var file = $file[0].files[0];
        if (!/image\/\w+/.test(file.type)) {
            alert("看清楚，这个需要图片！");
            return false;
        }
        var reader = new FileReader();


        //将文件以Data URL形式读入页面  
        reader.readAsDataURL(file);
        reader.onload = function() {

            setGameContainerBackground($gameContainer, this.result, useImgAsBackground);
            localStorage.setItem('defaultBg', this.result);
            $btn.hide();

            var img = new Image();
            img.onload = function() {
                gameContainerWidthHeightRatio = img.width / img.height;
                if(gameContainerWidthHeightRatio < windowWidthHeightRatio) {
                    // 图片的长/宽比 小于    屏幕的长宽比，strechDirection为1， 表示要把图片的宽拉伸至屏幕宽度
                    // 图片的长/宽比 大于等于 屏幕的长宽比，strechDirection为0， 表示要把图片的高拉伸到屏幕高度
                    // strechDirection = gameContainerWidthHeightRatio < windowWidthHeightRatio ? 1 : 0;

                    // 缩放宽度
                    // 缩放宽度
                    // 缩放宽度
                    localStorage.setItem('strechDirection', 1);
                    console.log('缩放宽度');
                    $gameContainer.find('img').css({
                        'height': 'auto',
                        'width': '100%'
                    });
                } else {
                    // 缩放高度
                    // 缩放高度
                    // 缩放高度
                    localStorage.setItem('strechDirection', 0);
                    console.log('缩放高度');
                }
            }
            img.src = this.result;
        };
    }

    /* 获取img真实尺寸  http://q.cnblogs.com/q/66161/ */
    function getPropSize(imgPath) {
        var img = new Image();
        var propRealW, propRealH;

        img.onload = function() {
            propRealW = img.width;
            propRealH = img.height;
            propW = parseInt($('.prop img').css('width'), 10);
            propH = propRealH * propW / propRealW;
            maxOffsetL = windowW - propW;
            maxOffsetT = windowH - propH;
        };

        img.src = imgPath;
    }

    // 每时每刻都在进行
    function deviceMotionHandler(eventData) {
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime - last_update) > 100) {
            var diffTime = curTime - last_update;
            last_update = curTime;
            current_x = acceleration.x;
            current_y = acceleration.y;
            current_z = acceleration.z;
            var speed = Math.abs(current_x + current_y + current_z - last_x - last_y - last_z) / diffTime * 10000;

            if (speed > 2000 && $prop.css('display') !== 'block') {
                console.log(speed);
                // alert("摇动了");
                $prop.show().css({
                    'top': '0px',
                    'left': '0px'
                });
                propVx = 0;
                propVy = 0;

                $(window).on('deviceorientation', handleOrientation);
                console.log('propVx', propVx)
                console.log('propVy', propVy)
            }
            last_x = current_x;
            last_y = current_y;
            last_z = current_z;
        }
    }

    function handleOrientation(evt) {
        requestAnimationFrame(function() {
            render();
            update(evt);
        });
    }

    function render() {
        $prop.css({
            'left': propLeft + 'px',
            'top': propTop + 'px'
        });
    }

    /* gamma  向左转一圈 0~-90, 90~0, 0~-90，90~0 会有一个“-90 到 90” 的瞬间变化，一直是在减小的过程 
       整体加90  向左转一圈 90~0, 180~90, 90~0，180~90 会有一个“0 到 180” 的瞬间变化，一直是在减小的过程 

       gamma  向右转一圈 0~90, -90~0, 0~90，-90~0 会有一个“180 到 0” 的瞬间变化，一直是在增大的过程
       整体加90  向右转一圈 90~180, 0~90, 90~180，0~90 会有一个“90 到 -90” 的瞬间变化，一直是在增大的过程  */

    function update(evt) {
        var absBeta = Math.abs(currentBeta) <= 90 ? Math.abs(currentBeta) : 180 - Math.abs(currentBeta);
        var betaDirection = currentBeta >= 0 ? 1 : -1;

        currentBeta = evt.beta; // [-180, 180]
        currentGamma = evt.gamma; // [-90, 90]

        // 判断突变
        if (Math.abs(currentGamma - lastGamma) >= 80) {
            currentGamma = 0 - currentGamma;
            // $('.consoledataa').html(currentGamma);
        }

        propVy = absBeta / 90 * betaDirection * 40;
        propVx = currentGamma / 90 * 40;

        propTop += propVy;
        propLeft += propVx;

        if (propLeft < 0) {
            propLeft = 0;
            propVx = 0;
        } else if (propLeft > maxOffsetL) {
            propLeft = maxOffsetL;
            propVx = 0;
        }

        if (propTop < 0) {
            propTop = 0;
            propVy = 0;
        } else if (propTop > maxOffsetT) {
            propTop = maxOffsetT;
            propVy = 0;
        }

        lastBeta = currentBeta;
        lastGamma = currentGamma;
        // $('.consoledatab').html(lastGamma);
    }

    /* 全屏 */
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }



    // alert(window.screen.availWidth * window.devicePixelRatio);
    // alert(window.screen.availHeight * window.devicePixelRatio);

    // alert('availHeight ' + window.screen.availHeight);
    // alert('innerHeight ' + window.innerHeight);
    // alert('clientHeight ' + document.body.clientHeight);
    // alert('offsetHeight ' + document.body.offsetHeight);
    // alert('scrollHeight ' + document.body.scrollHeight);

    /* 启动全屏 */
    launchFullscreen(document.documentElement); // 整个网页
    launchFullscreen(document.getElementById('game-container')); // 某个页面元素

    // if(!localStorage.windowRatio) {
    //     localStorage.setItem('windowRatio', windowWidthHeightRatio);
    // }

    if (localStorage.defaultBg) {
        $btn.hide();
        setGameContainerBackground($gameContainer, localStorage.defaultBg, useImgAsBackground);
    }

    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', deviceMotionHandler, false);
    } else {
        alert('not support mobile event');
    }

    if (!window.DeviceOrientationEvent) {
        alert('not support mobile event');
    }

    $file.on('change', function() {
        readAsDataURL();
    });

    getPropSize(propPath);

    /* 拖动 */
    $prop.on('touchstart', function(event) {

        $(window).off('deviceorientation');

        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];

            propOffsetL = touch.pageX - $prop.offset().left;
            propOffsetT = touch.pageY - $prop.offset().top;
        }

    }).on('touchmove', function(event) {
        // console.log('touches', event.touches);
        // console.log('targetTouches', event.targetTouches);
        // console.log('changeTouches', event.changeTouches);

        event.preventDefault(); //阻止其他事件

        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0]; // 把元素放在手指所在的位置

            propLeft = touch.pageX - propOffsetL;
            propTop = touch.pageY - propOffsetT;

            $prop.css({
                // 'left': touch.pageX - propOffsetL + 'px',
                // 'top': touch.pageY - propOffsetT + 'px'
                'left': propLeft + 'px',
                'top': propTop + 'px'

            });

            if(touch.pageY <= 20){
                $prop.hide('slow');
                console.log('touchmove, leaveTouchPageY ' + touch.pageY);
                // 重置相关变量
                $(window).off('deviceorientation');
                propVx = 0;
                propVy = 0;
                console.log('touchmove, propVy ' +propVy);
                lastBeta = 0;
                currentBeta = 0;
                lastGamma = 0;
                currentGamma = 0;
                last_x = 0;
                current_x = 0;
                last_y = 0;
                current_y = 0;
                last_z = 0;
                current_z = 0;
            }
        }

    }).on('touchend', function() {

        // 这个时候已经没有 event.targetTouches了
        $(window).on('deviceorientation', handleOrientation);

        var leaveTouchPageX = propOffsetL + $prop.offset().left;
        var leaveTouchPageY = propOffsetT + $prop.offset().top;

        /* 边界判断 */
        // 如果 touchend 的时候手指处于屏幕边缘（正负20范围），才让图片消失
        // if (leaveTouchPageX <= 20 || leaveTouchPageX >= windowW - 20 || leaveTouchPageY <= 20 || leaveTouchPageY >= windowH - 20) {
        if (leaveTouchPageX <= 20 || leaveTouchPageX >= scrollWidth - 20 || leaveTouchPageY <= 20 || leaveTouchPageY >= scrollHeight - 20) {
            $prop.hide('slow');
            // 重置相关变量
            $(window).off('deviceorientation');
            propVx = 0;
            propVy = 0;
            lastBeta = 0;
            currentBeta = 0;
            lastGamma = 0;
            currentGamma = 0;
            last_x = 0;
            current_x = 0;
            last_y = 0;
            current_y = 0;
            last_z = 0;
            current_z = 0;
        }

        // var currentL = parseInt($prop.css('left'), 10);
        // var currentT = parseInt($prop.css('top'), 10);

        // if (currentL < 0 || currentL + propW > windowW || currentT < 0 || currentT + propH > windowH ) {
        //     $prop.hide('slow');
        // }
    });

    /* 判断三击 */
    $gameContainer.tap(function() {
        if (clickCount < 2) {
            if (clickTimer) {
                clearTimeout(clickTimer);
            }

            clickCount++;
            clickTimer = setTimeout(function() {
                clickCount = 0;
            }, 500);

        } else if (clickCount === 2) {
            clickCount = 0;
            clearTimeout(clickTimer);
            $file.trigger('click');
        }
    });

});


// 改变方向运动的时候加一个延迟
// 运动会跳，多加水平面以下的运动判断中
// 需要看的文档 https://github.com/ajfisher/deviceapi-normaliser#readme
