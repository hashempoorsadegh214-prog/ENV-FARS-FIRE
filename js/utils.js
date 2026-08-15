const $ =
    id =>
        document.getElementById(id);


async function getText(
    url
){

    const response =
        await fetch(
            url +
            "?v=" +
            Date.now()
        );


    if(
        !response.ok
    ){

        throw new Error(
            "خطا در دریافت فایل: " +
            url
        );

    }


    return response.text();

}


function fa(
    value
){

    return String(value)

        .replace(/0/g,"۰")
        .replace(/1/g,"۱")
        .replace(/2/g,"۲")
        .replace(/3/g,"۳")
        .replace(/4/g,"۴")
        .replace(/5/g,"۵")
        .replace(/6/g,"۶")
        .replace(/7/g,"۷")
        .replace(/8/g,"۸")
        .replace(/9/g,"۹");

}


/* =========================
   CSV
========================= */

function parseCSV(
    text
){

    text =
        text
            .replace(
                /^\uFEFF/,
                ""
            )
            .trim();


    if(
        !text
    ){

        return {
            headers:[],
            rows:[]
        };

    }


    const lines =
        text.split(
            /\r?\n/
        );


    const headers =
        lines[0]
            .split(",")
            .map(
                h =>
                    h
                        .trim()
                        .toLowerCase()
            );


    const rows=[];


    for(
        let i=1;
        i<lines.length;
        i++
    ){

        if(
            !lines[i].trim()
        ){

            continue;

        }


        const values =
            lines[i].split(",");


        const row={};


        headers.forEach(
            (
                header,
                index
            ) => {

                row[header] =
                    values[index] !== undefined
                    ?
                    values[index].trim()
                    :
                    "";

            }
        );


        rows.push(
            row
        );

    }


    return {
        headers,
        rows
    };

}


/* =========================
   JALALI
========================= */

function gregorianToJalali(
    gy,
    gm,
    gd
){

    const gdm=[
        0,31,59,90,120,151,
        181,212,243,273,304,334
    ];


    let jy;


    if(
        gy > 1600
    ){

        jy = 979;

        gy -= 1600;

    }else{

        jy = 0;

        gy -= 621;

    }


    const gy2 =
        gm > 2
        ?
        gy + 1
        :
        gy;


    let days =
        365 * gy
        +
        Math.floor(
            (gy2 + 3) / 4
        )
        -
        Math.floor(
            (gy2 + 99) / 100
        )
        +
        Math.floor(
            (gy2 + 399) / 400
        )
        -
        80
        +
        gd
        +
        gdm[
            gm - 1
        ];


    jy +=
        33 *
        Math.floor(
            days / 12053
        );


    days %= 12053;


    jy +=
        4 *
        Math.floor(
            days / 1461
        );


    days %= 1461;


    if(
        days > 365
    ){

        jy +=
            Math.floor(
                (days - 1) / 365
            );


        days =
            (days - 1) % 365;

    }


    let jm;
    let jd;


    if(
        days < 186
    ){

        jm =
            1 +
            Math.floor(
                days / 31
            );


        jd =
            1 +
            days % 31;

    }else{

        jm =
            7 +
            Math.floor(
                (days - 186) / 30
            );


        jd =
            1 +
            (days - 186) % 30;

    }


    return [
        jy,
        jm,
        jd
    ];

}


function shamsiDate(
    date
){

    if(
        !date
    ){

        return "---";

    }


    const parts =
        String(date)
            .split("-");


    if(
        parts.length !== 3
    ){

        return date;

    }


    const j =
        gregorianToJalali(
            Number(parts[0]),
            Number(parts[1]),
            Number(parts[2])
        );


    const months = [

        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند"

    ];


    return (
        fa(j[2])
        +
        " "
        +
        months[j[1] - 1]
        +
        " "
        +
        fa(j[0])
    );

}


/* =========================
   FIRE TIME
========================= */

function fireUTCDateTime(
    fire
){

    if(
        !fire.acq_date ||
        !fire.acq_time
    ){

        return null;

    }


    const date =
        fire.acq_date.split("-");


    const time =
        String(
            fire.acq_time
        )
        .replace(
            /\D/g,
            ""
        )
        .padStart(
            4,
            "0"
        );


    return new Date(
        Date.UTC(
            Number(date[0]),
            Number(date[1]) - 1,
            Number(date[2]),
            Number(
                time.slice(0,2)
            ),
            Number(
                time.slice(2,4)
            ),
            0
        )
    );

}


function iranTime(
    fire
){

    const utc =
        fireUTCDateTime(
            fire
        );


    if(
        !utc
    ){

        return "---";

    }


    const iran =
        new Date(
            utc.getTime()
            +
            3.5 *
            60 *
            60 *
            1000
        );


    return (
        String(
            iran.getUTCHours()
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
        String(
            iran.getUTCMinutes()
        ).padStart(
            2,
            "0"
        )
    );

}


function getTimeLabel(
    fire
){

    const time =
        iranTime(
            fire
        );


    if(
        time === "---"
    ){

        return "---";

    }


    const hour =
        Number(
            time.slice(
                0,
                2
            )
        );


    if(
        hour < 6
    ){

        return "بامداد";

    }


    const dn =
        String(
            fire.daynight ||
            ""
        )
        .trim()
        .toUpperCase();


    if(
        dn === "D"
    ){

        return "روز";

    }


    if(
        dn === "N"
    ){

        return "شب";

    }


    return "---";

}


/* =========================
   SENSOR
========================= */

function getSensor(
    fire
){

    const value =
        String(
            fire.detected_sensor ||
            fire.instrument ||
            ""
        )
        .trim()
        .toUpperCase();


    if(
        value.includes("VIIRS")
    ){

        return "VIIRS";

    }


    if(
        value.includes("MODIS")
    ){

        return "MODIS";

    }


    return "UNKNOWN";

}


function sensorColor(
    sensor
){

    if(
        sensor === "VIIRS"
    ){

        return "#ff1744";

    }


    if(
        sensor === "MODIS"
    ){

        return "#ff9800";

    }


    return "#8e24aa";

}


/* =========================
   STATUS TIME
========================= */

function ageText(
    timestamp
){

    if(
        !timestamp
    ){

        return "در انتظار اطلاعات";

    }


    const seconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now()
                    -
                    timestamp
                )
                /
                1000
            )
        );


    const hours =
        Math.floor(
            seconds /
            3600
        );


    const minutes =
        Math.floor(
            (
                seconds %
                3600
            )
            /
            60
        );


    const sec =
        seconds %
        60;


    if(
        hours > 0
    ){

        return (
            fa(hours)
            +
            " ساعت و "
            +
            fa(minutes)
            +
            " دقیقه پیش"
        );

    }


    return (
        fa(minutes)
        +
        " دقیقه و "
        +
        fa(sec)
        +
        " ثانیه پیش"
    );

}
