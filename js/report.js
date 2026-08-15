/* =========================
   REPORT STATE
========================= */

const reportState = {

    capturing:
        false

};


/* =========================
   LOAD LOGO
========================= */

function loadReportLogo(){

    return new Promise(
        (resolve,reject) => {

            const img =
                new Image();


            img.onload =
                () => {

                    resolve(
                        img
                    );

                };


            img.onerror =
                () => {

                    reject(
                        new Error(
                            "logo.png not found"
                        )
                    );

                };


            img.src =
                "logo.png?v=" +
                Date.now();

        }
    );

}


/* =========================
   REPORT MODE
========================= */

function getReportMode(){

    if(
        typeof isArchiveMode ===
        "function"
        &&
        isArchiveMode()
    ){

        return "آرشیو روزانه";

    }


    if(
        fireState.mode ===
        "24h"
    ){

        return "۲۴ ساعت گذشته";

    }


    return "۵ روز گذشته";

}


/* =========================
   REPORT FILTER
========================= */

function getReportAreaFilter(){

    if(
        areaState.filter ===
        "protected"
    ){

        return "مناطق چهارگانه محیط زیست";

    }


    if(
        areaState.filter ===
        "hunting"
    ){

        return "مناطق شکار ممنوع";

    }


    return "بدون فیلتر مکانی";

}


/* =========================
   CREATE REPORT HEADER
========================= */

function createReportCanvas(
    screenshot,
    logo
){

    const headerHeight =
        92;


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        screenshot.width;


    canvas.height =
        screenshot.height +
        headerHeight;


    const ctx =
        canvas.getContext(
            "2d"
        );


    /*
       زمینه
    */

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       هدر قرمز
    */

    ctx.fillStyle =
        "#b71c1c";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        headerHeight
    );


    /*
       لوگو
    */

    if(
        logo
    ){

        const size =
            66;


        const x =
            18;


        const y =
            (
                headerHeight -
                size
            ) /
            2;


        ctx.drawImage(
            logo,
            x,
            y,
            size,
            size
        );

    }


    /*
       متن هدر
    */

    ctx.direction =
        "rtl";


    ctx.textAlign =
        "right";


    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 25px Tahoma";


    ctx.fillText(
        "سامانه پایش و مدیریت داده‌های حریق",
        canvas.width - 22,
        35
    );


    /*
       اطلاعات گزارش
    */

    ctx.font =
        "13px Tahoma";


    ctx.fillText(
        "گزارش تصویری نقشه | "
        +
        getReportMode()
        +
        " | "
        +
        getReportAreaFilter(),
        canvas.width - 22,
        62
    );


    /*
       خود Screenshot
    */

    ctx.drawImage(
        screenshot,
        0,
        headerHeight
    );


    return canvas;

}


/* =========================
   CAPTURE CURRENT TAB
========================= */

async function captureCurrentTab(){

    if(
        !navigator.mediaDevices
        ||
        !navigator.mediaDevices.getDisplayMedia
    ){

        throw new Error(
            "Screen capture is not supported"
        );

    }


    const stream =
        await navigator.mediaDevices
            .getDisplayMedia(
                {
                    video:true,
                    audio:false
                }
            );


    try{

        const video =
            document.createElement(
                "video"
            );


        video.srcObject =
            stream;


        video.muted =
            true;


        await video.play();


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    300
                )
        );


        const width =
            video.videoWidth;


        const height =
            video.videoHeight;


        if(
            !width ||
            !height
        ){

            throw new Error(
                "Screenshot dimensions are invalid"
            );

        }


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            width;


        canvas.height =
            height;


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.drawImage(
            video,
            0,
            0,
            width,
            height
        );


        return canvas;

    }finally{

        stream
            .getTracks()
            .forEach(
                track => {

                    track.stop();

                }
            );

    }

}


/* =========================
   DOWNLOAD REPORT
========================= */

function downloadReport(
    canvas
){

    const link =
        document.createElement(
            "a"
        );


    const date =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    link.download =
        "fire_report_" +
        date +
        ".png";


    link.href =
        canvas.toDataURL(
            "image/png"
        );


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();

}


/* =========================
   CREATE REPORT
========================= */

async function createRegionReport(){

    if(
        reportState.capturing
    ){

        return;

    }


    reportState.capturing =
        true;


    const button =
        $("reportBtn");


    if(
        button
    ){

        button.disabled =
            true;

        button.style.opacity =
            "0.6";

    }


    let logo =
        null;


    try{

        /*
           لوگو
        */

        try{

            logo =
                await loadReportLogo();

        }catch(error){

            logo =
                null;

        }


        /*
           Screenshot از تب فعلی
        */

        const screenshot =
            await captureCurrentTab();


        /*
           ساخت گزارش نهایی
        */

        const reportCanvas =
            createReportCanvas(
                screenshot,
                logo
            );


        /*
           دانلود
        */

        downloadReport(
            reportCanvas
        );


    }catch(error){

        console.error(
            "Report error:",
            error
        );


        alert(
            "تهیه گزارش تصویری انجام نشد."
        );

    }finally{

        reportState.capturing =
            false;


        if(
            button
        ){

            button.disabled =
                false;

            button.style.opacity =
                "1";

        }

    }

}


/* =========================
   INIT REPORT BUTTON
========================= */

function initReportButton(){

    const button =
        $("reportBtn");


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        createRegionReport
    );

}
