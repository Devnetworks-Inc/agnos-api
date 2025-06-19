const { differenceInSeconds } = require("date-fns");

const a = differenceInSeconds('2025-06-17T21:59:59.999Z', '2025-06-17T05:00:00.000Z')
console.log(a)