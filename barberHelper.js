const Axios = require('axios');
const BEARER = process.env.BEARER;
const GET_ALL_URL = process.env.GET_ALL_URL;
const GET_WORKING_DAYS_BY_BARBER_ID = process.env.GET_WORKING_DAYS_BY_BARBER_ID;
const GET_BARBER_TIMESLOT_URL = process.env.GET_BARBER_TIMESLOT_URL;
const CONFIG = {
    headers: {
        authorization: BEARER,
    }
};

class BarberHelper {
    async getBarbers(internOnly = false) {
        try {
            const response = await Axios.get(GET_ALL_URL, CONFIG);
            const data = response.data;
            const barbers = data
                .filter(i => internOnly ? i.specialization == "Intern" && i.bookable : i.bookable)
                .map(i => ({ id: i.id, name: i.name, rating: i.rating, comments_count: i.comments_count }))
            return barbers;
        } catch (error) {
            console.error(error);
        }
    }

    async getBarbersAvailableDates(barberId) {
        try {
            const barbeBookingDates = await Axios.get(`${GET_WORKING_DAYS_BY_BARBER_ID}${barberId}`, CONFIG)
            const onlyBookableDates = barbeBookingDates
                .data
                .booking_dates;
            return onlyBookableDates;
        } catch (error) {
            console.error(error);
        }
    }

    async getBarbersAvailableDatesTimeSlots(barberId, date) {
        try {
            const barbeBookingTImeSlots = await Axios.get(`${GET_BARBER_TIMESLOT_URL.replace('{barber_id}', barberId).replace('{booking_date}', date)}`, CONFIG)
            const timeslots = barbeBookingTImeSlots
                .data
                .filter(i => i.time.endsWith("00") || i.time.endsWith("30"))
                .map(i => i.time);
            return timeslots;
        } catch (error) {
            console.error(error);
        }
    }

}

module.exports = new BarberHelper();