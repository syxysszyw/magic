$(function(){

    var $bgContainer = $("#bg-container");
    var $file = $("#file");
    var $prop = $('.prop');
    var $btn = $('.weui_uploader_input_wrp');

    function setBg(container, result) {
        /* 用img */
        $bgContainer.html('<img src="' + result +'" alt="" />');  

        /* 用background-image */
        // container.css({
        //     'background-image': 'url(' + result + ')'
        // })
    }

    if (localStorage.defaultBg) {
        $btn.hide();
        setBg($bgContainer, localStorage.defaultBg)
    } 

    /* 读文件 */
    var isPropUndefined = true;

    $file.on('change', function(){
        readAsDataURL();
        // readAsBinaryString();
    })

    function readAsDataURL(){  
        //检验是否为图像文件  
        var file = $file[0].files[0];  
        if(!/image\/\w+/.test(file.type)){  
            alert("看清楚，这个需要图片！");  
            return false;  
        }  
        var reader = new FileReader();  


        //将文件以Data URL形式读入页面  
        reader.readAsDataURL(file);  
        reader.onload = function(e){  

            // console.log(this.result)
            // console.log(convertImgDataToBlob(this.result))
   
            setBg($bgContainer, this.result);


            // localStorage.defaultBg = this.result;
            localStorage.setItem('defaultBg', this.result);

            $btn.hide();
        }  
    } 

    function readAsBinaryString(){
        var file = $file[0].files[0];
        if(!/image\/\w+/.test(file.type)){  
            alert("只能选择图片当背景哦");  
            return false;  
        }  
        var reader = new FileReader();  

        reader.readAsBinaryString(file);  

        reader.onload = function(e) {
            // console.log(this.result)
        }
    }


    function convertImgDataToBlob (base64Data) {
        var format = "image/jpeg";
        var base64 = base64Data;
        var code = window.atob(base64.split(",")[1]);
        var aBuffer = new window.ArrayBuffer(code.length);
        var uBuffer = new window.Uint8Array(aBuffer);
        for(var i = 0; i < code.length; i++){
            uBuffer[i] = code.charCodeAt(i) & 0xff ;
        }
        console.info([aBuffer]);
        console.info(uBuffer);
        console.info(uBuffer.buffer);
        console.info(uBuffer.buffer==aBuffer); //true

        var blob=null;
        try{
            blob = new Blob([uBuffer], {type : format});
        }
        catch(e){
            window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;
            if(e.name == 'TypeError' && window.BlobBuilder){
                var bb = new window.BlobBuilder();
                bb.append(uBuffer.buffer);
                blob = bb.getBlob("image/jpeg");

            }
            else if(e.name == "InvalidStateError"){
                blob = new Blob([aBuffer], {type : format});
            }
            else{

            }
        }
        alert(blob.size);
        return blob;
       
    };

    /* 摇一摇 */
    /* http://www.360doc.com/content/13/0222/23/11625720_267350198.shtml */
    var last_update = 0;
    var x = y = z = last_x = last_y = last_z = 0;

    // 一开始$prop隐藏，此时无法获取 $prop 的宽和高，所以应该在 $prop show()的时候获取宽高值。

    var propRealW, 
        propRealH;

    getPropSize();
    // 获取一张照片的size  http://q.cnblogs.com/q/66161/
    function getPropSize() {
        var img = new Image;    

        img.onload = function() {
            propRealW = img.width;
            propRealH = img.height;

            console.log(propRealW);
            console.log(propRealH);
        };    

        img.src = "../prop.png";

    }

    var propW = parseInt($('.prop img').css('width'), 10);
    var propH = propRealH * propW / propRealW;

    console.log(propW);
    console.log(propH);


    var propHalfW;
    var propHalfH;

    function init() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        } else {
            alert('not support mobile event');
        }
    }

    function deviceMotionHandler(eventData) {
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime - last_update) > 100) {
            var diffTime = curTime - last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
 
            if (speed > 2000 && $prop.css('display') !== 'block') {
                // alert("摇动了");
                $prop.show().css({
                    'top': '0px',
                    'left': '0px'
                });

                $(window).on('deviceorientation', handleOrientation);
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    }
    init();

    /* 拖动 */
    var propL = parseInt($prop.css('left'));
    var propT = parseInt($prop.css('top'));

    var windowW = $(window).width();
    var windowH = $(window).height();
    
    var maxOffsetL = windowW - propW;
    var maxOffsetT = windowH - propH;

    var propOffsetL, propOffsetT;

    $prop.on('touchstart', function(event) {
         //    console.log(event);
         //    console.log('event.target.x' + event.target.x);
        // console.log('event.target.y' + event.target.y);

        $(window).off('deviceorientation', handleOrientation);

        if (isPropUndefined) {
            // propW = $prop.width();
            // propH = $prop.height();
            propHalfW = $prop.width()/2;
            propHalfH = $prop.height()/2;


            isPropUndefined = !isPropUndefined;
        }

        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];

            propOffsetL = touch.pageX - $prop.offset().left;
            propOffsetT = touch.pageY - $prop.offset().top;
        }

        // console.log('propOffsetL', propOffsetL);
        // console.log('propOffsetT', propOffsetT);
        
    }).on('touchmove', function(event) {
        // console.log('touches', event.touches);
        // console.log('targetTouches', event.targetTouches);
        // console.log('changeTouches', event.changeTouches);


        // console.log('propOffsetL', propOffsetL);
        // console.log('propOffsetT', propOffsetT);

        event.preventDefault();//阻止其他事件

        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {

            var touch = event.targetTouches[0];  // 把元素放在手指所在的位置

            propL = touch.pageX - propOffsetL;
            propT = touch.pageY - propOffsetT;

            $prop.css({
                // 'left': touch.pageX - propOffsetL + 'px',
                // 'top': touch.pageY - propOffsetT + 'px'
                'left': propL + 'px',
                'top': propT + 'px'
                
            })
       }

    }).on('touchend', function(event) {

        // 这个时候已经没有 event.targetTouches了

        $(window).on('deviceorientation', handleOrientation);
        // alert('propL:' + propL);
        // alert('propT:' + propT);

        var leaveTouchPageX = propOffsetL + $prop.offset().left;
        var leaveTouchPageY = propOffsetT + $prop.offset().top;        

        // 边界判断

        // 1. 当 touchend 的时候手指已经到达屏幕边缘，再让图片消失
        if(leaveTouchPageX <= 20 || leaveTouchPageX >= windowW - 20 || leaveTouchPageY <= 20 || leaveTouchPageY >= windowH - 20) {
            $prop.hide('slow');
        }

        // var currentL = parseInt($prop.css('left'), 10);
        // var currentT = parseInt($prop.css('top'), 10);

        // if(currentL < 0 || currentL + propW > windowW || currentT < 0 || currentT + propH > windowH ) {

        //     $prop.hide('slow');
        // }


    });



    /* orientation */

    // $(window).on('deviceorientation', handleOrientation);
    var pvx = 0;
    var pvy = 0;
    
    // var to ;
    window.requestAnimationFrame = window.requestAnimationFrame ||
     window.mozRequestAnimationFrame || 
     window.webkitRequestAnimationFrame || 
     window.msRequestAnimationFrame;

    function handleOrientation(evt) {

        // currentBeta = evt.beta;
        // currentGamma = evt.gamma;

        var beta = evt.beta;   // [-180, 180]
        var gamma = evt.gamma;   // [-90, 90]

        // beta   0- 90   往下掉; -90-0  往上掉
        // gamma  0-90   往右掉; -90-0  往左掉


        // 前提是用户允许横竖屏切换
        // window.orientation == 90  向左横屏
        // window.orientation == -90 向右横屏

        requestAnimationFrame(function() {
            render();
            update(evt);
        });
    }
    function render() {

        $prop.css({
            'left': propL + 'px',
            'top': propT + 'px'
        })
    }

    // gamma  向左转一圈 0~-90, 90~0, 0~-90，90~0 会有一个“-90 到 90” 的瞬间变化，一直是在减小的过程 
    // 整体加90  向左转一圈 90~0, 180~90, 90~0，180~90 会有一个“0 到 180” 的瞬间变化，一直是在减小的过程 

    // gamma  向右转一圈 0~90, -90~0, 0~90，-90~0 会有一个“180 到 0” 的瞬间变化，一直是在增大的过程
    // 整体加90  向右转一圈 90~180, 0~90, 90~180，0~90 会有一个“90 到 -90” 的瞬间变化，一直是在增大的过程

    var lastBeta = 0,
        currentBeta = 0,
        lastGamma = 0,
        currentGamma = 0;


    function update(evt) {

        currentBeta = evt.beta;
        currentGamma = evt.gamma;


        // 判断突变 如果
        if(Math.abs(currentGamma - lastGamma) >= 80) {
            currentGamma = 0 - currentGamma;  
            $('.consoledataa').html(currentGamma);
        }

        // if(Math.abs(currentGamma - lastGamma) <= 2 || Math.abs(currentBeta - lastBeta) <= 2) {
        //     return;
        // }

        // 判断偏移的幅度，如果相差太小则不认为是用户希望抖动
        // if(currentGamma > lastGamma)


        var absBeta = Math.abs(currentBeta) <= 90 ? Math.abs(currentBeta) : 180 - Math.abs(currentBeta);
        // var absGamma = Math.abs(currentGamma);
    
        var betaDirection = currentBeta >= 0 ? 1 : -1;
        // var gammaDirection = currentGamma > lastGamma ? 1 : -1;

        pvy = absBeta / 90 * betaDirection * 30;
        // pvx = absGamma / 90 * gammaDirection * 20;
        pvx = currentGamma / 90 * 30;

        propT += pvy;
        propL += pvx;
        
        if(propL < 0 ){
            propL = 0;
        }else if(propL > maxOffsetL) {
            propL = maxOffsetL;
        }

        if(propT < 0 ){
            propT = 0;
        }else if(propT > maxOffsetT) {
            propT = maxOffsetT;
        }

        lastBeta = currentBeta;
        // if(Math.abs(currentGamma - lastGamma) >= 90) {
        //     lastGamma = -currentGamma
        // }else {
            lastGamma = currentGamma;
        // }

        $('.consoledatab').html(lastGamma);

    }



    /* 全屏 */
    function launchFullscreen(element) {
      if(element.requestFullscreen) {
        element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
    // 启动全屏!
    launchFullscreen(document.documentElement); // 整个网页
    launchFullscreen(document.getElementById('bg-container')); // 某个页面元素
    /* Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture. */

    /* 三击 */
    var count = 0, timer;

    function threeClick() {
        $file.trigger('click');
    }
    $bgContainer.tap(function() {
        if(count < 2){
            if(timer){
                clearTimeout(timer);
            }
            count ++;
            timer = setTimeout(function(){
                count = 0;
            }, 500);
        }else if(count === 2){
            count = 0;
            clearTimeout(timer);
            threeClick();
        }
    })

})


// 改变方向运动的时候加一个延迟
// 运动会跳，多加水平面以下的运动判断中