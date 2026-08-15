/* =========================
   STATUS STATE
========================= */

const statusState = {

    systemTimestamp:
        null

};


/* =========================
   FIND LATEST SENSOR
========================= */

function getLatestSensorObservation(){

    let latest =
        null;


    const fires =
        getAllFires();


    fires.forEach(
        fire => {

            const time =
                fireUTCDateTime(
                    fire
                );


            if(
                !time
            ){

                return;

            }


            if(
                !latest ||
                time > latest
            ){

                latest =
                    time;

            }

        }
    );


    return latest;

}


/* =========================
   LOAD SYSTEM UPDATE
========================= */

async function loadSystemUpdate(){

    try{

        const data =
            JSON.parse(
                await getText(
                    CONFIG.updateInfo
                )
            );


        const timestamp =
            Number(
                data.updated_at_timestamp
            );


        if(
            Number.isFinite(
                timestamp
            )
        ){

            statusState.systemTimestamp =
                timestamp * 1000;

        }

    }catch(error){

        console.warn(
            "خطا در update-info.json:",
            error
        );

    }

}


/* =========================
   UPDATE STATUS TEXT
========================= */

function updateStatus(){

    const sensorTime =
        getLatestSensorObservation();


    /*
       آخرین مشاهده حریق توسط سنجنده
    */

    if(
        sensorTime
    ){

        const sensorElement =
            $("sensorAge");


        if(
            sensorElement
        ){

            sensorElement.textContent =
                "آخرین مشاهده حریق توسط سنجنده: "
                +
                ageText(
                    sensorTime.getTime()
                );

        }

    }


    /*
       آخرین به‌روزرسانی سامانه
    */

    if(
        statusState.systemTimestamp
    ){

        const systemElement =
            $("systemAge");


        if(
            systemElement
        ){

            systemElement.textContent =
                "آخرین به‌روزرسانی سامانه: "
                +
                ageText(
                    statusState.systemTimestamp
                );

        }

    }

}


/* =========================
   START STATUS CLOCK
========================= */

function startStatusClock(){

    updateStatus();


    setInterval(
        updateStatus,
        1000
    );

}
