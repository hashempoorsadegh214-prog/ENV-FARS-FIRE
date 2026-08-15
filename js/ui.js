/* =========================
   UI STATE
========================= */

const uiState = {

    night:
        false

};


/* =========================
   NIGHT MODE
========================= */

function setNightMode(
    enabled
){

    uiState.night =
        Boolean(
            enabled
        );


    document.body
        .classList
        .toggle(
            "night",
            uiState.night
        );


    /*
       تغییر لایه نقشه
    */

    if(
        typeof toggleMapNight ===
        "function"
    ){

        toggleMapNight(
            uiState.night
        );

    }


    /*
       تغییر آیکن
    */

    const nightButton =
        $("nightBtn");


    if(
        nightButton
    ){

        nightButton.textContent =
            uiState.night
            ?
            "☀️"
            :
            "🌙";

    }


    /*
       ذخیره وضعیت
    */

    localStorage.setItem(
        "fars-night",
        uiState.night
        ?
        "1"
        :
        "0"
    );

}


/* =========================
   TOGGLE NIGHT
========================= */

function toggleNightMode(){

    setNightMode(
        !uiState.night
    );

}


/* =========================
   RESTORE NIGHT MODE
========================= */

function restoreNightMode(){

    const saved =
        localStorage.getItem(
            "fars-night"
        );


    setNightMode(
        saved === "1"
    );

}


/* =========================
   REFRESH PAGE
========================= */

function refreshApplication(){

    window.location.reload();

}


/* =========================
   HEADER BUTTONS
========================= */

function initHeaderButtons(){

    /*
       گزارش تصویری
    */

    const reportButton =
        $("reportBtn");


    if(
        reportButton
    ){

        reportButton.addEventListener(
            "click",
            () => {

                if(
                    typeof createRegionReport ===
                    "function"
                ){

                    createRegionReport();

                }

            }
        );

    }


    /*
       Excel
    */

    const excelButton =
        $("excelBtn");


    if(
        excelButton
    ){

        excelButton.addEventListener(
            "click",
            () => {

                if(
                    typeof exportExcel ===
                    "function"
                ){

                    exportExcel();

                }

            }
        );

    }


    /*
       حالت شب
    */

    const nightButton =
        $("nightBtn");


    if(
        nightButton
    ){

        nightButton.addEventListener(
            "click",
            toggleNightMode
        );

    }


    /*
       بازخوانی
    */

    const refreshButton =
        $("refreshBtn");


    if(
        refreshButton
    ){

        refreshButton.addEventListener(
            "click",
            refreshApplication
        );

    }

}


/* =========================
   INIT UI
========================= */

function initUI(){

    initHeaderButtons();

    restoreNightMode();

}
