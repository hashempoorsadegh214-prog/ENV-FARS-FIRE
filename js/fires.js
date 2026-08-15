/* =========================
   FIRE STATE
========================= */

const fireState = {

    fires: [],

    archiveHeaders: [],

    archiveCache: {},

    mode: "24h"

};


/* =========================
   SENSOR
========================= */

function fireSensor(
    fire
){

    return getSensor(
        fire
    );

}


/* =========================
   LOAD CURRENT CSV
========================= */

async function loadFallbackCSV(){

    try{

        const parsed =
            parseCSV(
                await getText(
                    CONFIG.fallbackCsv
                )
            );


        fireState.archiveHeaders =
            parsed.headers.slice();


        fireState.fires =
            parsed.rows.slice();


    }catch(error){

        console.error(
            "خطا در fires.csv:",
            error
        );

        fireState.fires =
            [];

    }

}


/* =========================
   LOAD ONE ARCHIVE DATE
========================= */

async function loadArchiveDate(
    date
){

    if(
        !date
    ){

        return [];

    }


    /*
       اگر قبلاً همین روز خوانده شده،
       دوباره از GitHub دانلود نکن.
    */

    if(
        Object.prototype.hasOwnProperty.call(
            fireState.archiveCache,
            date
        )
    ){

        return fireState.archiveCache[
            date
        ];

    }


    try{

        const parsed =
            parseCSV(
                await getText(
                    "archive/" +
                    date +
                    ".csv"
                )
            );


        /*
           تاریخ آرشیو را
           به هر رکورد اضافه می‌کنیم.
        */

        parsed.rows.forEach(
            row => {

                row.archive_date =
                    date;

            }
        );


        if(
            fireState.archiveHeaders.length === 0
        ){

            fireState.archiveHeaders =
                parsed.headers.slice();

        }


        fireState.archiveCache[
            date
        ] =
            parsed.rows;


        return parsed.rows;


    }catch(error){

        console.warn(
            "آرشیو این تاریخ پیدا نشد:",
            date,
            error
        );


        fireState.archiveCache[
            date
        ] =
            [];


        return [];

    }

}


/* =========================
   SET FIRE DATA
========================= */

function setFireData(
    rows,
    headers = []
){

    fireState.fires =
        Array.isArray(rows)
        ?
        rows.slice()
        :
        [];


    if(
        headers.length
    ){

        fireState.archiveHeaders =
            headers.slice();

    }

}


/* =========================
   GET ALL CURRENT FIRES
========================= */

function getAllFires(){

    return fireState.fires;

}


/* =========================
   TIME FILTER
========================= */

function getTimeFilteredFires(){

    const now =
        new Date();


    const hours =
        fireState.mode === "24h"
        ?
        24
        :
        120;


    const start =
        new Date(
            now.getTime()
            -
            hours *
            60 *
            60 *
            1000
        );


    return fireState.fires.filter(
        fire => {

            const time =
                fireUTCDateTime(
                    fire
                );


            if(
                !time
            ){

                return false;

            }


            return (
                time >= start &&
                time <= now
            );

        }
    );

}


/* =========================
   CURRENT VISIBLE FIRES
========================= */

function getVisibleFires(){

    const timeFiltered =
        getTimeFilteredFires();


    return applyAreaFilter(
        timeFiltered
    );

}


/* =========================
   FIRE POPUP
========================= */

