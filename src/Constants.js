// operational ranges
const sunlight_analog_min = 255 // 255 is room light
const sunlight_analog_max = 6 // 6 is direct sunlight
const moisture_analog_dry = 230 // 230 is 100% dry
const moisture_analog_wet = 190 // 200 is 100% wet
const reservour_analog_full = 120 // 120 is 100% full
const reservour_analog_empty = 0 // 0 is 100% empty

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

export function MoistureFormat(input) {
    // to prevent rogue readings
    if (input < 190) {
        input = 233
    }
    var output = (Math.abs(input - moisture_analog_dry)) / (moisture_analog_dry-moisture_analog_wet)
    if (output > 1) {
        output = 1
    }
    return (output * 100).toFixed(0);
}

export function MoistureFormat2(input) {

    var output = (moisture_analog_dry-moisture_analog_wet)*(input / 100)

    return (moisture_analog_dry - output)
}

// 120 is 100% full and 0 is 100% empty
export function ReservoirFormat(input) {
    return (((input-reservour_analog_empty)/reservour_analog_full) * 100).toFixed(0);
}

