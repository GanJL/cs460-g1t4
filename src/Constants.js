// operational ranges
const sunlight_analog_min = 255 // 255 is room light
const sunlight_analog_max = 6 // 6 is direct sunlight
const moisture_analog_dry = 246 // 230 is 100% dry
const moisture_analog_damp_cloth = 220
const moisture_analog_wet = 205 // 200 is 100% wet
const reservoir_analog_full = 125 // 125 is 100% full
const reservoir_analog_70 = 110 
const reservoir_analog_50 = 100 
const reservoir_analog_30 = 80
const reservoir_analog_20 = 70 
const reservoir_analog_1 = 30 
export function SunlightFormat(input) {

    // to prevent rogue readings
    if (input < 6) {
        input = 255
    }

    var output = (Math.abs(input - sunlight_analog_min)) / (sunlight_analog_min-sunlight_analog_max)
    if (output > 1) {
        output = 1
    } 
    return (output * 100).toFixed(0);
}
// const moisture_analog_dry = 245
// const moisture_analog_damp_cloth = 220
// const moisture_analog_wet = 205 
export function MoistureFormat(input) {
    // to prevent rogue readings
    if (input < moisture_analog_wet) {
        input = moisture_analog_dry
    }
    var output = (moisture_analog_dry - input) / (moisture_analog_dry-moisture_analog_wet)
    if (output > 1) {
        output = 1
    }
    return (output * 100).toFixed(0);
}

export function MoistureFormat2(input) {

    var output = (moisture_analog_dry-moisture_analog_wet)*(input / 100)

    return (moisture_analog_dry - output)
}

// const reservoir_analog_full = 125 // 125 is 100% full
// const reservoir_analog_70 = 110 
// const reservoir_analog_50 = 100 
// const reservoir_analog_30 = 80
// const reservoir_analog_20 = 70 
// const reservoir_analog_1 = 30 
export function ReservoirFormat(input) {
    if (input < reservoir_analog_1) {
        return 0;
    }
    else if (input >= reservoir_analog_full) {
        return 100;
    }
    else {
        return ((input/(reservoir_analog_full)) * 100).toFixed(0);
    }
}


export const chart_data_url = "http://192.168.68.64:8088/getalldata"
export const live_data_url = "http://192.168.68.64:8089/"
export const watering_url = "http://192.168.68.64:8087/"