function createFirePopup(
    fire
){

    const sensor =
        fireSensor(
            fire
        );


    const date =
        fire.iran_date ||
        fire.archive_date ||
        fire.acq_date ||
        "---";


    const lat =
        Number(
            fire.latitude
        );


    const lon =
        Number(
            fire.longitude
        );


    const areas =
        Number.isFinite(lat) &&
        Number.isFinite(lon)

        ?

        findAreasAtPoint(
            lat,
            lon
        )

        :

        {
            protected: [],
            hunting: []
        };


    let areaHTML =
        "";


    if(
        areas.protected.length
    ){

        areaHTML += `

            <div class="row">

                <span class="label">
                    مناطق چهارگانه:
                </span>

                <span class="area-name">
                    ${areas.protected.join("، ")}
                </span>

            </div>

        `;

    }


    if(
        areas.hunting.length
    ){

        areaHTML += `

            <div class="row">

                <span class="label">
                    شکار ممنوع:
                </span>

                <span class="area-name">
                    ${areas.hunting.join("، ")}
                </span>

            </div>

        `;

    }


    if(
        !areas.protected.length &&
        !areas.hunting.length
    ){

        areaHTML += `

            <div class="row">

                <span class="label">
                    محدوده:
                </span>

                خارج از مناطق چهارگانه و شکار ممنوع

            </div>

        `;

    }


    return `

        <div class="fire-popup">

            <h3>
                🔥 حریق استان فارس
            </h3>


            <div class="row">

                <span class="label">
                    سنجنده:
                </span>

                ${sensor}

            </div>


            <div class="row">

                <span class="label">
                    ماهواره:
                </span>

                ${fire.satellite || "---"}

            </div>


            <div class="row">

                <span class="label">
                    تاریخ ایران:
                </span>

                ${shamsiDate(date)}

            </div>


            <div class="row">

                <span class="label">
                    ساعت ایران:
                </span>

                ${fa(
                    iranTime(fire)
                )}

            </div>


            <div class="row">

                <span class="label">
                    زمان:
                </span>

                ${getTimeLabel(fire)}

            </div>


            ${areaHTML}


            <div class="row">

                <span class="label">
                    FRP:
                </span>

                ${fire.frp || "---"} MW

            </div>


            <div class="row">

                <span class="label">
                    Confidence:
                </span>

                ${fire.confidence || "---"}

            </div>


            <div class="row">

                <span class="label">
                    مختصات:
                </span>

                ${Number(
                    fire.latitude
                ).toFixed(5)}

                ،

                ${Number(
                    fire.longitude
                ).toFixed(5)}

            </div>

        </div>

    `;

}


/* =========================
   CREATE FIRE MARKER
========================= */

function createFireMarker(
    fire
){

    const lat =
        Number(
            fire.latitude
        );


    const lon =
        Number(
            fire.longitude
        );


    if(
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ){

        return null;

    }


    const sensor =
        fireSensor(
            fire
        );


    const marker =
        L.circleMarker(
            [
                lat,
                lon
            ],
            {

                pane:
                    "firePane",

                radius:
                    8,

                color:
                    "#6d0000",

                weight:
                    2,

                fillColor:
                    sensorColor(
                        sensor
                    ),

                fillOpacity:
                    .95

            }
        );


    marker.bindPopup(
        createFirePopup(
            fire
        )
    );


    return marker;

}


/* =========================
   RENDER FIRES
========================= */

function renderFires(
    fires
){

    const layer =
        getFireLayer();


    if(
        !layer
    ){

        return;

    }


    layer.clearLayers();


    fires.forEach(
        fire => {

            const marker =
                createFireMarker(
                    fire
                );


            if(
                marker
            ){

                marker.addTo(
                    layer
                );

            }

        }
    );

}


/* =========================
   REFRESH CURRENT DISPLAY
========================= */

function refreshFireDisplay(){

    const fires =
        getVisibleFires();


    renderFires(
        fires
    );


    const counter =
        $("fireCount");


    if(
        counter
    ){

        counter.textContent =
            fa(
                fires.length
            );

    }

}


/* =========================
   SET MODE
========================= */

function setFireMode(
    mode
){

    if(
        mode !== "24h" &&
        mode !== "5days"
    ){

        return;

    }


    fireState.mode =
        mode;


    refreshFireDisplay();

}


/* =========================
   INIT FIRE BUTTONS
========================= */

function initFireControls(){

    const buttons =
        document.querySelectorAll(
            ".mode-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const mode =
                        button.dataset.mode;


                    setFireMode(
                        mode
                    );


                    buttons.forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =========================
   GET CURRENT COUNT
========================= */

function getCurrentFireCount(){

    return getVisibleFires()
        .length;

}


/* =========================
   GET CURRENT DATA
========================= */

function getCurrentVisibleFires(){

    return getVisibleFires();

}
