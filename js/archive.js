/* =========================
   ARCHIVE STATE
========================= */

const archiveState = {

    dates:
        [],

    currentDate:
        null

};


/* =========================
   LOAD ARCHIVE INDEX
========================= */

async function loadArchiveIndex(){

    try{

        const data =
            JSON.parse(
                await getText(
                    CONFIG.archiveIndex
                )
            );


        const index =
            Array.isArray(data)

            ?

            data

            :

            Array.isArray(
                data.dates
            )

            ?

            data.dates

            :

            [];


        archiveState.dates =
            index

                .map(
                    item =>
                        typeof item === "string"

                        ?

                        item

                        :

                        item.date
                )

                .filter(
                    Boolean
                )

                .sort();

    }catch(error){

        console.warn(
            "خطا در بارگذاری archive/index.json:",
            error
        );


        archiveState.dates =
            [];

    }


    configureArchiveSlider();

}


/* =========================
   CONFIGURE SLIDER
========================= */

function configureArchiveSlider(){

    const slider =
        $("archiveSlider");


    if(
        !slider
    ){

        return;

    }


    slider.min =
        0;


    slider.max =
        Math.max(
            archiveState.dates.length - 1,
            0
        );


    const latestIndex =
        Math.max(
            archiveState.dates.length - 1,
            0
        );


    slider.value =
        latestIndex;


    updateArchiveDisplay();

}


/* =========================
   CURRENT DATE
========================= */

function getCurrentArchiveDate(){

    const slider =
        $("archiveSlider");


    if(
        !slider
    ){

        return null;

    }


    const index =
        Number(
            slider.value
        );


    return (
        archiveState.dates[index]
        ||
        null
    );

}


/* =========================
   GET ARCHIVE FIRES
========================= */

function getArchiveFires(
    date
){

    if(
        !date
    ){

        return [];

    }


    return fireState.fires.filter(
        fire => {

            const fireDate =
                fire.archive_date
                ||
                fire.acq_date
                ||
                "";


            return (
                fireDate ===
                date
            );

        }
    );

}


/* =========================
   DISPLAY SLIDER TEXT
========================= */

function updateArchiveDisplay(){

    const date =
        getCurrentArchiveDate();


    if(
        !date
    ){

        $("sliderDate")
            .textContent =
                "---";


        $("sliderCount")
            .textContent =
                "تعداد رخداد: ۰";


        return;

    }


    archiveState.currentDate =
        date;


    const fires =
        getArchiveFires(
            date
        );


    $("sliderDate")
        .textContent =
            shamsiDate(
                date
            );


    $("sliderCount")
        .textContent =
            "تعداد رخداد: "
            +
            fa(
                fires.length
            );

}


/* =========================
   SHOW ARCHIVE DATE
========================= */

function showArchiveDate(
    date
){

    if(
        !date
    ){

        return;

    }


    archiveState.currentDate =
        date;


    /*
       وقتی روی آرشیو هستیم،
       نمایش حریق‌ها باید دقیقاً
       مربوط به همان تاریخ باشد.
    */

    const fires =
        applyAreaFilter(
            getArchiveFires(
                date
            )
        );


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


    updateArchiveDisplay();

}


/* =========================
   ARCHIVE SLIDER EVENTS
========================= */

function initArchiveControls(){

    const slider =
        $("archiveSlider");


    if(
        !slider
    ){

        return;

    }


    /*
       هنگام حرکت اسلایدر
       فقط تاریخ را نشان می‌دهیم.
    */

    slider.addEventListener(
        "input",
        () => {

            updateArchiveDisplay();

        }
    );


    /*
       وقتی کاربر اسلایدر را رها کرد،
       همان تاریخ روی نقشه نمایش داده شود.
    */

    slider.addEventListener(
        "change",
        () => {

            const date =
                getCurrentArchiveDate();


            if(
                date
            ){

                showArchiveDate(
                    date
                );

            }

        }
    );

}


/* =========================
   SET LATEST ARCHIVE
========================= */

function showLatestArchive(){

    if(
        archiveState.dates.length === 0
    ){

        return;

    }


    const slider =
        $("archiveSlider");


    const latestIndex =
        archiveState.dates.length - 1;


    slider.value =
        latestIndex;


    const latestDate =
        archiveState.dates[
            latestIndex
        ];


    showArchiveDate(
        latestDate
    );

}


/* =========================
   SET ARCHIVE BY INDEX
========================= */

function showArchiveIndex(
    index
){

    if(
        index < 0 ||
        index >= archiveState.dates.length
    ){

        return;

    }


    const slider =
        $("archiveSlider");


    slider.value =
        index;


    showArchiveDate(
        archiveState.dates[index]
    );

}


/* =========================
   CHECK ARCHIVE MODE
========================= */

function isArchiveMode(){

    return (
        archiveState.currentDate !==
        null
    );

}
