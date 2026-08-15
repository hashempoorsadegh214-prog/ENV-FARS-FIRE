/* =========================
   FIRE STATE
========================= */

const fireState = {

    fires: [],

    archiveHeaders: [],

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

    if(
        fireState.fires.length > 0
    ){

        return;

    }


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

    }

}


/* =========================
   SET FIRE DATA
========================= */

function setFireData(
    rows,
    headers=[]
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
   GET ALL FIRES
========================= */

function getAllFires(){

    return fireState.fires;

}


/* =========================
   GET TIME FILTERED FIRES
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
   GET VISIBLE FIRES
========================= */

function getVisibleFires(){

    const timeFiltered =
        getTimeFilteredFires();


    return applyAreaFilter(
        timeFiltered
    );

}


/* =========================
   POPUP
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
            protected:[],
            hunting:[]
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
                    iranTime(
                        fire
                    )
                )}

            </div>


            <div class="row">

                <span class="label">
                    زمان:
                </span>

                ${getTimeLabel(
                    fire
                )}

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
   REFRESH DISPLAY
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
                                item ===
                                button
                            );

                        }

                    );

                }
            );

        }
    );

}


/* =========================
   GET CURRENT FIRE COUNT
========================= */

function getCurrentFireCount(){

    return getVisibleFires()
        .length;

}


/* =========================
   GET CURRENT FIRE DATA
========================= */

function getCurrentVisibleFires(){

    return getVisibleFires();

}
