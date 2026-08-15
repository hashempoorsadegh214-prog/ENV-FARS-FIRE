/* =========================
   MAIN APPLICATION
========================= */


/* =========================
   INITIALIZE MAP
========================= */

async function initializeMap(){

    createMap();

    await loadBoundary();

}


/* =========================
   INITIALIZE AREAS
========================= */

async function initializeAreas(){

    await loadProtectedAreas();

    await loadHuntingAreas();

    initAreaControls();

}


/* =========================
   INITIALIZE FIRE DATA
========================= */

async function initializeFires(){

    await loadFallbackCSV();

    initFireControls();

}


/* =========================
   INITIALIZE ARCHIVE
========================= */

async function initializeArchive(){

    await loadArchiveIndex();

    initArchiveControls();

}


/* =========================
   INITIALIZE STATUS
========================= */

async function initializeStatus(){

    await loadSystemUpdate();

    startStatusClock();

}


/* =========================
   INITIALIZE OTHER BUTTONS
========================= */

function initializeButtons(){

    /*
       Excel
    */

    initExcelButton();


    /*
       Screenshot
    */

    initReportButton();

}


/* =========================
   INITIAL DATA DISPLAY
========================= */

function initializeInitialDisplay(){

    /*
       اگر آرشیو روزانه وجود داشته باشد،
       آخرین روز به صورت پیش‌فرض نمایش داده شود.
    */

    if(
        archiveState.dates.length > 0
    ){

        showLatestArchive();

        return;

    }


    /*
       اگر آرشیو موجود نبود،
       داده جاری نمایش داده شود.
    */

    refreshFireDisplay();

}


/* =========================
   INITIALIZE APPLICATION
========================= */

async function initializeApplication(){

    try{

        /*
           1. نقشه
        */

        await initializeMap();


        /*
           2. مناطق
        */

        await initializeAreas();


        /*
           3. داده حریق
        */

        await initializeFires();


        /*
           4. آرشیو
        */

        await initializeArchive();


        /*
           5. وضعیت سامانه
        */

        await initializeStatus();


        /*
           6. دکمه‌ها
        */

        initializeButtons();


        /*
           7. نمایش اولیه
        */

        initializeInitialDisplay();


        /*
           8. وضعیت شب/روز
        */

        /*
           این بخش بعد از ساخته شدن نقشه اجرا می‌شود.
        */

        if(
            typeof restoreNightMode ===
            "function"
        ){

            restoreNightMode();

        }


        /*
           اندازه نقشه
        */

        setTimeout(
            () => {

                if(
                    typeof refreshMapSize ===
                    "function"
                ){

                    refreshMapSize();

                }

            },
            100
        );


        console.log(
            "سامانه پایش و مدیریت داده‌های حریق با موفقیت راه‌اندازی شد."
        );


    }catch(error){

        console.error(
            "خطا در راه‌اندازی سامانه:",
            error
        );


        alert(
            "در بارگذاری سامانه خطایی رخ داد. لطفاً صفحه را دوباره باز کنید."
        );

    }

}


/* =========================
   START APPLICATION
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);
