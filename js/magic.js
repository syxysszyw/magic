/* global $, alert */
'use strict';

$(function() {

    var $gameContainer = $("#game-container");
    var $file = $("#file");
    var $prop = $('.prop');
    var $propImg = $('.prop img');
    var $uploadBtn = $('.weui_uploader_input_wrp');

    /* 摇一摇 */
    var last_update = 0;
    var current_x = 0,
        current_y = 0,
        current_z = 0,
        last_x = 0,
        last_y = 0,
        last_z = 0;
    var limitedSpead = 2000;

    /* prop相关 */
    var propW, propH;
    // 设置可选的道具列表
    var propImages = ['money', 'coin', 'clip'];

    var selectedPropName;
    var propPath;

    /* 三击 */
    var clickCount = 0,
        clickTimer;

    /* 拖动 */
    var propLeftCornerLeft = 0,
        propLeftCornerTop = 0;

    // window
    var windowW = $(window).width(),
        windowH = $(window).height(),
        windowWidthHeightRatio = windowW / windowH;

    var scrollWidth = document.body.scrollWidth;     // 375
    var scrollHeight = document.body.scrollHeight;   // 559
    var raf;
    var sto;

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

    var times = 0;
    var target = {
        x : 0,
        y : 0
    }

    var useImgAsBackground = true;

    var clickEvent = (document.ontouchstart!==null) ? 'click' : 'touchstart';

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
    }

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
            // $uploadBtn.remove();
            $uploadBtn.hide();

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
                    $gameContainer.find('img').css({
                        'height': 'auto',
                        'width': '100%'
                    });
                } else {
                    // 缩放高度
                    // 缩放高度
                    // 缩放高度
                    localStorage.setItem('strechDirection', 0);
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
            propW = parseInt($propImg.css('width'), 10);
            propH = propRealH * propW / propRealW;
            maxOffsetL = windowW - propW;
            maxOffsetT = windowH - propH;
        };

        img.src = imgPath;
    }

    // 每时每刻都在进行
    function deviceMotionHandler(eventData) {
        var acceleration = eventData.accelerationIncludingGravity;
        var currentTime = new Date().getTime();
        if ((currentTime - last_update) > 100) {
            if($uploadBtn.css('display') !== 'block') {
                var diffTime = currentTime - last_update;
                last_update = currentTime;
                current_x = acceleration.x;
                current_y = acceleration.y;
                current_z = acceleration.z;
                // var speed = Math.abs(current_x + current_y + current_z - last_x - last_y - last_z) / diffTime * 10000;
                // var speed = Math.abs(current_x - last_x)  / diffTime * 10000 || Math.abs(current_y - last_y)  / diffTime * 10000 || Math.abs(current_z - last_z)  / diffTime * 10000 > spead;

                // if(Math.abs(current_x - last_x)  / diffTime * 10000 > spead || Math.abs(current_y - last_y)  / diffTime * 10000 > spead || Math.abs(current_z - last_z)  / diffTime * 10000 > spead) {
                //     console.log('yes');
                //     if ($prop.css('display') !== 'block') {
                //         $prop.show().css({
                //             '-webkit-transform': 'translate3d(0, 0, 0)',
                //             'transform': 'translate3d(0, 0, 0)'
                //         });
                //         propVx = 0;
                //         propVy = 0;
                //         $(window).on('deviceorientation', handleOrientation);
                //     }
                // }
                if (Math.abs(current_x - last_x)  / diffTime * 10000 > limitedSpead || Math.abs(current_y - last_y)  / diffTime * 10000 > limitedSpead || Math.abs(current_z - last_z)  / diffTime * 10000 > limitedSpead ) {
                    if($prop.css('display') !== 'block') {
                        // console.log(speed);
                        // alert("摇到了");
                        // console.log('current_x - last_x', (current_x - last_x) / diffTime * 10000);
                        // console.log('current_y - last_y', (current_y - last_y) / diffTime * 10000);
                        // console.log('current_z - last_z', (current_z - last_z) / diffTime * 10000);
                        
                        update();
                        propVx = 0;
                        propVy = 0;

                        $prop.show().css({
                            '-webkit-transform': 'translate3d(0, 0, 0)',
                            'transform': 'translate3d(0, 0, 0)'
                        });

                        // console.log(propVx);
                        // console.log(propVy);

                        $(window).on('deviceorientation', handleOrientation);
                    }
                }
                last_x = current_x;
                last_y = current_y;
                last_z = current_z;
            }
            
        }
    }

    var count = 0;
    function handleOrientation(evt) {
        target = {
            x: evt.beta,
            y: evt.gamma
        }
    }


    /* gamma  向左转一圈 0~-90, 90~0, 0~-90，90~0 会有一个“-90 到 90” 的瞬间变化，一直是在减小的过程 
       整体加90  向左转一圈 90~0, 180~90, 90~0，180~90 会有一个“0 到 180” 的瞬间变化，一直是在减小的过程 

       gamma  向右转一圈 0~90, -90~0, 0~90，-90~0 会有一个“180 到 0” 的瞬间变化，一直是在增大的过程
       整体加90  向右转一圈 90~180, 0~90, 90~180，0~90 会有一个“90 到 -90” 的瞬间变化，一直是在增大的过程  */
    var total = 0;
    function update(evt) {

        currentBeta = target.x; // [-180, 180]
        currentGamma = target.y; // [-90, 90]

        var absBeta = Math.abs(currentBeta) <= 90 ? Math.abs(currentBeta) : 180 - Math.abs(currentBeta);
        var betaDirection = currentBeta >= 0 ? 1 : -1;

        // 判断突变
        if (Math.abs(currentGamma - lastGamma) >= 80) {
            currentGamma = 0 - currentGamma;
            // $('.consoledataa').html(currentGamma);
        }

        propVy = absBeta / 90 * betaDirection * 40;
        propVx = currentGamma / 90 * 40;

        propLeftCornerTop += propVy;
        propLeftCornerLeft += propVx;

        if (propLeftCornerLeft < 0) {
            propLeftCornerLeft = 0;
            // 速度减为0
            propVx = 0;

        } else if (propLeftCornerLeft > maxOffsetL) {
            propLeftCornerLeft = maxOffsetL;
            // 速度减为0
            propVx = 0;
        }

        if (propLeftCornerTop < 0) {
            propLeftCornerTop = 0;
            // 速度减为0
            propVy = 0;
        } else if (propLeftCornerTop > maxOffsetT) {
            propLeftCornerTop = maxOffsetT;
            // 速度减为0
            propVy = 0;
        }


        $prop.css({
            '-webkit-transform': 'translate3d('+ propLeftCornerLeft + 'px, '+ propLeftCornerTop + 'px, 0)',
            'transform': 'translate3d('+ propLeftCornerLeft + 'px, '+ propLeftCornerTop + 'px, 0)'
        });


        lastBeta = currentBeta;
        lastGamma = currentGamma;


        raf = requestAnimationFrame(update);

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

    $('.intro .close, .know').tap(function() {
        $('.intro').hide();
    })


    $propImg.on('clickEvent', function(event) {
        event.preventDefault();
    })

    if (localStorage.defaultBg) {
        $uploadBtn.hide();
        $('.intro').hide();
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


    selectedPropName = localStorage.getItem('propName') ? localStorage.getItem('propName') : propImages[0];
    propPath = './images/' + selectedPropName + '.png';
    getPropSize(propPath);

    // var movecount;
    // var lastmovetime = 0,
    //     curmovetime = 0;

    var lastTouchX, lastTouchY;
    var boundaryGap = 50;
    /* 拖动 */
    $prop.on('touchstart', function(event) {
        // movecount = 0 ;
        $(window).off('deviceorientation');
        cancelAnimationFrame(raf);

        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];

            // 第一次touch的时候要给 lastTouchX, lastTouchY 赋值，以防第一次 touch过程 没有touchmove 两者为0，然后点一下就会消失
            // lastTouchX = touch.pageX;
            // lastTouchY = touch.pageY;

            propOffsetL = touch.pageX - $prop.offset().left;
            propOffsetT = touch.pageY - $prop.offset().top;
        }

    }).on('touchmove', function(event) {
        event.preventDefault();
        console.log('touchmove-gettime', new Date().getTime());
        // 统计touchmove的次数，如果抽钱抽得很快，次数小（2-3），速度慢则次数多.
        // movecount++;

        // 经测试，touchmove的触发频率大约是14-20（约16/17ms）执行一次
        // 不同浏览器上 touchmove 事件的触发频率并不相同。这个触发频率还和硬件设备的性能有关。因此决不能让程序的运作依赖于某个特定的触发频率（via: https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent）
        // curmovetime = new Date().getTime();
        // console.log(curmovetime - lastmovetime);

        $(window).off('deviceorientation');
        cancelAnimationFrame(raf);
        // clearTimeout(sto);
        
        event.preventDefault(); //阻止其他事件
        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {
            // console.log('total', total++);
            var touch = event.targetTouches[0]; // 把元素放在手指所在的位置

            // lastTouchX = touch.pageX;
            // lastTouchY = touch.pageY;

            propLeftCornerLeft = touch.pageX - propOffsetL;
            propLeftCornerTop = touch.pageY - propOffsetT;

            $prop.css({
                '-webkit-transform': 'translate3d('+ propLeftCornerLeft + 'px, '+ propLeftCornerTop + 'px, 0)',
                'transform': 'translate3d('+ propLeftCornerLeft + 'px, '+ propLeftCornerTop + 'px, 0)'
            });

            if(touch.pageY <= 20){
                $prop.hide('slow');
                // 重置相关变量
                $(window).off('deviceorientation');
                cancelAnimationFrame(raf);
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
        }
        // lastmovetime = curmovetime;

    // 当一个触点被用户从触摸平面上移除（当用户将一个手指离开触摸平面）时触发。当触点移出触摸平面的边界时也将触发。例如用户将手指划出屏幕边缘。
    }).on('touchend touchcancel touchleave', function(event) {

        lastTouchX = event.pageX;
        lastTouchY = event.pageY;

        // console.log('touchend-gettime', new Date().getTime());
        // console.log('touchend-lastTouchX', lastTouchX);
        // console.log('touchend-lastTouchY', lastTouchY);

        $('#ball').css({
            '-webkit-transform': 'translate3d('+ lastTouchX + 'px, '+ lastTouchY + 'px, 0)',
            'transform': 'translate3d('+ lastTouchX + 'px, '+ lastTouchY + 'px, 0)'
        });

        if (lastTouchX <= boundaryGap || lastTouchX >= windowW - boundaryGap || lastTouchY <= boundaryGap || lastTouchY >= windowH - boundaryGap) {

            $prop.hide();
            // 重置相关变量
            $(window).off('deviceorientation');
            cancelAnimationFrame(raf);
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
        
        $(window).on('deviceorientation', handleOrientation);
        raf = requestAnimationFrame(update);

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
            // $file.trigger('clickEvent');
            // console.log(3);
            return $file.click();
        }
    });


    // var lasttouchmove = null;
    // $gameContainer.on('touchstart', function(evt) {
    //     console.log('touchstart');
    // }).on('touchmove', function(evt) {
    //     lasttouchmove = evt;
    //     console.log('touchmove', lasttouchmove);
    // }).on('touchend', function(evt) {
    //     console.log('lasttouchmove', lasttouchmove);
    //     // console.log('lasttouchmove', lasttouchmove);
    //     console.log('touchend', evt);
    //     console.log('lasttouchmove.pageX', lasttouchmove.pageX);
    //     console.log('lasttouchmove.changedTouches[0].pageX', lasttouchmove.changedTouches[0].pageX);
    //     console.log('evt.pageX', evt.pageX);
    //     console.log('evt.changedTouches[0].pageX', evt.changedTouches[0].pageX);
    // }).on('touchleave', function(evt) {
    //     console.log('touchleave');
    // }).on('touchenter', function(evt) {
    //     console.log('touchenter');
    // }).on('touchcancel', function(evt) {
    //     console.log('touchcancel');
    // });





    var storedPropVx, storedPropVy;
    $prop.tap(function() {
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

            // 停止运动
            $(window).off('deviceorientation');
            cancelAnimationFrame(raf);

            storedPropVx = propVx;
            storedPropVy = propVy;

            propVx = 0;
            propVy = 0;
            lastBeta = 0;
            currentBeta = 0;
            lastGamma = 0;
            currentGamma = 0;

            // 出现选择道具模块
            $('.change-prop').addClass('open');
        }
    });

    var $changeProp = $('.change')

    // 渲染prop-name列表
    function initOptionalPropsList(propImages){

        var activeProp = localStorage.getItem('propName') ? localStorage.getItem('propName') : propImages[0];
        
        var propNamesStr = '';
        var propThumbnailsStr = '';

        propImages.forEach(function(data) {
            if(data === activeProp) {
                // $('<li>').html(data).addClass('active').appendTo($('.prop-name'));
                propNamesStr += '<li class="active">' + data + '</li>'
                propThumbnailsStr += '<li class="prop-thumbnail active ' + data + '"><img src="./images/' + data + '.png"></li>';
            }else {
                // $('<li>').html(data).appendTo($('.prop-name'));
                propNamesStr += '<li>' + data + '</li>'
                propThumbnailsStr += '<li class="prop-thumbnail ' + data + '"><img src="./images/' + data + '.png"></li>';
            }
        })

        $(propNamesStr).appendTo($('.prop-name'));
        $(propThumbnailsStr).appendTo($('.prop-thumbnails'));
        
        $propImg.removeClass().addClass(activeProp).prop('src', './images/'+ activeProp + '.png');
    }

    initOptionalPropsList(propImages);

    $('.prop-name').on(clickEvent, function(event) {
        var $target = $(event.target);
        $target.addClass('active').siblings().removeClass('active');
        selectedPropName = $target.html();
        $('.prop-thumbnail.' + selectedPropName).addClass('active').siblings().removeClass('active');
    });

    $('.change-prop').find('.ok').on(clickEvent, function() {
        $('.change-prop').removeClass('open');
        $('.change-mask').hide();

        selectedPropName = $('.prop-name .active').html();
        localStorage.setItem('propName', selectedPropName);
        $propImg.removeClass().addClass(selectedPropName);
        $propImg.prop('src', './images/'+ selectedPropName + '.png');
        propPath = './images/' + selectedPropName + '.png';
        getPropSize(propPath);

        // 恢复道具的运动
        propVx = storedPropVx;
        propVy = storedPropVy;
        $(window).on('deviceorientation', handleOrientation);
        raf = requestAnimationFrame(update);
    })

    $('.change-prop').find('.cancel').on(clickEvent, function() {
        $('.change-prop').removeClass('open');
        $('.change-mask').hide();

        // 恢复道具的运动
        propVx = storedPropVx;
        propVy = storedPropVy;
        $(window).on('deviceorientation', handleOrientation);
        raf = requestAnimationFrame(update);
    })
});


// 改变方向运动的时候加一个延迟
// 运动会跳，多加水平面以下的运动判断中
// 需要看的文档 https://github.com/ajfisher/deviceapi-normaliser#readme
