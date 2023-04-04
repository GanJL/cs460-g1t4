// operational ranges
const sunlight_analog_min = 255
const sunlight_analog_max = 6 

const moisture_analog_dry = 240                                  
const moisture_analog_damp = 200
const moisture_analog_wet = 212
const moisture_reference = moisture_analog_dry - (moisture_analog_dry - moisture_analog_wet)/4

const reservoir_analog_full = 147 
const reservoir_analog_min = 10 



export function SunlightFormat(input) {

    // to out of boundary data
    if (input < 6) {
        input = 255
    }
    else if (input > 230) {
        input = 255
    }

    var output = (Math.abs(input - sunlight_analog_min)) / (sunlight_analog_min-sunlight_analog_max)
    
    // to out of boundary data
    if (output > 1) {
        output = 1
    } 
    return (output * 100).toFixed(0);
}

export function MoistureFormat(input) {

    // to out of boundary data
    if (input > moisture_analog_dry) {
        return 0;
    }

    var output = (moisture_analog_dry - input) / (moisture_analog_dry-moisture_analog_wet)
    
    // to out of boundary data
    if (output > 1) {
        output = 1
    }
    if (output < 0) {
        output = 0
    }

    return (output * 100).toFixed(0);
}

export function MoistureFormat2(input) {

    var output = (moisture_analog_dry-moisture_analog_wet)*(input / 100)

    return (moisture_analog_dry - output)
}


export function ReservoirFormat(input) {

    // to out of boundary data
    if (input < reservoir_analog_min) {
        return 0;
    }
    else if (input >= reservoir_analog_full) {
        return 100;
    }
    else {
        return ((input/(reservoir_analog_full)) * 100).toFixed(0);
    }
}

export function ReservoirFormat2(input) {
    return input/100*(reservoir_analog_full)
    
}


export const chart_data_url = "http://192.168.68.63:8088/getalldata"
export const live_data_url = "http://192.168.68.63:8089/"
export const watering_url = "http://192.168.68.63:8087/"